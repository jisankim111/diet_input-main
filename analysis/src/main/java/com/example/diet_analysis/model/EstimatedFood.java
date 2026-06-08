package com.example.diet_analysis.model;

public class EstimatedFood {
    private String foodName;
    private int amount;
    private String unit;

    public EstimatedFood() {}

    public EstimatedFood(String foodName, int amount, String unit) {
        this.foodName = foodName;
        this.amount = amount;
        this.unit = unit; 
    }

    public String getFoodName() { return foodName; }
    public void setFoodName(String foodName) { this.foodName = foodName; }
    public int getAmount() { return amount; }
    public void setAmount(int amount) { this.amount = amount; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
}
