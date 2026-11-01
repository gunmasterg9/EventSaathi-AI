param([Parameter(Mandatory = $true)][ValidateSet('run', 'stop')][string]$Action)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$runtimeDir = Join-Path $projectRoot '.runtime'
$stateFile = Join-Path $runtimeDir 'servers.json'

function Get-OwnedProcess($record) {
    $process = Get-Process -Id $record.id -ErrorAction SilentlyContinue
    if ($process -and $process.StartTime.ToUniversalTime().Ticks.ToString() -eq $record.started) {
        return $process
    }
    return $null
}

function Stop-Servers {
    if (-not (Test-Path -LiteralPath $stateFile)) {
        Write-Host 'No servers started by run.bat are recorded.'
        return
    }
    $records = Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json
    foreach ($record in $records) {
        $process = Get-OwnedProcess $record
        if ($process) {
            & taskkill.exe /PID $process.Id /T /F | Out-Null
            if ($LASTEXITCODE -ne 0) { throw "Could not stop $($record.name). Try stop.bat again." }
            Write-Host "Stopped $($record.name)."
        }
    }
    Remove-Item -LiteralPath $stateFile
    Write-Host 'EventSaathi stopped.'
}

function Wait-Server([string]$Url, $Process) {
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        $Process.Refresh()
        if ($Process.HasExited) { throw "Server exited. Check logs in $runtimeDir" }
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
            if ($response.StatusCode -eq 200) { return }
        } catch { }
        Start-Sleep -Milliseconds 500
    }
    throw "Server did not become ready: $Url. Check logs in $runtimeDir"
}

try {
    if ($Action -eq 'stop') { Stop-Servers; exit 0 }
    New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null
    if (Test-Path -LiteralPath $stateFile) {
        $records = Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json
        $active = @($records | Where-Object { Get-OwnedProcess $_ })
        if ($active.Count -eq 2) {
            Write-Host 'EventSaathi is already running: http://127.0.0.1:5173/'
            exit 0
        }
        Stop-Servers
    }
    $pythonExe = Join-Path $projectRoot '.venv\Scripts\python.exe'
    if (-not (Test-Path -LiteralPath $pythonExe)) {
        throw 'Missing .venv. Install Python, then run: python -m venv .venv; .venv\Scripts\python.exe -m pip install -r backend\requirements.txt'
    }
    & $pythonExe -c 'import uvicorn, fastapi, sqlalchemy, pydantic_settings, httpx' 2>$null
    if ($LASTEXITCODE -ne 0) { throw 'Backend dependencies missing. Run: .venv\Scripts\python.exe -m pip install -r backend\requirements.txt' }
    $nodeExe = (Get-Command node.exe -ErrorAction Stop).Source
    $viteFile = Join-Path $projectRoot 'frontend\node_modules\vite\bin\vite.js'
    if (-not (Test-Path -LiteralPath $viteFile)) { throw 'Frontend dependencies missing. Run npm.cmd ci inside frontend.' }
    foreach ($port in @(8000, 5173)) {
        $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $port)
        try { $listener.Start() } catch { throw "Port $port is already in use. Close the existing server, then run run.bat again." }
        finally { $listener.Stop() }
    }
    $records = @()
    try {
        $backend = Start-Process -FilePath $pythonExe -ArgumentList @('-m', 'uvicorn', 'backend.app.main:app', '--host', '127.0.0.1', '--port', '8000') -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $runtimeDir 'backend.log') -RedirectStandardError (Join-Path $runtimeDir 'backend-error.log') -PassThru
        $records += @{ name = 'backend'; id = $backend.Id; started = $backend.StartTime.ToUniversalTime().Ticks.ToString(); path = $backend.Path }
        ConvertTo-Json -InputObject $records | Set-Content -LiteralPath $stateFile
        $frontend = Start-Process -FilePath $nodeExe -ArgumentList @('node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5173', '--strictPort') -WorkingDirectory (Join-Path $projectRoot 'frontend') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $runtimeDir 'frontend.log') -RedirectStandardError (Join-Path $runtimeDir 'frontend-error.log') -PassThru
        $records += @{ name = 'frontend'; id = $frontend.Id; started = $frontend.StartTime.ToUniversalTime().Ticks.ToString(); path = $frontend.Path }
        ConvertTo-Json -InputObject $records | Set-Content -LiteralPath $stateFile
        Wait-Server 'http://127.0.0.1:8000/api/health' $backend
        Wait-Server 'http://127.0.0.1:5173/' $frontend
    } catch {
        Stop-Servers
        throw
    }
    Write-Host ''
    Write-Host 'EventSaathi is running!'
    Write-Host 'App:      http://127.0.0.1:5173/'
    Write-Host 'API docs: http://127.0.0.1:8000/docs'
    Write-Host 'Use stop.bat to stop both servers. Closing this window keeps them running.'
    Write-Host "Logs: $runtimeDir"
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
