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
      console.log("🔄 Cleared localStorage for fresh start");
    } catch {}
  }, []);

  // Always start on landing page
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);



  const navigateToPage = (page: Page) => {
    setCurrentPage(page);
    try {
      window.localStorage.setItem(PAGE_KEY, page);
    } catch {}
  };

  const navigateToLanding = () => {
    setCurrentUser(null);
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
    try {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
      window.localStorage.setItem(PAGE_KEY, "chat");
    } catch {}
    navigateToPage("chat");
  };

  const handleSignupSuccess = (user: User) => {
    setCurrentUser(user);
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
