@echo off
setlocal

set "JAVA_HOME=C:\Users\CANAAN SERVICES\.jdks\jbr-21.0.11"
set "PATH=%JAVA_HOME%\bin;%PATH%"
set "ANDROID_PREFS_ROOT="

cd /d "%~dp0android"

call gradlew.bat assembleRelease

if errorlevel 1 (
    echo BUILD FAILED
    exit /b 1
)

echo BUILD SUCCESSFUL: %CD%\app\build\outputs\apk\release\app-release.apk

endlocal
