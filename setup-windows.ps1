# MyToon 자동 설치 & 실행 스크립트 (Windows PowerShell)
# 관리자 권한으로 실행하세요

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   MyToon 자동 설치 시작" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Node.js 확인
Write-Host "`n[1/6] Node.js 확인 중..." -ForegroundColor Yellow
$nodeVersion = node -v 2>&1
if ($LASTEXITCODE -ne 0 -or $nodeVersion -notmatch "v\d") {
    Write-Host "  Node.js가 없습니다. 설치 중..." -ForegroundColor Red
    $nodeInstaller = "$env:TEMP\node-installer.msi"
    Write-Host "  다운로드 중 (잠시 기다려주세요)..." -ForegroundColor Yellow
    Invoke-WebRequest "https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi" -OutFile $nodeInstaller
    Start-Process msiexec.exe -Wait -ArgumentList "/i `"$nodeInstaller`" /quiet"
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    Write-Host "  Node.js 설치 완료" -ForegroundColor Green
} else {
    Write-Host "  Node.js $nodeVersion 감지됨 OK" -ForegroundColor Green
}

# 2. Git 확인
Write-Host "`n[2/6] Git 확인 중..." -ForegroundColor Yellow
$gitVersion = git --version 2>&1
if ($LASTEXITCODE -ne 0 -or $gitVersion -notmatch "git version") {
    Write-Host "  Git이 없습니다. 설치 페이지를 엽니다..." -ForegroundColor Red
    Start-Process "https://git-scm.com/download/win"
    Write-Host ""
    Write-Host "  1. 열린 페이지에서 Git 설치 파일을 다운로드하세요" -ForegroundColor White
    Write-Host "  2. 설치 완료 후 이 창을 닫고 다시 실행하세요" -ForegroundColor White
    Read-Host "`n  Git 설치 완료 후 Enter 키를 누르세요"
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
} else {
    Write-Host "  $gitVersion 감지됨 OK" -ForegroundColor Green
}

# 3. PostgreSQL 확인 및 실행
Write-Host "`n[3/6] PostgreSQL 확인 중..." -ForegroundColor Yellow

# 방법 A: Docker 시도
$dbReady = $false
$dockerVersion = docker version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Docker 감지됨 - 컨테이너 방식 사용" -ForegroundColor Green
    $existing = docker ps -a --filter "name=mytoon-db" --format "{{.Names}}" 2>&1
    if ($existing -match "mytoon-db") {
        docker start mytoon-db 2>&1 | Out-Null
        Write-Host "  mytoon-db 컨테이너 재시작 OK" -ForegroundColor Green
    } else {
        Write-Host "  PostgreSQL 컨테이너 생성 중..." -ForegroundColor Yellow
        docker run -d --name mytoon-db `
            -e POSTGRES_PASSWORD=postgres `
            -e POSTGRES_DB=mytoon `
            -p 5432:5432 `
            postgres:16 2>&1 | Out-Null
        Write-Host "  PostgreSQL 시작 OK (5초 대기 중...)" -ForegroundColor Green
        Start-Sleep -Seconds 5
    }
    $dbReady = $true
} else {
    # 방법 B: 이미 설치된 PostgreSQL 서비스 확인
    Write-Host "  Docker 없음 - 로컬 PostgreSQL 확인 중..." -ForegroundColor Yellow
    $pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if ($pgService) {
        if ($pgService.Status -ne "Running") {
            Write-Host "  PostgreSQL 서비스 시작 중..." -ForegroundColor Yellow
            Start-Service $pgService.Name -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
        }
        Write-Host "  로컬 PostgreSQL 서비스 감지됨 OK" -ForegroundColor Green
        $dbReady = $true
    } else {
        # 방법 C: winget으로 설치
        Write-Host "  PostgreSQL이 없습니다. winget으로 설치 시도 중..." -ForegroundColor Yellow
        $wingetCheck = winget --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  PostgreSQL 설치 중 (시간이 걸릴 수 있습니다)..." -ForegroundColor Yellow
            winget install -e --id PostgreSQL.PostgreSQL.16 --accept-source-agreements --accept-package-agreements 2>&1 | Out-Null
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
            # 서비스 시작
            $pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
            if ($pgService) {
                Start-Service $pgService.Name -ErrorAction SilentlyContinue
                Start-Sleep -Seconds 3
                Write-Host "  PostgreSQL 설치 및 시작 완료" -ForegroundColor Green
                $dbReady = $true
            }
        }
        if (-not $dbReady) {
            Write-Host ""
            Write-Host "  ==============================================" -ForegroundColor Red
            Write-Host "  PostgreSQL을 찾을 수 없습니다." -ForegroundColor Red
            Write-Host "  아래 중 하나를 선택하세요:" -ForegroundColor Yellow
            Write-Host "  A) Docker Desktop 설치: https://www.docker.com/products/docker-desktop" -ForegroundColor White
            Write-Host "  B) PostgreSQL 직접 설치: https://www.postgresql.org/download/windows/" -ForegroundColor White
            Write-Host "     설치 시 비밀번호를 'postgres', 포트를 5432로 설정하세요" -ForegroundColor DarkGray
            Write-Host "  ==============================================" -ForegroundColor Red
            Write-Host ""
            Read-Host "  설치 완료 후 Enter 키를 누르세요 (또는 Ctrl+C로 종료)"
            $dbReady = $true
        }
    }
}

