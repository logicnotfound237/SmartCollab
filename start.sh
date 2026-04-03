#!/bin/bash

echo "Starting SmartCollab Development Environment..."
echo ""

echo "Installing dependencies..."
npm run install:all

echo ""
echo "Starting backend and frontend servers..."
echo "Backend will run on http://localhost:5000"
echo "Frontend will run on http://localhost:5173"
echo ""

npm run dev

