package com.example.book_api.model;

import java.util.List;

public class DietDayResponse {

    private String date;
    private List<DietRecord> records;

    public DietDayResponse() {
    }

    public DietDayResponse(String date, List<DietRecord> records) {
        this.date = date;
        this.records = records;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public List<DietRecord> getRecords() {
        return records;
    }

    public void setRecords(List<DietRecord> records) {
        this.records = records;
    }
}
