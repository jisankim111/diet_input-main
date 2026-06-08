Diet Analysis Service

This folder contains a minimal Spring Boot microservice that implements the
POST /api/analysis/photo endpoint. It calls the OpenAI Responses API with the
uploaded food photo and returns a JSON response matching the DTOs used by the
input-service.

Run locally:

Windows PowerShell:

    $env:OPENAI_API_KEY = 'your-api-key'
    mvn -f analysis/pom.xml spring-boot:run

The service listens on port 8082 by default (see analysis/src/main/resources/application.properties).

If OPENAI_API_KEY is empty, or if the AI API call fails, mock fallback remains enabled by default.
Set OPENAI_MOCK_FALLBACK=false if you want the service to fail instead.
