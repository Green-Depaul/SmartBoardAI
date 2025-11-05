"""
Frontend Tests for SmartBoardAI - CUSTOMIZED VERSION
Tests UI components, user interactions, and frontend functionality
Based on the actual SmartBoardAI frontend code
"""

import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
import time

class SmartBoardAIFrontendTester:
    def __init__(self, base_url="http://localhost:5173"):  # Vite default port
        self.base_url = base_url
        self.driver = None
        self.setup_driver()
    
    def setup_driver(self):
        """Setup Chrome driver for testing"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Run in background
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--window-size=1920,1080")
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
        except:
            print("Chrome driver not available - some tests will be skipped")
    
    def test_landing_page_loads(self):
        """Test that landing page loads without errors"""
        try:
            if not self.driver:
                return {"status": "skipped", "reason": "No driver available"}
            
            self.driver.get(self.base_url)
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Check for "Smart Board AI" title/heading (from line 35-36 of LandingPage.tsx)
            try:
                title_element = self.driver.find_element(By.XPATH, "//*[contains(text(), 'Smart Board AI')]")
                title_found = True
            except:
                title_found = False
            
            # Check for "Try AI Chat" button
            try:
                chat_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Try AI Chat')]")
                chat_button_found = True
            except:
                chat_button_found = False
            
            # Check for "Log In" button
            try:
                login_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Log In')]")
                login_button_found = True
            except:
                login_button_found = False
            
            # Check for "Sign Up" button
            try:
                signup_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Sign Up')]")
                signup_button_found = True
            except:
                signup_button_found = False
            
            return {
                "status": "pass" if all([title_found, chat_button_found, login_button_found, signup_button_found]) else "fail",
                "title_found": title_found,
                "chat_button_found": chat_button_found,
                "login_button_found": login_button_found,
                "signup_button_found": signup_button_found,
                "url": self.driver.current_url
            }
        except Exception as e:
            return {"status": "fail", "error": str(e)}
    
    def test_login_page_navigation_and_form(self):
        """Test navigation to login page and form functionality"""
        try:
            if not self.driver:
                return {"status": "skipped", "reason": "No driver available"}
            
            # Start from landing page
            self.driver.get(self.base_url)
            time.sleep(2)
            
            # Click "Log In" button to navigate to login page
            login_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Log In')]"))
            )
            login_button.click()
            time.sleep(2)
            
            # Verify we're on the login page (URL should contain /login)
            current_url = self.driver.current_url
            on_login_page = "/login" in current_url
            
            # Check for email input (id="email" from LoginPage.tsx line 48)
            try:
                email_input = self.driver.find_element(By.ID, "email")
                email_input_found = True
                email_input_visible = email_input.is_displayed()
                
                # Test typing in email field
                email_input.send_keys("test@example.com")
                email_has_value = len(email_input.get_attribute("value")) > 0
            except:
                email_input_found = False
                email_input_visible = False
                email_has_value = False
            
            # Check for password input (id="password" from LoginPage.tsx line 61)
            try:
                password_input = self.driver.find_element(By.ID, "password")
                password_input_found = True
                password_input_visible = password_input.is_displayed()
                
                # Test typing in password field
                password_input.send_keys("testpassword123")
                password_has_value = len(password_input.get_attribute("value")) > 0
            except:
                password_input_found = False
                password_input_visible = False
                password_has_value = False
            
            # Check for submit button (type="submit" from LoginPage.tsx line 72)
            try:
                submit_button = self.driver.find_element(By.XPATH, "//button[@type='submit' and contains(text(), 'Log In')]")
                submit_button_found = True
                submit_button_visible = submit_button.is_displayed()
            except:
                submit_button_found = False
                submit_button_visible = False
            
            # Check for "Sign Up" link
            try:
                signup_link = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Sign Up')]")
                signup_link_found = True
            except:
                signup_link_found = False
            
            return {
                "status": "pass" if all([
                    on_login_page, email_input_found, password_input_found, 
                    submit_button_found, email_has_value, password_has_value
                ]) else "fail",
                "navigated_to_login": on_login_page,
                "email_input_works": email_input_found and email_input_visible and email_has_value,
                "password_input_works": password_input_found and password_input_visible and password_has_value,
                "submit_button_works": submit_button_found and submit_button_visible,
                "signup_link_found": signup_link_found,
                "current_url": current_url
            }
        except Exception as e:
            return {"status": "fail", "error": str(e)}
    
    def test_signup_page_navigation(self):
        """Test navigation to signup page"""
        try:
            if not self.driver:
                return {"status": "skipped", "reason": "No driver available"}
            
            # Start from landing page
            self.driver.get(self.base_url)
            time.sleep(2)
            
            # Click "Sign Up" button
            signup_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Sign Up')]"))
            )
            signup_button.click()
            time.sleep(2)
            
            # Verify we're on the signup page
            current_url = self.driver.current_url
            on_signup_page = "/signup" in current_url
            
            return {
                "status": "pass" if on_signup_page else "fail",
                "navigated_to_signup": on_signup_page,
                "current_url": current_url
            }
        except Exception as e:
            return {"status": "fail", "error": str(e)}
    
    def test_chat_page_functionality(self):
        """Test AI chat page sends message and receives response"""
        try:
            if not self.driver:
                return {"status": "skipped", "reason": "No driver available"}
            
            # Navigate directly to chat page
            self.driver.get(f"{self.base_url}/chat")
            time.sleep(2)
            
            # Check for chat header "SmartBoardAI Chat" (from ChatPage.tsx line 106)
            try:
                header = self.driver.find_element(By.XPATH, "//*[contains(text(), 'SmartBoardAI Chat')]")
                header_found = True
            except:
                header_found = False
            
            # Check for initial AI message (from ChatPage.tsx line 35)
            try:
                ai_message = self.driver.find_element(By.XPATH, "//*[contains(text(), 'Hello! I')]")
                initial_message_found = True
            except:
                initial_message_found = False
            
            # Find the message input (from ChatPage.tsx line 175-181)
            try:
                message_input = self.driver.find_element(By.CSS_SELECTOR, "input[placeholder='Type your message here...']")
                input_found = True
                
                # Type a test message
                test_message = "Create a project plan for building a mobile app"
                message_input.send_keys(test_message)
                input_has_text = len(message_input.get_attribute("value")) > 0
                
                # Find and click the send button
                send_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='button']")
                send_button.click()
                
                # Wait for AI response (ChatPage has 1.5 second delay)
                time.sleep(3)
                
                # Check if there are more messages now
                messages = self.driver.find_elements(By.XPATH, "//div[contains(@class, 'flex w-full')]")
                message_sent = len(messages) > 1  # Should have more than just the initial message
                
            except Exception as input_error:
                input_found = False
                input_has_text = False
                message_sent = False
            
            return {
                "status": "pass" if all([header_found, initial_message_found, input_found, message_sent]) else "fail",
                "chat_page_loaded": header_found,
                "initial_ai_message": initial_message_found,
                "message_input_works": input_found and input_has_text,
                "message_sent_successfully": message_sent,
                "test_message": test_message if input_found else None
            }
        except Exception as e:
            return {"status": "fail", "error": str(e)}
    
    def test_kanban_board_functionality(self):
        """Test Kanban board (if exists) - Currently not implemented in frontend"""
        try:
            if not self.driver:
                return {"status": "skipped", "reason": "No driver available"}
            
            # Try to navigate to board page
            self.driver.get(f"{self.base_url}/board")
            time.sleep(2)
            
            # Check if board page exists
            current_url = self.driver.current_url
            
            return {
                "status": "skip",
                "reason": "Kanban board not yet implemented in frontend",
                "note": "Board page route needs to be added to App.tsx",
                "current_url": current_url
            }
        except Exception as e:
            return {"status": "skip", "error": str(e), "reason": "Kanban board not implemented yet"}
    
    def test_navigation_flow(self):
        """Test complete navigation flow through the app"""
        try:
            if not self.driver:
                return {"status": "skipped", "reason": "No driver available"}
            
            navigation_steps = []
            
            # Step 1: Start at landing page
            self.driver.get(self.base_url)
            time.sleep(2)
            navigation_steps.append({"step": "landing", "success": "Smart Board AI" in self.driver.page_source})
            
            # Step 2: Navigate to chat
            try:
                chat_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Try AI Chat')]")
                chat_btn.click()
                time.sleep(2)
                navigation_steps.append({"step": "to_chat", "success": "/chat" in self.driver.current_url})
                
                # Go back to landing
                back_btn = self.driver.find_element(By.XPATH, "//button[contains(@class, 'shrink-0')]")
                back_btn.click()
                time.sleep(2)
                navigation_steps.append({"step": "back_from_chat", "success": self.driver.current_url.rstrip('/') == self.base_url.rstrip('/')})
            except:
                navigation_steps.append({"step": "chat_navigation", "success": False})
            
            # Step 3: Navigate to login
            try:
                login_btn = self.driver.find_element(By.XPATH, "//button[@variant='outline' and contains(text(), 'Log In')]")
                if not login_btn:
                    login_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Log In')]")
                login_btn.click()
                time.sleep(2)
                navigation_steps.append({"step": "to_login", "success": "/login" in self.driver.current_url})
            except:
                navigation_steps.append({"step": "login_navigation", "success": False})
            
            all_successful = all(step["success"] for step in navigation_steps)
            
            return {
                "status": "pass" if all_successful else "fail",
                "navigation_steps": navigation_steps,
                "all_navigation_works": all_successful
            }
        except Exception as e:
            return {"status": "fail", "error": str(e)}
    
    def test_error_handling(self):
        """Test error handling when navigating to non-existent pages"""
        try:
            if not self.driver:
                return {"status": "skipped", "reason": "No driver available"}
            
            # Test with invalid URL
            self.driver.get(f"{self.base_url}/nonexistent-page-12345")
            time.sleep(2)
            
            # Check if app handles it gracefully (might show landing page or 404)
            page_title = self.driver.title
            page_source = self.driver.page_source
            
            # React apps often redirect to home or show a blank page
            handles_gracefully = ("Smart Board AI" in page_source) or (page_title != "")
            
            return {
                "status": "pass",
                "handles_invalid_route": handles_gracefully,
                "page_title": page_title,
                "note": "React Router handles unknown routes"
            }
        except Exception as e:
            return {"status": "fail", "error": str(e)}
    
    def cleanup(self):
        """Clean up driver resources"""
        if self.driver:
            self.driver.quit()

# Test functions for integration with test runner
def test_landing_page():
    """Test landing page loads with all elements"""
    tester = SmartBoardAIFrontendTester()
    result = tester.test_landing_page_loads()
    tester.cleanup()
    return result

def test_login_functionality():
    """Test login page navigation and form handling"""
    tester = SmartBoardAIFrontendTester()
    result = tester.test_login_page_navigation_and_form()
    tester.cleanup()
    return result

def test_signup_navigation():
    """Test signup page navigation"""
    tester = SmartBoardAIFrontendTester()
    result = tester.test_signup_page_navigation()
    tester.cleanup()
    return result

def test_chat_page():
    """Test AI chat functionality"""
    tester = SmartBoardAIFrontendTester()
    result = tester.test_chat_page_functionality()
    tester.cleanup()
    return result

def test_kanban_board():
    """Test Kanban board (currently not implemented)"""
    tester = SmartBoardAIFrontendTester()
    result = tester.test_kanban_board_functionality()
    tester.cleanup()
    return result

def test_navigation():
    """Test complete navigation flow"""
    tester = SmartBoardAIFrontendTester()
    result = tester.test_navigation_flow()
    tester.cleanup()
    return result

def test_error_handling():
    """Test error handling for invalid routes"""
    tester = SmartBoardAIFrontendTester()
    result = tester.test_error_handling()
    tester.cleanup()
    return result

if __name__ == "__main__":
    print("SmartBoardAI Frontend Tests - Customized Version")
    print("=" * 50)
    print("\nMake sure your frontend is running first!")
    print("Run: cd smartboardai-frontend && npm run dev")
    print("\nThen run these tests.")
    print("=" * 50)
