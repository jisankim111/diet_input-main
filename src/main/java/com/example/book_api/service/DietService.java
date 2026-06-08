package com.example.book_api.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.book_api.client.DietAnalysisClient;
import com.example.book_api.model.AnalysisResult;
import com.example.book_api.model.DaySummary;
import com.example.book_api.model.DietAnalysisResponse;
import com.example.book_api.model.DietDayResponse;
import com.example.book_api.model.DietMonthSummaryResponse;
import com.example.book_api.model.DietRecord;
import com.example.book_api.model.EstimatedFood;
import com.example.book_api.model.HomeResponse;

@Service
public class DietService {

    private final DietAnalysisClient dietAnalysisClient;
    private final ExerciseService exerciseService;
    private final Map<String, List<DietRecord>> dietStore = new ConcurrentHashMap<>();

    public DietService(DietAnalysisClient dietAnalysisClient, ExerciseService exerciseService) {
        this.dietAnalysisClient = dietAnalysisClient;
        this.exerciseService = exerciseService;
    }

    public HomeResponse getHomeInfo() {
        return new HomeResponse(
                "input-service",
                "날짜별 식단 사진을 업로드하고 AI 분석 결과를 저장할 수 있는 서비스입니다.",
                "GET /api/home, POST /api/diets/photo, GET /api/diets/{date}");
    }

    public DietRecord saveDietRecord(String date, MultipartFile image) {
        DietAnalysisResponse analysisResponse = analyzeImage(image);

        String imageName = image.getOriginalFilename() == null ? "uploaded-image.jpg" : image.getOriginalFilename();
        DietRecord record = new DietRecord(imageName, analysisResponse.getEstimatedFoods(), analysisResponse.getAnalysisResult());

        dietStore.computeIfAbsent(date, key -> Collections.synchronizedList(new ArrayList<>())).add(record);
        return record;
    }

    public DietDayResponse getDietRecordsByDate(String date) {
        List<DietRecord> records = dietStore.getOrDefault(date, Collections.emptyList());
        return new DietDayResponse(date, new ArrayList<>(records));
    }

    public DietMonthSummaryResponse getMonthSummary(String month) {
        Map<String, Integer> burnedCaloriesByDate = exerciseService.getBurnedCaloriesByMonth(month);
        Map<String, Long> exerciseCountByDate = exerciseService.getExerciseCountByMonth(month);
        Set<String> dates = new HashSet<>();
        dates.addAll(dietStore.keySet().stream()
                .filter(date -> date.startsWith(month + "-"))
                .collect(Collectors.toSet()));
        dates.addAll(burnedCaloriesByDate.keySet());

        List<DaySummary> summaries = dates.stream()
                .map(date -> {
                    List<DietRecord> records = dietStore.getOrDefault(date, Collections.emptyList());
                    int calories = records.stream()
                            .map(DietRecord::getAnalysisResult)
                            .filter(result -> result != null)
                            .mapToInt(AnalysisResult::getTotalCalories)
                            .sum();
                    int burnedCalories = burnedCaloriesByDate.getOrDefault(date, 0);
                    int exerciseCount = exerciseCountByDate.getOrDefault(date, 0L).intValue();
                    return new DaySummary(date, records.size(), calories, burnedCalories, exerciseCount);
                })
                .sorted(Comparator.comparing(DaySummary::getDate))
                .collect(Collectors.toList());
        return new DietMonthSummaryResponse(month, summaries);
    }

    private DietAnalysisResponse analyzeImage(MultipartFile image) {
        return dietAnalysisClient.analyzePhoto(image);
    }
}
