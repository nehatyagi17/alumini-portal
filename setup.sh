#!/bin/bash

# Alumni Management Portal Setup Script
# This script automates the setup process for the Alumni Management Portal

set -e  # Exit on any error

echo "🚀 Alumni Management Portal Setup"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js is installed: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js v16 or higher."
        exit 1
    fi
}

# Check if PostgreSQL is installed
check_postgres() {
    if command -v psql &> /dev/null; then
        POSTGRES_VERSION=$(psql --version)
        print_status "PostgreSQL is installed: $POSTGRES_VERSION"
    else
        print_error "PostgreSQL is not installed. Please install PostgreSQL v12 or higher."
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_status "npm is installed: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
}

# Create database
create_database() {
    print_info "Creating database..."
    
    # Check if database exists
    if psql -lqt | cut -d \| -f 1 | grep -qw alumni_portal; then
        print_warning "Database 'alumni_portal' already exists."
        read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            dropdb alumni_portal
            print_status "Database dropped."
        else
            print_info "Using existing database."
            return 0
        fi
    fi
    
    createdb alumni_portal
    print_status "Database 'alumni_portal' created successfully."
}

# Run database schema
setup_database() {
    print_info "Setting up database schema..."
    
    if [ -f "database/schema.sql" ]; then
        psql alumni_portal < database/schema.sql
        print_status "Database schema applied successfully."
    else
        print_error "Schema file not found: database/schema.sql"
        exit 1
    fi
}

# Install backend dependencies
install_backend() {
    print_info "Installing backend dependencies..."
    
    cd backend
    
    if [ -f "package.json" ]; then
        npm install
        print_status "Backend dependencies installed."
    else
        print_error "Backend package.json not found."
        exit 1
    fi
    
    cd ..
}

# Install frontend dependencies
install_frontend() {
    print_info "Installing frontend dependencies..."
    
    cd frontend
    
    if [ -f "package.json" ]; then
        npm install
        print_status "Frontend dependencies installed."
    else
        print_error "Frontend package.json not found."
        exit 1
    fi
    
    cd ..
}

# Create environment files
create_env_files() {
    print_info "Creating environment files..."
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOF
# Backend Environment Variables
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alumni_portal
DB_USER=postgres
DB_PASSWORD=password
DB_URL=postgresql://postgres:password@localhost:5432/alumni_portal

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
EOF
        print_status "Backend .env file created."
    else
        print_warning "Backend .env file already exists."
    fi
    
    # Frontend .env.local
    if [ ! -f "frontend/.env.local" ]; then
        cat > frontend/.env.local << EOF
# Frontend Environment Variables
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Alumni Management Portal
VITE_APP_VERSION=1.0.0
VITE_DEV_MODE=true
EOF
        print_status "Frontend .env.local file created."
    else
        print_warning "Frontend .env.local file already exists."
    fi
}

# Create uploads directory
create_uploads_dir() {
    print_info "Creating uploads directory..."
    
    mkdir -p backend/uploads
    print_status "Uploads directory created."
}

# Add npm scripts
add_scripts() {
    print_info "Adding npm scripts..."
    
    # Root package.json
    if [ ! -f "package.json" ]; then
        cat > package.json << EOF
{
  "name": "alumni-management-portal",
  "version": "1.0.0",
  "description": "A comprehensive alumni management system",
  "scripts": {
    "dev": "concurrently \"npm run backend:dev\" \"npm run frontend:dev\"",
    "backend:dev": "cd backend && npm run dev",
    "frontend:dev": "cd frontend && npm run dev",
    "backend:start": "cd backend && npm start",
    "frontend:build": "cd frontend && npm run build",
    "install:all": "npm install && cd backend && npm install && cd ../frontend && npm install",
    "test": "npm run backend:test && npm run frontend:test",
    "backend:test": "cd backend && npm test",
    "frontend:test": "cd frontend && npm test"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  },
  "keywords": ["alumni", "management", "portal", "education"],
  "author": "Alumni Portal Team",
  "license": "MIT"
}
EOF
        print_status "Root package.json created with scripts."
    fi
}

# Install concurrently for running both servers
install_concurrently() {
    print_info "Installing concurrently for running both servers..."
    
    npm install concurrently --save-dev
    print_status "Concurrently installed."
}

# Main setup function
main() {
    echo
    print_info "Checking prerequisites..."
    check_node
    check_npm
    check_postgres
    
    echo
    print_info "Setting up database..."
    create_database
    setup_database
    
    echo
    print_info "Installing dependencies..."
    install_backend
    install_frontend
    
    echo
    print_info "Setting up environment..."
    create_env_files
    create_uploads_dir
    
    echo
    print_info "Setting up scripts..."
    add_scripts
    install_concurrently
    
    echo
    print_status "Setup completed successfully!"
    echo
    echo "🚀 Next steps:"
    echo "1. Update database credentials in backend/.env if needed"
    echo "2. Run 'npm run dev' to start both servers"
    echo "3. Open http://localhost:3000 in your browser"
    echo "4. Register as an admin to begin using the system"
    echo
    echo "📚 Documentation: See README.md for detailed usage instructions"
    echo
    print_status "Happy coding! 🎉"
}

# Run main function
main "$@"
