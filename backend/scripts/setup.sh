#!/bin/bash

# SharedReads Backend Setup Script
# This script helps you set up the development environment

set -e

echo "==================================="
echo "SharedReads Backend Setup"
echo "==================================="
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js 20 or higher is required. Current version: $(node -v)"
    echo "   Please install Node.js 20 LTS from https://nodejs.org"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  IMPORTANT: Edit .env and add your credentials before continuing"
    echo ""
    read -p "Press Enter after you've configured .env to continue..."
else
    echo "✅ .env file already exists"
fi
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Check database connection
echo "🔌 Checking database connection..."
if npx prisma db pull --force > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    echo "   Please check your DATABASE_URL in .env"
    echo "   Format: postgresql://user:password@host:5432/database"
    exit 1
fi
echo ""

# Run migrations
echo "🗄️  Running database migrations..."
npx prisma migrate dev --name init
echo "✅ Migrations completed"
echo ""

# Generate Prisma client
echo "⚙️  Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated"
echo ""

# Create admin user
echo "👤 Creating admin user..."
echo "   You'll be prompted for admin credentials"
echo ""
npx ts-node scripts/seed-admin.ts
echo ""

echo "==================================="
echo "✅ Setup Complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Start the development server: npm run dev"
echo "2. Server will run on http://localhost:3000"
echo "3. Test the API: curl http://localhost:3000/health"
echo ""
echo "Useful commands:"
echo "  npm run dev          - Start development server"
echo "  npx prisma studio    - Open database GUI"
echo "  npm run build        - Build for production"
echo ""
