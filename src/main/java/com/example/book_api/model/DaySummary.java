package com.example.book_api.model;

public class DaySummary {

    private String date;
    private int recordCount;
    private int totalCalories;
    private int burnedCalories;
    private int exerciseCount;

    public DaySummary() {
    }

    public DaySummary(String date, int recordCount, int totalCalories) {
        this.date = date;
        this.recordCount = recordCount;
        this.totalCalories = totalCalories;
    }

    public DaySummary(String date, int recordCount, int totalCalories, int burnedCalories, int exerciseCount) {
        this.date = date;
        this.recordCount = recordCount;
        this.totalCalories = totalCalories;
        this.burnedCalories = burnedCalories;
        this.exerciseCount = exerciseCount;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public int getRecordCount() {
        return recordCount;
    }

    public void setRecordCount(int recordCount) {
        this.recordCount = recordCount;
    }

    public int getTotalCalories() {
        return totalCalories;
    }

    public void setTotalCalories(int totalCalories) {
        this.totalCalories = totalCalories;
    }

    public int getBurnedCalories() {
        return burnedCalories;
    }

    public void setBurnedCalories(int burnedCalories) {
        this.burnedCalories = burnedCalories;
    }

    public int getExerciseCount() {
        return exerciseCount;
    }

    public void setExerciseCount(int exerciseCount) {
        this.exerciseCount = exerciseCount;
    }
}
