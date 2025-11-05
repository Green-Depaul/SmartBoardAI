# How to Run the Customized Frontend Tests for SmartBoardAI

## 🎉 Good News!
I've created **customized frontend tests** specifically for your SmartBoardAI app based on the actual code!

## 📁 Files
- **`frontend_tests_customized.py`** - Tests customized for YOUR actual frontend
- **`frontend_tests.py`** - Original generic template (keep for reference)

## 🚀 Quick Start

### Step 1: Start Your Frontend
```bash
# Open a terminal and navigate to your project
cd ~/path/to/SmartBoardAI/smartboardai-frontend

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

Your frontend will start on **http://localhost:5173** (Vite default port)

### Step 2: Run the Customized Tests
```bash
# Open a NEW terminal window
cd ~/path/to/Testing_Midterm

# Make sure you have dependencies installed
pip install selenium webdriver-manager

# Run all frontend tests
python -c "from frontend_tests_customized import *; from test_runner import TestRunner; r = TestRunner(); r.run_test('Landing Page', test_landing_page); r.run_test('Login', test_login_functionality); r.run_test('Chat', test_chat_page); r.run_test('Navigation', test_navigation); r.generate_report()"
```

### Step 3: Or Test One at a Time
```bash
# Test landing page only
python -c "from frontend_tests_customized import test_landing_page; print(test_landing_page())"

# Test login page only
python -c "from frontend_tests_customized import test_login_functionality; print(test_login_functionality())"

# Test chat page only
python -c "from frontend_tests_customized import test_chat_page; print(test_chat_page())"

# Test navigation flow
python -c "from frontend_tests_customized import test_navigation; print(test_navigation())"
```

## ✅ What These Tests Do

### 1. **Landing Page Test** (`test_landing_page`)
- ✅ Checks page loads
- ✅ Verifies "Smart Board AI" title appears
- ✅ Finds "Try AI Chat" button
- ✅ Finds "Log In" button
- ✅ Finds "Sign Up" button

### 2. **Login Page Test** (`test_login_functionality`)
- ✅ Navigates from landing to login page
- ✅ Finds email input field (id="email")
- ✅ Finds password input field (id="password")
- ✅ Tests typing in both fields
- ✅ Finds submit button
- ✅ Finds "Sign Up" link

### 3. **Signup Page Test** (`test_signup_navigation`)
- ✅ Navigates from landing to signup page
- ✅ Verifies URL contains "/signup"

### 4. **Chat Page Test** (`test_chat_page`)
- ✅ Navigates to chat page
- ✅ Finds "SmartBoardAI Chat" header
- ✅ Finds initial AI greeting message
- ✅ Finds message input field
- ✅ Types a test message
- ✅ Clicks send button
- ✅ Waits for AI response
- ✅ Verifies message was sent

### 5. **Navigation Test** (`test_navigation`)
- ✅ Tests complete flow through the app
- ✅ Landing → Chat → Back
- ✅ Landing → Login

### 6. **Kanban Board Test** (`test_kanban_board`)
- ⏸️ Currently skipped (board not implemented yet in frontend)
- 📝 Note: You'll need to add a board page to App.tsx

## 📊 Expected Output

When tests pass, you'll see:
```
✓ Landing Page: PASS
✓ Login: PASS  
✓ Chat: PASS
✓ Navigation: PASS
```

## 🔧 What Makes These Tests Special

These tests are **specifically customized** for your SmartBoardAI code:

1. **Correct Port**: Uses `http://localhost:5173` (Vite default)
2. **Actual Element IDs**: Uses `id="email"`, `id="password"` from your LoginPage.tsx
3. **Real Button Text**: Searches for "Try AI Chat", "Log In", "Sign Up" 
4. **Actual Routes**: Tests `/login`, `/signup`, `/chat` from your App.tsx
5. **Chat Input**: Uses the exact placeholder text from your ChatPage.tsx
6. **AI Response Wait**: Accounts for the 1.5 second delay in your hardcoded responses

## 🐛 Troubleshooting

### "Chrome driver not available"
```bash
# Install Chrome driver
brew install chromedriver  # macOS
```

### "Connection refused"
- Make sure frontend is running: `npm run dev`
- Check it's on port 5173: open http://localhost:5173 in browser

### "Element not found"
- The frontend might have changed after I analyzed it
- Check the actual HTML in Chrome DevTools
- Update the selectors in `frontend_tests_customized.py`

### Tests run too fast
- Add more `time.sleep(2)` calls if needed
- The tests already have delays built in

## 📝 Backend Tests

The backend tests in `backend_tests.py` also need the backend running:

```bash
# In another terminal
cd ~/path/to/SmartBoardAI/smartboard-api
# ... start your backend API ...
```

Then you can test the API endpoints directly!

## 🎯 Next Steps

### To Test Everything:
1. **Terminal 1**: Start frontend (`npm run dev`)
2. **Terminal 2**: Start backend (your API)
3. **Terminal 3**: Run all tests (`python run_all_tests.py`)

### To Add Board Tests:
When you implement the Kanban board page:
1. Add route to `App.tsx`
2. Update `test_kanban_board_functionality()` in `frontend_tests_customized.py`
3. Add the actual element selectors for your board

## 💡 Pro Tip

Run tests in **headless mode** (default) for speed, or **with browser visible** for debugging:

```python
# In frontend_tests_customized.py, line 23
# Comment out this line to see the browser:
# chrome_options.add_argument("--headless")
```

## 🎉 Summary

You now have:
- ✅ Customized tests matching your actual frontend
- ✅ Tests for landing, login, signup, and chat pages
- ✅ Navigation flow testing
- ✅ Ready to run immediately!

Just start your frontend and run the tests! 🚀

