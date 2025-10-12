# Alternative Method: Fork and Pull Request

Since you don't have write access yet, you can fork the repository and create a PR from your fork.

## 📋 Steps to Create PR via Fork

### 1. Fork the Repository
1. Go to: https://github.com/Green-Depaul/SmartBoardAI
2. Click the **"Fork"** button in the top right
3. This creates a copy under your account: `https://github.com/Mc2204/SmartBoardAI`

### 2. Push to Your Fork
```bash
cd /tmp/SmartBoardAI

# Add your fork as a remote
git remote add myfork https://github.com/Mc2204/SmartBoardAI.git

# Push to your fork instead
git push myfork testing-suite-midterm
```

### 3. Create Pull Request from Your Fork
1. Go to: https://github.com/Mc2204/SmartBoardAI
2. You'll see a banner: "testing-suite-midterm had recent pushes"
3. Click **"Compare & pull request"**
4. Make sure it shows:
   - **base repository**: `Green-Depaul/SmartBoardAI` base: `main`
   - **head repository**: `Mc2204/SmartBoardAI` compare: `testing-suite-midterm`
5. Add your PR title and description
6. Click **"Create pull request"**

### 4. Your Team Can Review and Merge
- Green-Depaul and your team members can review
- They can approve and merge directly into the main repository
- This is a common workflow for open source and team projects!

## ✅ Benefits of This Method
- You don't need to wait for collaborator access
- You can create the PR right now
- Team can still review and approve
- Common practice in software development

