# GitHub Setup Guide for Team Collaboration

This guide will help you and your project partners set up GitHub for the testing suite.

## 📋 Prerequisites

- Git installed on your computer
- GitHub account created
- Your partners' GitHub usernames

## 🔧 Initial Setup (First Team Member)

### Step 1: Initialize Git Repository
```bash
cd /Users/mcamac22/Testing_Midterm

# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Testing suite for AI Project Manager"
```

### Step 2: Create GitHub Repository

1. **Go to GitHub.com** and log in
2. **Click "+" → "New repository"**
3. **Repository settings:**
   - Name: `AI-Project-Manager-Testing` (or your preferred name)
   - Description: `Testing suite for AI Project Manager Tool`
   - Visibility: **Private** (if working with a team) or Public
   - **DO NOT** initialize with README (you already have one)
4. **Click "Create repository"**

### Step 3: Connect Local Repository to GitHub
```bash
# Add remote repository (replace with YOUR GitHub URL)
git remote add origin https://github.com/YOUR_USERNAME/AI-Project-Manager-Testing.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Invite Team Members

1. Go to your repository on GitHub
2. Click **"Settings"** tab
3. Click **"Collaborators"** in the left sidebar
4. Click **"Add people"**
5. Enter your partners' GitHub usernames
6. Click **"Add [username] to this repository"**
7. They'll receive an email invitation

## 👥 For Team Members Joining

### Step 1: Accept Invitation
- Check your email for the invitation
- Click "Accept invitation"
- Or go to the repository URL and accept there

### Step 2: Clone Repository
```bash
# Choose a location on your computer
cd ~/Documents  # or wherever you want

# Clone the repository (replace with actual URL)
git clone https://github.com/OWNER_USERNAME/AI-Project-Manager-Testing.git

# Enter the directory
cd AI-Project-Manager-Testing
```

### Step 3: Set Up Your Environment
```bash
# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

### Step 4: Configure Git
```bash
# Set your name and email (use your GitHub email)
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## 🔄 Daily Workflow

### Starting Work
```bash
# Always pull latest changes before starting
git pull origin main

# Create a new branch for your work
git checkout -b feature/your-task-name
```

### Making Changes
```bash
# Make your edits to test files...

# Check what you changed
git status

# See detailed changes
git diff

# Add your changes
git add .

# Commit with descriptive message
git commit -m "Add: frontend tests for login page"
```

### Sharing Your Work
```bash
# Push your branch to GitHub
git push origin feature/your-task-name
```

Then on GitHub:
1. Go to the repository
2. Click **"Pull requests"** tab
3. Click **"New pull request"**
4. Select your branch
5. Add description of changes
6. Request review from team members
7. Click **"Create pull request"**

### Reviewing Team Member's Code
1. Go to **"Pull requests"** tab
2. Click on the PR to review
3. Review the code changes
4. Add comments or suggestions
5. Approve or request changes
6. Once approved, merge to main

## 🔀 Handling Merge Conflicts

If Git says there's a conflict:

```bash
# Pull latest changes
git pull origin main

# Git will mark conflicts in files
# Open the conflicting files and look for:
<<<<<<< HEAD
your changes
=======
their changes
>>>>>>> branch-name

# Edit to keep the correct version
# Remove the conflict markers
# Save the file

# Mark as resolved
git add conflicting-file.py

# Complete the merge
git commit -m "Resolve merge conflict in test file"

# Push
git push origin your-branch-name
```

## 📊 Project Structure for Team

### Recommended Branch Strategy

```
main (production-ready tests)
  ↑
develop (integration branch)
  ↑
  ├── feature/frontend-tests (Partner 1)
  ├── feature/backend-tests (Partner 2)
  └── feature/integration-tests (Partner 3)
```

### Setup Branch Strategy
```bash
# Create develop branch
git checkout -b develop
git push origin develop

# Each team member creates their feature branch
git checkout -b feature/your-feature
```

## 🛠️ Useful Git Commands

```bash
# See all branches
git branch -a

# Switch branches
git checkout branch-name

# See commit history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all local changes
git reset --hard HEAD

# See who changed what
git blame filename.py

# Create a tag for a version
git tag -a v1.0 -m "Version 1.0 - Initial testing suite"
git push origin v1.0
```

## 📞 Communication Best Practices

### Before You Code
- **Check Issues**: See what needs to be done
- **Claim a Task**: Comment on issue saying you're working on it
- **Create Branch**: Use descriptive branch names

### While Coding
- **Commit Often**: Small, focused commits
- **Pull Regularly**: Stay up to date with team changes
- **Ask Questions**: Use PR comments or team chat

### After Coding
- **Create PR**: Don't push directly to main
- **Write Description**: Explain what you did and why
- **Request Review**: Tag team members
- **Respond to Feedback**: Be open to suggestions

## 🚨 Common Issues & Solutions

### Issue: "Permission denied"
**Solution**: Make sure you accepted the invitation and have write access

### Issue: "Repository not found"
**Solution**: Check the URL, ensure you're logged in, verify access

### Issue: "Your local changes would be overwritten"
**Solution**: Commit or stash your changes before pulling
```bash
git stash
git pull origin main
git stash pop
```

### Issue: "Failed to push some refs"
**Solution**: Pull first, then push
```bash
git pull origin main
git push origin your-branch
```

## 📝 Quick Reference

### First Time Setup
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin URL
git push -u origin main
```

### Daily Workflow
```bash
git pull origin main
git checkout -b feature/name
# ... make changes ...
git add .
git commit -m "Description"
git push origin feature/name
# Create PR on GitHub
```

### Update from Team
```bash
git checkout main
git pull origin main
git checkout your-branch
git merge main
```

## 🎯 Next Steps

1. ✅ Set up GitHub repository
2. ✅ Invite team members
3. ✅ Everyone clones the repo
4. ✅ Set up branch protection rules (Settings → Branches)
5. ✅ Create initial issues for tasks
6. ✅ Divide work among team members
7. ✅ Start testing!

## 📚 Additional Resources

- [GitHub Desktop](https://desktop.github.com/) - GUI alternative to command line
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)
- [Markdown Guide](https://guides.github.com/features/mastering-markdown/) - For documentation
