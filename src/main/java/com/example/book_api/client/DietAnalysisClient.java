package com.example.book_api.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import com.example.book_api.model.DietAnalysisResponse;

@FeignClient(name = "diet-analysis-service", url = "${analysis.service.url:}")
public interface DietAnalysisClient {

    @PostMapping(value = "/api/analysis/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    DietAnalysisResponse analyzePhoto(@RequestPart(value = "image", required = true) MultipartFile image);
}
