# How to Customize Tests for Your SmartBoardAI Frontend

## 🎯 Quick Answer
The tests are **templates** - you need to customize them to match YOUR actual pages!

## 📋 Step-by-Step Customization

### Step 1: Find Your Element Selectors

1. **Start your frontend**:
   ```bash
   # In your SmartBoardAI project
   cd smartboard-api  # or wherever your frontend is
   npm start  # or however you run it
   ```

2. **Open Chrome DevTools**:
   - Open your app in Chrome
   - Right-click on an element → "Inspect"
   - Look at the HTML structure

3. **Find the selectors**:
   - Look for `id`, `class`, or `data-testid` attributes
   - Example: `<button class="submit-btn">` → use `.submit-btn`
   - Example: `<input id="email">` → use `#email`

### Step 2: Update the Test File

Edit `testing/frontend_tests.py` with your actual selectors.

#### Example: Login Page

**Your HTML might look like:**
```html
<input id="email-input" type="email" />
<input id="password-input" type="password" />
<button class="login-button">Login</button>
```

**Update line 66-68 to:**
```python
# Change from generic selectors:
email_input = self.driver.find_element(By.CSS_SELECTOR, "input[type='email'], input[name='email']")

# To YOUR specific selectors:
email_input = self.driver.find_element(By.ID, "email-input")
password_input = self.driver.find_element(By.ID, "password-input")
submit_button = self.driver.find_element(By.CLASS_NAME, "login-button")
```

#### Example: Kanban Board

**Your HTML might look like:**
```html
<button data-testid="add-task-btn">Add Task</button>
<div class="task-card">Task content</div>
```

**Update line 127-140 to:**
```python
# Use YOUR actual selectors
add_button = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='add-task-btn']")
task_title = self.driver.find_element(By.ID, "task-title-input")
tasks = self.driver.find_elements(By.CLASS_NAME, "task-card")
```

### Step 3: Update URLs

In `test_config.py`, update the URLs:

```python
# Change to YOUR actual URLs
FRONTEND_URL = "http://localhost:3000"  # or your port
BACKEND_URL = "http://localhost:8000"   # or your port
```

### Step 4: Test One Page at a Time

Don't run all tests at once! Test individually:

```bash
cd testing/

# Test just the landing page
python -c "from frontend_tests import test_landing_page; print(test_landing_page())"

# Test just login
python -c "from frontend_tests import test_login_signup; print(test_login_signup())"
```

## 🔍 How to Find the Right Selectors

### Method 1: Inspect Element
1. Right-click element → "Inspect"
2. Look for:
   - `id="something"` → use `By.ID, "something"`
   - `class="something"` → use `By.CLASS_NAME, "something"`
   - `data-testid="something"` → use `By.CSS_SELECTOR, "[data-testid='something']"`

### Method 2: Use Chrome Console
Open Console (F12) and test selectors:
```javascript
// Test if selector works
document.querySelector("#email-input")  // Should return the element
document.querySelector(".login-button")  // Should return the button
```

### Method 3: Add Test IDs to Your Code
Best practice - add `data-testid` to your HTML:

```jsx
// In your React/HTML code
<button data-testid="login-submit">Login</button>
<input data-testid="email-input" type="email" />
```

Then in tests:
```python
element = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='login-submit']")
```

## 📝 Common Selector Patterns

```python
# By ID
element = self.driver.find_element(By.ID, "my-id")

# By Class
element = self.driver.find_element(By.CLASS_NAME, "my-class")

# By CSS Selector
element = self.driver.find_element(By.CSS_SELECTOR, ".class-name")
element = self.driver.find_element(By.CSS_SELECTOR, "#id-name")
element = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='test-id']")

# By Tag Name
element = self.driver.find_element(By.TAG_NAME, "button")

# By Text Content (XPath)
element = self.driver.find_element(By.XPATH, "//button[text()='Login']")

# Multiple elements
elements = self.driver.find_elements(By.CLASS_NAME, "task-item")
```

## ⚠️ Important Notes

### 1. Frontend Must Be Running
Before running tests:
```bash
# Terminal 1: Start your frontend
cd smartboard-api
npm start

# Terminal 2: Run tests
cd testing/
python run_all_tests.py
```

### 2. Tests Are Currently Generic
The tests I created use **generic selectors** that might not match your actual HTML. You MUST customize them!

### 3. Start Simple
Don't try to test everything at once:
1. Get landing page test working first
2. Then login test
3. Then others one by one

### 4. Backend Tests Work Immediately
The backend tests in `backend_tests.py` will work as soon as your API is running - no customization needed (just URLs)!

## 🚀 Quick Start Workflow

```bash
# 1. Start your frontend and backend
cd ~/path/to/SmartBoardAI
# ... start your servers ...

# 2. Find one element selector
# Open browser, inspect element, note the class/id

# 3. Update ONE test
# Edit testing/frontend_tests.py
# Update selectors for landing page test only

# 4. Test it
cd testing/
python -c "from frontend_tests import test_landing_page; print(test_landing_page())"

# 5. If it works, move to next test
# Repeat for login, AI page, kanban board
```

## 💡 Pro Tip

Add this to your React/HTML components to make testing easier:

```jsx
// Add data-testid attributes
<button data-testid="add-task-button">Add Task</button>
<input data-testid="task-title-input" placeholder="Title" />
<div data-testid="task-card" className="task">...</div>
```

Then tests become simple:
```python
add_btn = driver.find_element(By.CSS_SELECTOR, "[data-testid='add-task-button']")
```

## 🆘 Troubleshooting

**"Element not found"** → Your selector doesn't match. Inspect the page and update selector.

**"Chrome driver not available"** → Install: `brew install chromedriver` (macOS)

**Tests skip/fail immediately** → Make sure frontend is running on the correct port!

**Page loads but can't find elements** → Add `time.sleep(3)` to wait for page to fully load

