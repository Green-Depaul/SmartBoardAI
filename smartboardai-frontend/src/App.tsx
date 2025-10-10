import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { ChatPage } from "./components/ChatPage";
import { KanbanBoard } from "./components/KanbanBoard";

type Page = "landing" | "login" | "signup" | "chat" | "kanban";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");

  const navigateToPage = (page: Page) => {
    setCurrentPage(page);
  };

  const navigateToLanding = () => navigateToPage("landing");
  const navigateToLogin = () => navigateToPage("login");
  const navigateToSignup = () => navigateToPage("signup");
  const navigateToChat = () => navigateToPage("chat");
  const navigateToKanban = () => navigateToPage("kanban");

  switch (currentPage) {
    case "login":
      return (
        <LoginPage 
          onNavigateBack={navigateToLanding}
          onNavigateToSignup={navigateToSignup}
          onNavigateToChat={navigateToChat}
        />
      );
    case "signup":
      return (
        <SignupPage 
          onNavigateBack={navigateToLanding}
          onNavigateToLogin={navigateToLogin}
          onNavigateToChat={navigateToChat}
        />
      );
    case "chat":
      return (
        <ChatPage 
          onNavigateBack={navigateToLanding}
          onNavigateToKanban={navigateToKanban}
        />
      );
    case "kanban":
      return (
        <KanbanBoard 
          onNavigateBack={navigateToChat}
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