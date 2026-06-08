package com.example.diet_analysis.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "openai")
public class OpenAiProperties {
    private String apiKey;
    private String model = "gpt-4.1-mini";
    private String responsesUrl = "https://api.openai.com/v1/responses";
    private boolean mockFallback = true;

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getResponsesUrl() {
        return responsesUrl;
    }

    public void setResponsesUrl(String responsesUrl) {
        this.responsesUrl = responsesUrl;
    }

    public boolean isMockFallback() {
        return mockFallback;
    }

    public void setMockFallback(boolean mockFallback) {
        this.mockFallback = mockFallback;
    }
}
