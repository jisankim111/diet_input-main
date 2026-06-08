package com.example.book_api.contoller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.book_api.model.Exercise;
import com.example.book_api.service.ExerciseService;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseRestController {

    private final ExerciseService exerciseService;

    public ExerciseRestController(ExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }

    @GetMapping("/{date}")
    public ResponseEntity<List<Exercise>> getExercisesByDate(@PathVariable String date) {
        if (date == null || date.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(exerciseService.getExercisesByDate(date));
    }

    @PostMapping
    public ResponseEntity<Exercise> addExercise(@RequestBody Exercise exercise) {
        if (exercise == null || exercise.getExerciseName() == null || exercise.getExerciseName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(exerciseService.addExercise(exercise));
    }

    @DeleteMapping("/{date}/{index}")
    public ResponseEntity<Void> deleteExercise(@PathVariable String date, @PathVariable int index) {
        if (date == null || date.isBlank() || index < 0) {
            return ResponseEntity.badRequest().build();
        }
        boolean deleted = exerciseService.deleteExercise(date, index);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
