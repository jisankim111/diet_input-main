package com.example.diet_analysis;

import com.example.diet_analysis.config.OpenAiProperties;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(OpenAiProperties.class)
public class DietAnalysisApplication {
    public static void main(String[] args) {
        SpringApplication.run(DietAnalysisApplication.class, args);
    }
}
