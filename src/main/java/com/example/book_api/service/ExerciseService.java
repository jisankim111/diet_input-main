package com.example.book_api.service;

import java.util.Collections;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.book_api.client.ExerciseAnalysisClient;
import com.example.book_api.model.Exercise;

@Service
public class ExerciseService {

    private final ExerciseAnalysisClient exerciseAnalysisClient;
    private final Map<String, List<Exercise>> localFallbackStore = new ConcurrentHashMap<>();

    public ExerciseService(ExerciseAnalysisClient exerciseAnalysisClient) {
        this.exerciseAnalysisClient = exerciseAnalysisClient;
    }

    public List<Exercise> getExercisesByDate(String date) {
        try {
            List<Exercise> exercises = exerciseAnalysisClient.getExercisesByDate(date);
            List<Exercise> result = exercises != null ? new ArrayList<>(exercises) : new ArrayList<>();
            result.addAll(localFallbackStore.getOrDefault(date, Collections.emptyList()));
            return result;
        } catch (Exception e) {
            return new ArrayList<>(localFallbackStore.getOrDefault(date, Collections.emptyList()));
        }
    }

    public Exercise addExercise(Exercise exercise) {
        try {
            return exerciseAnalysisClient.addExercise(exercise);
        } catch (Exception e) {
            if (exercise.getDate() != null) {
                localFallbackStore
                        .computeIfAbsent(exercise.getDate().toString(), key -> Collections.synchronizedList(new ArrayList<>()))
                        .add(exercise);
            }
            return exercise;
        }
    }

    public boolean deleteExercise(String date, int index) {
        try {
            List<Exercise> remoteExercises = exerciseAnalysisClient.getExercisesByDate(date);
            int remoteSize = remoteExercises == null ? 0 : remoteExercises.size();
            if (index < remoteSize) {
                exerciseAnalysisClient.deleteExercise(date, index);
                return true;
            }
            return deleteLocalExercise(date, index - remoteSize);
        } catch (Exception e) {
            return deleteLocalExercise(date, index);
        }
    }

    public Map<String, Integer> getBurnedCaloriesByMonth(String month) {
        try {
            List<Exercise> all = exerciseAnalysisClient.getAllExercises();
            if (all == null) {
                return Collections.emptyMap();
            }
            Map<String, Integer> remote = all.stream()
                    .filter(exercise -> exercise.getDate() != null
                            && exercise.getDate().toString().startsWith(month + "-"))
                    .collect(Collectors.groupingBy(
                            exercise -> exercise.getDate().toString(),
                            Collectors.summingInt(Exercise::getCaloriesBurned)));
            mergeLocalBurnedCalories(month, remote);
            return remote;
        } catch (Exception e) {
            Map<String, Integer> local = new ConcurrentHashMap<>();
            mergeLocalBurnedCalories(month, local);
            return local;
        }
    }

    public Map<String, Long> getExerciseCountByMonth(String month) {
        try {
            List<Exercise> all = exerciseAnalysisClient.getAllExercises();
            if (all == null) {
                return Collections.emptyMap();
            }
            Map<String, Long> remote = all.stream()
                    .filter(exercise -> exercise.getDate() != null
                            && exercise.getDate().toString().startsWith(month + "-"))
                    .collect(Collectors.groupingBy(
                            exercise -> exercise.getDate().toString(),
                            Collectors.counting()));
            mergeLocalExerciseCounts(month, remote);
            return remote;
        } catch (Exception e) {
            Map<String, Long> local = new ConcurrentHashMap<>();
            mergeLocalExerciseCounts(month, local);
            return local;
        }
    }

    private void mergeLocalBurnedCalories(String month, Map<String, Integer> target) {
        localFallbackStore.entrySet().stream()
                .filter(entry -> entry.getKey().startsWith(month + "-"))
                .forEach(entry -> target.merge(
                        entry.getKey(),
                        entry.getValue().stream().mapToInt(Exercise::getCaloriesBurned).sum(),
                        Integer::sum));
    }

    private void mergeLocalExerciseCounts(String month, Map<String, Long> target) {
        localFallbackStore.entrySet().stream()
                .filter(entry -> entry.getKey().startsWith(month + "-"))
                .forEach(entry -> target.merge(entry.getKey(), (long) entry.getValue().size(), Long::sum));
    }

    private boolean deleteLocalExercise(String date, int index) {
        List<Exercise> local = localFallbackStore.get(date);
        if (local == null || index < 0 || index >= local.size()) {
            return false;
        }
        local.remove(index);
        return true;
    }
}
