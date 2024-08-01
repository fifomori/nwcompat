@echo off

@REM Optional env variables
@REM NWCOMPAT_DST: Android app source path (example: D:\Development\Java\OMORI)
@REM NWCOMPAT_DST_ADB: OMORI path on your phone (debug apk, example: /sdcard)

call pnpm run build

if defined NWCOMPAT_DST (
    xcopy /y "nwcompat.css" "%NWCOMPAT_DST%\app\src\main\assets\"
    xcopy /y "nwcompat.js" "%NWCOMPAT_DST%\app\src\main\assets\"
    xcopy /y "nwcompat-loader-oneloader.js" "%NWCOMPAT_DST%\app\src\main\assets\"
    xcopy /y "nwcompat-loader-main.js" "%NWCOMPAT_DST%\app\src\main\assets\js\main.js"
    xcopy /y /s "dist\*" "%NWCOMPAT_DST%\app\src\main\assets\"
    if defined NWCOMPAT_DST_ADB (
        adb push "%NWCOMPAT_DST%\app\src\main\assets" "%NWCOMPAT_DST_ADB%"
    )
)
