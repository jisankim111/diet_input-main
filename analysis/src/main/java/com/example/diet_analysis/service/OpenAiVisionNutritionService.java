package com.example.diet_analysis.service;

import com.example.diet_analysis.config.OpenAiProperties;
import com.example.diet_analysis.model.AnalysisResult;
import com.example.diet_analysis.model.DietAnalysisResponse;
import com.example.diet_analysis.model.EstimatedFood;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class OpenAiVisionNutritionService {
    private static final String PROMPT = String.join("\n",
            "음식 사진을 분석해서 보이는 음식명, 추정 섭취량, 총 칼로리와 탄수화물/단백질/지방(g)을 계산해줘.",
            "반드시 아래 JSON 형식만 반환해. 설명 문장이나 markdown code fence는 쓰지 마.",
            "{",
            "  \"estimatedFoods\": [{\"name\": \"음식명\", \"amount\": 1, \"unit\": \"인분\"}],",
            "  \"analysisResult\": {",
            "    \"totalCalories\": 0,",
            "    \"carbohydrate\": 0,",
            "    \"protein\": 0,",
            "    \"fat\": 0,",
            "    \"feedback\": \"짧은 한국어 피드백\"",
            "  }",
            "}",
            "사진만으로 알 수 없는 부분은 일반적인 1인분 기준으로 합리적으로 추정해.");

    private final OpenAiProperties properties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public OpenAiVisionNutritionService(OpenAiProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public DietAnalysisResponse analyzePhoto(MultipartFile image) {
        if (properties.getApiKey() == null || properties.getApiKey().isBlank()) {
            return mockResponse("OPENAI_API_KEY가 없어 mock 분석 결과를 반환했습니다.");
        }

        try {
            String requestBody = buildRequestBody(image);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(properties.getResponsesUrl()))
                    .timeout(Duration.ofSeconds(45))
                    .header("Authorization", "Bearer " + properties.getApiKey())
                    .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return handleFailure("AI API 호출 실패: HTTP " + response.statusCode());
            }

            return parseDietAnalysis(response.body());
        } catch (Exception ex) {
            return handleFailure("AI 분석 중 오류가 발생해 mock 분석 결과를 반환했습니다.");
        }
    }

    private String buildRequestBody(MultipartFile image) throws IOException {
        String contentType = image.getContentType();
        if (contentType == null || contentType.isBlank()) {
            contentType = MediaType.IMAGE_JPEG_VALUE;
        }

        String base64Image = java.util.Base64.getEncoder().encodeToString(image.getBytes());
        String dataUrl = "data:" + contentType + ";base64," + base64Image;

        Map<String, Object> body = Map.of(
                "model", properties.getModel(),
                "input", List.of(Map.of(
                        "role", "user",
                        "content", List.of(
                                Map.of("type", "input_text", "text", PROMPT),
                                Map.of("type", "input_image", "image_url", dataUrl, "detail", "low")))),
                "max_output_tokens", 800);

        return objectMapper.writeValueAsString(body);
    }

    private DietAnalysisResponse parseDietAnalysis(String responseBody) throws JsonProcessingException {
        JsonNode root = objectMapper.readTree(responseBody);
        String outputText = root.path("output_text").asText(null);
        if (outputText == null || outputText.isBlank()) {
            outputText = findFirstOutputText(root);
        }
        if (outputText == null || outputText.isBlank()) {
            return handleFailure("AI 응답에서 분석 JSON을 찾지 못했습니다.");
        }

        String jsonOnly = stripCodeFence(outputText);
        return objectMapper.readValue(jsonOnly, DietAnalysisResponse.class);
    }

    private String findFirstOutputText(JsonNode root) {
        JsonNode output = root.path("output");
        if (!output.isArray()) {
            return null;
        }

        for (JsonNode item : output) {
            JsonNode content = item.path("content");
            if (!content.isArray()) {
                continue;
            }
            for (JsonNode contentItem : content) {
                String text = contentItem.path("text").asText(null);
                if (text != null && !text.isBlank()) {
                    return text;
                }
            }
        }
        return null;
    }

    private String stripCodeFence(String text) {
        String trimmed = text.trim();
        if (trimmed.startsWith("```")) {
            trimmed = trimmed.replaceFirst("^```(?:json)?\\s*", "");
            trimmed = trimmed.replaceFirst("\\s*```$", "");
        }
        return trimmed.trim();
    }

    private DietAnalysisResponse handleFailure(String message) {
        if (properties.isMockFallback()) {
            return mockResponse(message);
        }
        throw new IllegalStateException(message);
    }

    private DietAnalysisResponse mockResponse(String feedback) {
        List<EstimatedFood> foods = List.of(
                new EstimatedFood("김치찌개", 1, "그릇"),
                new EstimatedFood("쌀밥", 1, "공기"),
                new EstimatedFood("계란말이", 1, "접시")
        );
        AnalysisResult result = new AnalysisResult(650, 80, 25, 20, feedback);
        return new DietAnalysisResponse(foods, result);
    }
}
