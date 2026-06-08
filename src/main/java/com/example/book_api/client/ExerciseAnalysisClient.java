package com.example.book_api.client;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.example.book_api.model.Exercise;

@FeignClient(name = "diet-analysis-service", url = "${analysis.service.url:}", contextId = "exerciseAnalysisClient")
public interface ExerciseAnalysisClient {

    @GetMapping("/api/exercise")
    List<Exercise> getAllExercises();

    @GetMapping("/api/exercise/date/{date}")
    List<Exercise> getExercisesByDate(@PathVariable("date") String date);

    @GetMapping("/api/exercise/calories/date/{date}")
    Integer getBurnedCaloriesByDate(@PathVariable("date") String date);

    @PostMapping(value = "/api/exercise", consumes = MediaType.APPLICATION_JSON_VALUE)
    Exercise addExercise(@RequestBody Exercise exercise);

    @DeleteMapping("/api/exercise/date/{date}/{index}")
    void deleteExercise(@PathVariable("date") String date, @PathVariable("index") int index);
}
