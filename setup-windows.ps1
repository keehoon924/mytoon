# MyToon 자동 설치 & 실행 스크립트 (Windows PowerShell)
# 관리자 권한으로 실행하세요

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   MyToon 자동 설치 시작" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Node.js 확인
Write-Host "`n[1/6] Node.js 확인 중..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v 2>$null
    Write-Host "  Node.js $nodeVersion 감지됨 OK" -ForegroundColor Green
} catch {
    Write-Host "  Node.js가 없습니다. 설치 중..." -ForegroundColor Red
    $nodeInstaller = "$env:TEMP\node-installer.msi"
    Invoke-WebRequest "https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi" -OutFile $nodeInstaller
    Start-Process msiexec.exe -Wait -ArgumentList "/i $nodeInstaller /quiet"
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    Write-Host "  Node.js 설치 완료" -ForegroundColor Green
}

# 2. Git 확인
Write-Host "`n[2/6] Git 확인 중..." -ForegroundColor Yellow
try {
    $gitVersion = git --version 2>$null
    Write-Host "  $gitVersion 감지됨 OK" -ForegroundColor Green
} catch {
    Write-Host "  Git이 없습니다. https://git-scm.com 에서 설치 후 다시 실행하세요." -ForegroundColor Red
    Start-Process "https://git-scm.com/download/win"
    Read-Host "Git 설치 후 Enter를 누르세요"
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# 3. Docker 확인 및 PostgreSQL 실행
Write-Host "`n[3/6] PostgreSQL(Docker) 확인 중..." -ForegroundColor Yellow
$dockerAvailable = $false
try {
    docker version 2>$null | Out-Null
    $dockerAvailable = $true
    Write-Host "  Docker 감지됨" -ForegroundColor Green

    $existing = docker ps -a --filter "name=mytoon-db" --format "{{.Names}}" 2>$null
    if ($existing -eq "mytoon-db") {
        docker start mytoon-db 2>$null | Out-Null
        Write-Host "  mytoon-db 컨테이너 재시작 OK" -ForegroundColor Green
    } else {
        Write-Host "  PostgreSQL 컨테이너 생성 중..." -ForegroundColor Yellow
        docker run -d --name mytoon-db `
            -e POSTGRES_PASSWORD=postgres `
            -e POSTGRES_DB=mytoon `
            -p 5432:5432 `
            postgres:16 2>$null | Out-Null
        Write-Host "  PostgreSQL 시작 OK" -ForegroundColor Green
        Start-Sleep -Seconds 3
    }
} catch {
    Write-Host "  Docker 없음 - PostgreSQL이 이미 설치되어 있다고 가정합니다." -ForegroundColor DarkYellow
    Write-Host "  (없으면 https://www.docker.com/products/docker-desktop 설치 권장)" -ForegroundColor DarkYellow
}

# 4. 코드 받기
Write-Host "`n[4/6] 코드 다운로드 중..." -ForegroundColor Yellow
$targetDir = "$env:USERPROFILE\mytoon"

if (Test-Path $targetDir) {
    Write-Host "  기존 폴더 발견 - 최신 코드로 업데이트 중..." -ForegroundColor Yellow
    Set-Location $targetDir
    git fetch origin 2>$null
    git checkout claude/youthful-fermi-O7RO3 2>$null
    git pull origin claude/youthful-fermi-O7RO3 2>$null
} else {
    git clone https://github.com/keehoon924/mytoon.git $targetDir
    Set-Location $targetDir
    git checkout claude/youthful-fermi-O7RO3
}
Write-Host "  코드 준비 완료" -ForegroundColor Green

# 5. 환경변수 파일 생성
Write-Host "`n[5/6] 환경 설정 중..." -ForegroundColor Yellow
$envFile = "$targetDir\.env.local"
if (-not (Test-Path $envFile)) {
    @"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mytoon"
JWT_SECRET="mytoon-local-dev-secret-2026"
JWT_EXPIRES_IN="7d"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
OPENAI_API_KEY=""
RESEND_API_KEY=""
"@ | Out-File -FilePath $envFile -Encoding UTF8
    Write-Host "  .env.local 생성 완료" -ForegroundColor Green
} else {
    Write-Host "  .env.local 이미 있음 - 유지" -ForegroundColor Green
}

# 6. 패키지 설치 및 DB 초기화
Write-Host "`n[6/6] 패키지 설치 및 DB 초기화 중..." -ForegroundColor Yellow
Set-Location $targetDir
npm install --silent
Write-Host "  패키지 설치 완료" -ForegroundColor Green

$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/mytoon"
npx prisma db push 2>&1 | Out-Null
Write-Host "  DB 초기화 완료" -ForegroundColor Green

# 완료 - 앱 실행
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   설치 완료! 앱을 시작합니다..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  브라우저에서 http://localhost:3000 으로 접속하세요" -ForegroundColor White
Write-Host "  종료하려면 Ctrl+C 를 누르세요" -ForegroundColor DarkGray
Write-Host ""

# 브라우저 자동 오픈 (3초 후)
Start-Job -ScriptBlock {
    Start-Sleep 5
    Start-Process "http://localhost:3000"
} | Out-Null

# 서버 실행
Set-Location $targetDir
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/mytoon"
npm run dev
