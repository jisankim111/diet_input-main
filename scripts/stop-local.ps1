$ports = 8761, 8080, 8081, 8082
$pids = Get-NetTCPConnection -LocalPort $ports -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    Where-Object { $_ -gt 0 }

if ($pids) {
    Stop-Process -Id $pids -Force
    Write-Host "Stopped local services."
} else {
    Write-Host "No local services found on 8761, 8080, 8081, 8082."
}
