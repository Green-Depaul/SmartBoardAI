import { useEffect, useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { ChatPage, type Message } from "./components/ChatPage";
import { KanbanBoard } from "./components/KanbanBoard";
import { api, type User } from "./services/api";

type Page = "landing" | "login" | "signup" | "chat" | "kanban";

// Message interface imported from ChatPage

const initialMessages: Message[] = [
  // Removed default AI greeting message
];

export default function App() {
  // Keys for localStorage
  const USER_KEY = "sbai.currentUser";
  const PAGE_KEY = "sbai.currentPage";

  // Clear localStorage on startup to force fresh state
  useEffect(() => {
    try {
      window.localStorage.removeItem(USER_KEY);
      window.localStorage.removeItem(PAGE_KEY);
      // Clear all user-specific chat data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sbai.chat.')) {
          localStorage.removeItem(key);
        }
      });
      console.log("🔄 Cleared localStorage for fresh start");
    } catch {}
  }, []);

  // Always start on landing page
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  // User-specific chat message management
  const getChatKey = (userId: number) => `sbai.chat.${userId}`;

  const loadUserMessages = (user: User) => {
    try {
      const chatKey = getChatKey(user.id);
      const savedMessages = localStorage.getItem(chatKey);
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        // Restore timestamps as Date objects
        const restoredMessages = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(restoredMessages);
        console.log(`🔄 Loaded ${restoredMessages.length} chat messages for user ${user.email}`);
      } else {
        setMessages(initialMessages);
        console.log(`🆕 No saved chat history for user ${user.email}`);
      }
    } catch (error) {
      console.error('Error loading user messages:', error);
      setMessages(initialMessages);
    }
  };

  const saveUserMessages = (user: User, messagesToSave: Message[]) => {
    try {
      const chatKey = getChatKey(user.id);
      localStorage.setItem(chatKey, JSON.stringify(messagesToSave));
    } catch (error) {
      console.error('Error saving user messages:', error);
    }
  };

  const clearUserMessages = () => {
    setMessages(initialMessages);
    console.log("🧹 Cleared chat messages for user switch");
  };

  // Auto-save messages when they change (for current user)
  useEffect(() => {
    if (currentUser && messages.length > 0) {
      saveUserMessages(currentUser, messages);
    }
  }, [messages, currentUser]);



  const navigateToPage = (page: Page) => {
    setCurrentPage(page);
    try {
      window.localStorage.setItem(PAGE_KEY, page);
    } catch {}
  };

  const navigateToLanding = () => {
    // Save current user's messages before logout
    if (currentUser) {
      saveUserMessages(currentUser, messages);
    }
    
    // Clear current state
    setCurrentUser(null);
    clearUserMessages();
    
    try {
      window.localStorage.removeItem(USER_KEY);
      window.localStorage.setItem(PAGE_KEY, "landing");
    } catch {}
    navigateToPage("landing");
  };
  const navigateToLogin = () => navigateToPage("login");
  const navigateToSignup = () => navigateToPage("signup");
  const navigateToChat = () => navigateToPage("chat");
  const navigateToKanban = () => {
    if (currentUser) {
      navigateToPage("kanban");
    } else {
      navigateToPage("login");
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    loadUserMessages(user); // Load user-specific chat history
    try {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
      window.localStorage.setItem(PAGE_KEY, "chat");
    } catch {}
    navigateToPage("chat");
  };

  const handleSignupSuccess = (user: User) => {
    setCurrentUser(user);
    loadUserMessages(user); // Load user-specific chat history (will be empty for new users)
    try {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
      window.localStorage.setItem(PAGE_KEY, "chat");
    } catch {}
    navigateToPage("chat");
  };

  switch (currentPage) {
    case "login":
      return (
        <LoginPage 
          onNavigateBack={navigateToLanding}
          onNavigateToSignup={navigateToSignup}
          onNavigateToChat={navigateToChat}
          onLoginSuccess={handleLoginSuccess}
        />
      );
    case "signup":
      return (
        <SignupPage 
          onNavigateBack={navigateToLanding}
          onNavigateToLogin={navigateToLogin}
          onNavigateToChat={navigateToChat}
          onSignupSuccess={handleSignupSuccess}
        />
      );
    case "chat":
      return (
        <ChatPage
          onNavigateBack={navigateToLanding}
          onNavigateToKanban={navigateToKanban}
          currentUser={currentUser || undefined}
          messages={messages}
          setMessages={setMessages}
        />
      );
    case "kanban":
      return currentUser ? (
        <KanbanBoard 
          onNavigateBack={navigateToChat}
          onLogout={navigateToLanding}
          currentUser={currentUser}
        />
      ) : (
        <LoginPage 
          onNavigateBack={navigateToLanding}
          onNavigateToSignup={navigateToSignup}
          onNavigateToChat={navigateToChat}
          onLoginSuccess={handleLoginSuccess}
        />
      );
    default:
      return (
        <LandingPage 
          onNavigateToLogin={navigateToLogin}
          onNavigateToSignup={navigateToSignup}
        />
      );
  }
}
