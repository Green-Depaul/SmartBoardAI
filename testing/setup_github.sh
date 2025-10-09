#!/bin/bash
# GitHub Setup Script for AI Project Manager Testing Suite
# This script helps you initialize Git and push to GitHub

echo "🚀 AI Project Manager Testing Suite - GitHub Setup"
echo "=================================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first:"
    echo "   Visit: https://git-scm.com/downloads"
    exit 1
fi

echo "✅ Git is installed"
echo ""

# Initialize git if not already initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "ℹ️  Git repository already exists"
fi

echo ""

# Configure git user (if not configured)
if [ -z "$(git config user.name)" ]; then
    echo "⚙️  Git user not configured. Let's set it up:"
    read -p "Enter your name: " user_name
    read -p "Enter your email: " user_email
    git config user.name "$user_name"
    git config user.email "$user_email"
    echo "✅ Git user configured"
else
    echo "✅ Git user already configured as: $(git config user.name)"
fi

echo ""

# Add files to git
echo "📝 Adding files to Git..."
git add .
echo "✅ Files added"

echo ""

# Check if there are changes to commit
if git diff-index --quiet HEAD --; then
    echo "ℹ️  No changes to commit"
else
    echo "💾 Creating initial commit..."
    git commit -m "Initial commit: AI Project Manager Testing Suite"
    echo "✅ Commit created"
fi

echo ""

# Check if remote exists
if git remote | grep -q origin; then
    echo "ℹ️  Remote 'origin' already exists:"
    git remote get-url origin
    echo ""
    read -p "Do you want to update it? (y/n): " update_remote
    if [ "$update_remote" = "y" ]; then
        read -p "Enter your GitHub repository URL: " repo_url
        git remote set-url origin "$repo_url"
        echo "✅ Remote updated"
    fi
else
    echo "🔗 Setting up GitHub remote..."
    echo ""
    echo "First, create a repository on GitHub:"
    echo "  1. Go to https://github.com/new"
    echo "  2. Name: AI-Project-Manager-Testing"
    echo "  3. Make it Private (for team use)"
    echo "  4. DON'T initialize with README"
    echo "  5. Click 'Create repository'"
    echo ""
    read -p "Enter your GitHub repository URL (e.g., https://github.com/username/repo.git): " repo_url
    
    if [ -z "$repo_url" ]; then
        echo "❌ No URL provided. Skipping remote setup."
    else
        git remote add origin "$repo_url"
        echo "✅ Remote added"
    fi
fi

echo ""

# Rename branch to main if needed
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "🔄 Renaming branch to 'main'..."
    git branch -M main
    echo "✅ Branch renamed"
fi

echo ""

# Push to GitHub
if git remote | grep -q origin; then
    echo "🚀 Ready to push to GitHub!"
    read -p "Push now? (y/n): " push_now
    
    if [ "$push_now" = "y" ]; then
        echo "📤 Pushing to GitHub..."
        git push -u origin main
        echo "✅ Successfully pushed to GitHub!"
        echo ""
        echo "🎉 Your testing suite is now on GitHub!"
        echo ""
        echo "📋 Next steps:"
        echo "  1. Go to your GitHub repository"
        echo "  2. Click 'Settings' → 'Collaborators'"
        echo "  3. Add your project partners"
        echo "  4. They can clone with: git clone $repo_url"
    else
        echo "ℹ️  You can push later with: git push -u origin main"
    fi
else
    echo "ℹ️  Remote not configured. Run this script again to set it up."
fi

echo ""
echo "📚 For detailed instructions, see SETUP_GUIDE.md"
echo "👥 For team collaboration tips, see CONTRIBUTING.md"
echo ""
echo "✨ Setup complete!"
