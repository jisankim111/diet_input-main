package com.example.book_api.model;

public class HomeResponse {

    private String serviceName;
    private String description;
    private String apiGuide;

    public HomeResponse() {
    }

    public HomeResponse(String serviceName, String description, String apiGuide) {
        this.serviceName = serviceName;
        this.description = description;
        this.apiGuide = apiGuide;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getApiGuide() {
        return apiGuide;
    }

    public void setApiGuide(String apiGuide) {
        this.apiGuide = apiGuide;
    }
}
