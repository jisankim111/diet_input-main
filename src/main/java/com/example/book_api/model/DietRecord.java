package com.example.book_api.model;

import java.util.List;

public class DietRecord {

    private String imageName;
    private List<EstimatedFood> estimatedFoods;
    private AnalysisResult analysisResult;

    public DietRecord() {
    }

    public DietRecord(String imageName, List<EstimatedFood> estimatedFoods, AnalysisResult analysisResult) {
        this.imageName = imageName;
        this.estimatedFoods = estimatedFoods;
        this.analysisResult = analysisResult;
    }

    public String getImageName() {
        return imageName;
    }

    public void setImageName(String imageName) {
        this.imageName = imageName;
    }

    public List<EstimatedFood> getEstimatedFoods() {
        return estimatedFoods;
    }

    public void setEstimatedFoods(List<EstimatedFood> estimatedFoods) {
        this.estimatedFoods = estimatedFoods;
    }

    public AnalysisResult getAnalysisResult() {
        return analysisResult;
    }

    public void setAnalysisResult(AnalysisResult analysisResult) {
        this.analysisResult = analysisResult;
    }
}
