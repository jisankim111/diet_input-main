package com.example.diet_analysis.controller;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.diet_analysis.model.Exercise;

@RestController
@RequestMapping("/api/exercise")
public class ExerciseController {

    private final Map<String, List<Exercise>> exerciseStore = new ConcurrentHashMap<>();

    public ExerciseController() {
        seedSampleExercises();
    }

    @GetMapping
    public ResponseEntity<List<Exercise>> getAllExercises() {
        List<Exercise> exercises = exerciseStore.values().stream()
                .flatMap(List::stream)
                .collect(Collectors.toList());
        return ResponseEntity.ok(exercises);
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<Exercise>> getExercisesByDate(@PathVariable String date) {
        return ResponseEntity.ok(new ArrayList<>(exerciseStore.getOrDefault(date, Collections.emptyList())));
    }

    @GetMapping("/calories/date/{date}")
    public ResponseEntity<Integer> getBurnedCaloriesByDate(@PathVariable String date) {
        int total = exerciseStore.getOrDefault(date, Collections.emptyList()).stream()
                .mapToInt(Exercise::getCaloriesBurned)
                .sum();
        return ResponseEntity.ok(total);
    }

    @PostMapping
    public ResponseEntity<Exercise> addExercise(@RequestBody Exercise exercise) {
        if (exercise.getDate() == null) {
            exercise.setDate(LocalDate.now());
        }
        String date = exercise.getDate().toString();
        exerciseStore.computeIfAbsent(date, key -> Collections.synchronizedList(new ArrayList<>())).add(exercise);
        return ResponseEntity.ok(exercise);
    }

    @DeleteMapping("/date/{date}/{index}")
    public ResponseEntity<Void> deleteExercise(@PathVariable String date, @PathVariable int index) {
        List<Exercise> exercises = exerciseStore.get(date);
        if (exercises == null || index < 0 || index >= exercises.size()) {
            return ResponseEntity.notFound().build();
        }
        exercises.remove(index);
        return ResponseEntity.noContent().build();
    }

    private void seedSampleExercises() {
        LocalDate today = LocalDate.now();
        addSeed(new Exercise("Fast walk", 35, 180, today, "medium"));
        addSeed(new Exercise("Strength training", 25, 140, today.minusDays(1), "high"));
        addSeed(new Exercise("Cycling", 40, 260, today.minusDays(3), "medium"));
    }

    private void addSeed(Exercise exercise) {
        String date = exercise.getDate().toString();
        exerciseStore.computeIfAbsent(date, key -> Collections.synchronizedList(new ArrayList<>())).add(exercise);
    }
}
