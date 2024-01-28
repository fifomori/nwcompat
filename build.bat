@echo off

@REM my scripts for build+upload workflow
@REM 

cls

call pnpm run build

xcopy /y "nwcompat.js" "D:\Development\Java\OMORI\app\src\main\assets\"
xcopy /y "nwcompat-loader.js" "D:\Development\Java\OMORI\app\src\main\assets\"
xcopy /y /s "dist\*" "D:\Development\Java\OMORI\app\src\main\assets\"

adb push "D:\Development\Java\OMORI\app\src\main\assets" "/sdcard/OMORI"