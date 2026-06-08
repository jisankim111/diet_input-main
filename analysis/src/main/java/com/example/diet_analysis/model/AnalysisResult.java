package com.example.diet_analysis.model;

public class AnalysisResult {
    private int totalCalories;
    private int carbohydrate;
    private int protein;
    private int fat;
    private String feedback;

    public AnalysisResult() {}

    public AnalysisResult(int totalCalories, int carbohydrate, int protein, int fat, String feedback) {
        this.totalCalories = totalCalories;
        this.carbohydrate = carbohydrate;
        this.protein = protein;
        this.fat = fat;
        this.feedback = feedback;
    }

    public int getTotalCalories() { return totalCalories; }
    public void setTotalCalories(int totalCalories) { this.totalCalories = totalCalories; }
    public int getCarbohydrate() { return carbohydrate; }
    public void setCarbohydrate(int carbohydrate) { this.carbohydrate = carbohydrate; }
    public int getProtein() { return protein; }
    public void setProtein(int protein) { this.protein = protein; }
    public int getFat() { return fat; }
    public void setFat(int fat) { this.fat = fat; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
}
