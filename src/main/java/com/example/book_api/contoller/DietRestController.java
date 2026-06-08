package com.example.book_api.contoller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.book_api.model.DietDayResponse;
import com.example.book_api.model.DietMonthSummaryResponse;
import com.example.book_api.model.DietRecord;
import com.example.book_api.model.HomeResponse;
import com.example.book_api.service.DietService;

@RestController
@RequestMapping("/api")
public class DietRestController {

    private final DietService dietService;

    public DietRestController(DietService dietService) {
        this.dietService = dietService;
    }

    @GetMapping("/home")
    public HomeResponse getHome() {
        return dietService.getHomeInfo();
    }

    @PostMapping(value = "/diets/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DietRecord> uploadDietPhoto(
            @RequestParam("date") String date,
            @RequestParam("image") MultipartFile image) {
        if (date == null || date.isBlank() || image == null || image.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        DietRecord saved = dietService.saveDietRecord(date, image);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/diets")
    public ResponseEntity<DietMonthSummaryResponse> getDietMonthSummary(@RequestParam("month") String month) {
        if (month == null || month.isBlank() || !month.matches("\\d{4}-\\d{2}")) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(dietService.getMonthSummary(month));
    }

    @GetMapping("/diets/{date}")
    public ResponseEntity<DietDayResponse> getDietRecords(@PathVariable String date) {
        if (date == null || date.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(dietService.getDietRecordsByDate(date));
    }
}
