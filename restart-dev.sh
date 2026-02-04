#!/bin/bash

# Quick script to cleanly restart Next.js dev server

echo "🧹 Cleaning up old processes..."
pkill -f "next dev"
sleep 1

echo "🗑️  Removing lock file..."
rm -rf .next/dev/lock

echo "🚀 Starting dev server..."
npm run dev
