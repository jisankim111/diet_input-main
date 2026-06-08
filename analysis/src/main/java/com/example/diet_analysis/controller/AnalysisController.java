package com.example.diet_analysis.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.diet_analysis.model.DietAnalysisResponse;
import com.example.diet_analysis.service.OpenAiVisionNutritionService;

@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {

    private final OpenAiVisionNutritionService nutritionService;

    public AnalysisController(OpenAiVisionNutritionService nutritionService) {
        this.nutritionService = nutritionService;
    }

    @PostMapping(value = "/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DietAnalysisResponse> analyzePhoto(@RequestPart("image") MultipartFile image) {
        return ResponseEntity.ok(nutritionService.analyzePhoto(image));
    }
}
