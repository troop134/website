@echo off
REM Double-click to rebuild the photo albums and events for the Troop 134 website.
cd /d "%~dp0"
where py >nul 2>nul && (py -3 update-site.py & goto :eof)
where python >nul 2>nul && (python update-site.py & goto :eof)
echo Python 3 is needed. Install it from https://www.python.org/downloads/ and tick "Add python.exe to PATH".
pause
