package com.example.book_api.model;

import java.util.List;

public class DietMonthSummaryResponse {

    private String month;
    private List<DaySummary> summaries;

    public DietMonthSummaryResponse() {
    }

    public DietMonthSummaryResponse(String month, List<DaySummary> summaries) {
        this.month = month;
        this.summaries = summaries;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public List<DaySummary> getSummaries() {
        return summaries;
    }

    public void setSummaries(List<DaySummary> summaries) {
        this.summaries = summaries;
    }
}
