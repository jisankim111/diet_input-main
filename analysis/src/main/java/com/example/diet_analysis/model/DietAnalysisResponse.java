package com.example.diet_analysis.model;

import java.util.List;

public class DietAnalysisResponse {
    private List<EstimatedFood> estimatedFoods;
    private AnalysisResult analysisResult;

    public DietAnalysisResponse() {}

    public DietAnalysisResponse(List<EstimatedFood> estimatedFoods, AnalysisResult analysisResult) {
        this.estimatedFoods = estimatedFoods;
        this.analysisResult = analysisResult;
    }

    public List<EstimatedFood> getEstimatedFoods() { return estimatedFoods; }
    public void setEstimatedFoods(List<EstimatedFood> estimatedFoods) { this.estimatedFoods = estimatedFoods; }
    public AnalysisResult getAnalysisResult() { return analysisResult; }
    public void setAnalysisResult(AnalysisResult analysisResult) { this.analysisResult = analysisResult; }
}
