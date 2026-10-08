@echo off
setlocal

set "JAVA_HOME=C:\Users\CANAAN SERVICES\.jdks\jbr-21.0.11"
set "PATH=%JAVA_HOME%\bin;%PATH%"
set "ANDROID_PREFS_ROOT="

echo ===== 1. JAVA VERSION =====
"%JAVA_HOME%\bin\java.exe" -version

cd /d "%~dp0android"

echo.
echo ===== 2. GRADLE VERSION & JVM =====
call gradlew.bat --version

echo.
echo ===== 3. BUILD CLEAN & ASSEMBLE DEBUG =====
call gradlew.bat clean assembleDebug --stacktrace

if errorlevel 1 (
    echo.
    echo ===== BUILD APK ECHEC =====
    exit /b 1
)

echo.
echo ===== BUILD APK REUSSI =====
echo APK :
echo %CD%\app\build\outputs\apk\debug\app-debug.apk

if exist "%CD%\app\build\outputs\apk\debug\app-debug.apk" (
    echo [VERIFICATION] app-debug.apk trouve physiquement.
) else (
    echo [VERIFICATION] app-debug.apk introuvable malgre le succes.
)

endlocal
