#!/bin/bash

# Production Build Script for Lưu Bút
echo "🚀 Building Lưu Bút for production..."

# Ensure all dependencies are installed
echo "📦 Installing dependencies..."
npm install

# Build the Next.js application
echo "🔨 Building Next.js application..."
npm run build

# Verify the build was successful
if [ $? -eq 0 ]; then
  echo "✅ Build completed successfully!"
  echo ""
  echo "To start the production server, run:"
  echo "npm start"
  echo ""
  echo "For deployment to Vercel, push your code to a Git repository and import it on Vercel."
else
  echo "❌ Build failed. Please check the errors above."
fi
