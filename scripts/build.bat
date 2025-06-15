@echo off
REM Production Build Script for Lưu Bút

echo 🚀 Building Lưu Bút for production...

REM Ensure all dependencies are installed
echo 📦 Installing dependencies...
call npm install

REM Build the Next.js application
echo 🔨 Building Next.js application...
call npm run build

REM Verify the build was successful
if %ERRORLEVEL% == 0 (
  echo ✅ Build completed successfully!
  echo.
  echo To start the production server, run:
  echo npm start
  echo.
  echo For deployment to Vercel, push your code to a Git repository and import it on Vercel.
) else (
  echo ❌ Build failed. Please check the errors above.
)
