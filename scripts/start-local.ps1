$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$mvnw = Join-Path $root "mvnw.cmd"

Write-Host "Starting Eureka on 8761..."
Start-Process -FilePath $mvnw -ArgumentList @("-f", "eureka\pom.xml", "spring-boot:run") -WorkingDirectory $root
Start-Sleep -Seconds 8

Write-Host "Starting Analysis on 9002..."
Start-Process -FilePath $mvnw -ArgumentList @("-f", "analysis\pom.xml", "spring-boot:run", "-Dspring-boot.run.profiles=local") -WorkingDirectory $root
Start-Sleep -Seconds 8

Write-Host "Starting Input on 9000..."
Start-Process -FilePath $mvnw -ArgumentList @("spring-boot:run", "-Dspring-boot.run.profiles=local") -WorkingDirectory $root
Start-Sleep -Seconds 8

Write-Host "Starting Gateway on 9001..."
Start-Process -FilePath $mvnw -ArgumentList @("-f", "gateway\pom.xml", "spring-boot:run", "-Dspring-boot.run.profiles=local") -WorkingDirectory $root

Write-Host ""
Write-Host "Started: Eureka(8761), Analysis(9002), Input(9000), Gateway(9001)."
Write-Host "Open http://localhost:9001"
