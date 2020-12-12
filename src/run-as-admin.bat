@echo off


:init
setlocal DisableDelayedExpansion
set "path=%~0"
for %%k in (%0) do set script=%%~nk
set "elevateScript=%temp%\elevated_cmd_%script%.vbs"
setlocal EnableDelayedExpansion

:checkPrivileges
NET FILE 1>NUL 2>NUL
if '%errorlevel%' == '0' ( goto gotPrivileges ) else ( goto getPrivileges )

:getPrivileges
if '%1'=='ELEV' (echo ELEV & shift /1 & goto gotPrivileges)

ECHO Set UAC = CreateObject^("Shell.Application"^) > "%elevateScript%"
ECHO args = "ELEV " >> "%elevateScript%"
ECHO For Each strArg in WScript.Arguments >> "%elevateScript%"
ECHO args = args ^& strArg ^& " "  >> "%elevateScript%"
ECHO Next >> "%elevateScript%"
ECHO UAC.ShellExecute "!path!", args, "", "runas", 1 >> "%elevateScript%"
"%SystemRoot%\System32\WScript.exe" "%elevateScript%" %*
exit /B

:gotPrivileges
setlocal & pushd .
cd /d %~dp0
if '%1'=='ELEV' (del "%elevateScript%" 1>nul 2>nul  &  shift /1)

%1 %2 %3 %4 %5 %6 %7 %8 %9