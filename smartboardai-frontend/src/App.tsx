import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";

type Page = "landing" | "login" | "signup";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");

  const navigateToPage = (page: Page) => {
    setCurrentPage(page);
  };

  const navigateToLanding = () => navigateToPage("landing");
  const navigateToLogin = () => navigateToPage("login");
  const navigateToSignup = () => navigateToPage("signup");

  switch (currentPage) {
    case "login":
      return (
        <LoginPage 
          onNavigateBack={navigateToLanding}
          onNavigateToSignup={navigateToSignup}
        />
      );
    case "signup":
      return (
        <SignupPage 
          onNavigateBack={navigateToLanding}
          onNavigateToLogin={navigateToLogin}
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