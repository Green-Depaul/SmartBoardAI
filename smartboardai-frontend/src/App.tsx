import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { ChatPage, type Message } from "./components/ChatPage";
import { KanbanBoard } from "./components/KanbanBoard";
import { api, type User } from "./services/api";

type Page = "landing" | "login" | "signup" | "chat" | "kanban";

const initialMessages: Message[] = [
  {
    id: "1",
    text: "Hello! I'm your Smart Board AI assistant. Tell me about your project or idea, and I'll help you break it down into organized tasks.",
    sender: "ai",
    timestamp: new Date(),
  },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const navigateToPage = (page: Page) => {
    setCurrentPage(page);
  };

  const navigateToLanding = () => {
    setCurrentUser(null);
    navigateToPage("landing");
  };
  const navigateToLogin = () => navigateToPage("login");
  const navigateToSignup = () => navigateToPage("signup");
  const navigateToChat = () => navigateToPage("chat");
  const navigateToKanban = () => navigateToPage("kanban");

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    navigateToPage("chat");
  };

  const handleSignupSuccess = (user: User) => {
    setCurrentUser(user);
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
      return (
        <KanbanBoard 
          onNavigateBack={navigateToChat}
          currentUser={currentUser || undefined}
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