# mytoon DB 생성 (로컬 PostgreSQL인 경우)
if ($dbReady -and -not ($dockerVersion -match "Engine")) {
    $pgPath = (Get-Command psql -ErrorAction SilentlyContinue)?.Source
    if ($pgPath) {
        $env:PGPASSWORD = "postgres"
        psql -U postgres -c "CREATE DATABASE mytoon;" 2>&1 | Out-Null
        Write-Host "  mytoon DB 준비 완료" -ForegroundColor Green
    }
}

# 4. 코드 받기
Write-Host "`n[4/6] 코드 다운로드 중..." -ForegroundColor Yellow
$targetDir = "$env:USERPROFILE\mytoon"
$branch = "claude/youthful-fermi-O7RO3"

if (Test-Path "$targetDir\.git") {
    Write-Host "  기존 폴더 발견 - 최신 코드로 업데이트 중..." -ForegroundColor Yellow
    Set-Location $targetDir
    # git stderr를 stdout으로 합쳐서 처리 (PowerShell 오류 방지)
    $null = & git fetch origin 2>&1
    $null = & git checkout $branch 2>&1
    $null = & git pull origin $branch 2>&1
    Write-Host "  코드 업데이트 완료" -ForegroundColor Green
} else {
    if (Test-Path $targetDir) {
        Write-Host "  폴더는 있지만 git repo가 아님 - 새로 클론합니다..." -ForegroundColor Yellow
        Remove-Item $targetDir -Recurse -Force
    }
    Write-Host "  저장소 클론 중 (잠시 기다려주세요)..." -ForegroundColor Yellow
    & git clone https://github.com/keehoon924/mytoon.git $targetDir 2>&1 | Out-Null
    Set-Location $targetDir
    & git checkout $branch 2>&1 | Out-Null
    Write-Host "  클론 완료" -ForegroundColor Green
}
Write-Host "  코드 준비 완료" -ForegroundColor Green

# 5. 환경변수 파일 생성
Write-Host "`n[5/6] 환경 설정 중..." -ForegroundColor Yellow
$envFile = "$targetDir\.env.local"
if (-not (Test-Path $envFile)) {
    $envContent = @"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mytoon"
JWT_SECRET="mytoon-local-dev-secret-2026"
JWT_EXPIRES_IN="7d"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
OPENAI_API_KEY=""
RESEND_API_KEY=""
"@
    $envContent | Out-File -FilePath $envFile -Encoding UTF8 -NoNewline
    Write-Host "  .env.local 생성 완료" -ForegroundColor Green
} else {
    Write-Host "  .env.local 이미 있음 - 유지" -ForegroundColor Green
}

# 6. 패키지 설치 및 DB 초기화
Write-Host "`n[6/6] 패키지 설치 및 DB 초기화 중..." -ForegroundColor Yellow
Set-Location $targetDir

Write-Host "  npm 패키지 설치 중 (처음엔 2-3분 소요)..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "  npm install 실패! 오류를 확인하세요." -ForegroundColor Red
    Read-Host "Enter 키를 눌러 종료"
    exit 1
}
Write-Host "  패키지 설치 완료" -ForegroundColor Green

$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/mytoon"
Write-Host "  DB 스키마 초기화 중..." -ForegroundColor Yellow
npx prisma db push
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  DB 초기화 실패! PostgreSQL이 실행 중인지 확인하세요." -ForegroundColor Red
    Write-Host "  - 포트: 5432" -ForegroundColor DarkGray
    Write-Host "  - 유저: postgres, 비밀번호: postgres" -ForegroundColor DarkGray
    Read-Host "  수동으로 PostgreSQL을 시작한 후 Enter 키를 누르세요"
    npx prisma db push
}
Write-Host "  DB 초기화 완료" -ForegroundColor Green

# 완료 - 앱 실행
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   설치 완료! 앱을 시작합니다..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  잠시 후 브라우저가 자동으로 열립니다." -ForegroundColor White
Write-Host "  수동 접속: http://localhost:3000" -ForegroundColor White
Write-Host "  종료: Ctrl+C" -ForegroundColor DarkGray
Write-Host ""

# 브라우저 자동 오픈 (6초 후)
Start-Job -ScriptBlock {
    Start-Sleep 6
    Start-Process "http://localhost:3000"
} | Out-Null

# 서버 실행
Set-Location $targetDir
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/mytoon"
npm run dev
