import { Routes, Route, useNavigate } from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";

function LandingRoute() {
  const navigate = useNavigate();
  return (
    <LandingPage
      onNavigateToLogin={() => navigate("/login")}
      onNavigateToSignup={() => navigate("/signup")}
    />
  );
}

function LoginRoute() {
  const navigate = useNavigate();
  return (
    <LoginPage
      onNavigateBack={() => navigate("/")}
      onNavigateToSignup={() => navigate("/signup")}
    />
  );
}

function SignupRoute() {
  const navigate = useNavigate();
  return (
    <SignupPage
      onNavigateBack={() => navigate("/")}
      onNavigateToLogin={() => navigate("/login")}
    />
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingRoute />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/signup" element={<SignupRoute />} />
    </Routes>
  );
}