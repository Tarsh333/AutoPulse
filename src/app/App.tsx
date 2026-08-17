import { useState } from "react";
import EntryPage from "./components/EntryPage";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import Dashboard from "./components/Dashboard";
import FamilyMembersPage from "./components/FamilyMembersPage";
import { clearSession, isLoggedIn } from "./api/client";

type Page = "entry" | "login" | "signup" | "dashboard" | "family-members";

export default function App() {
  // If a valid session already exists, land straight on the dashboard.
  const [currentPage, setCurrentPage] = useState<Page>(
    isLoggedIn() ? "dashboard" : "entry"
  );

  const handleLogout = () => {
    clearSession();
    setCurrentPage("login");
  };

  return (
    <div className="size-full">
      {currentPage === "entry" && (
        <EntryPage onGetStarted={() => setCurrentPage("login")} />
      )}

      {currentPage === "login" && (
        <LoginPage
          onLogin={() => setCurrentPage("dashboard")}
          onSwitchToSignup={() => setCurrentPage("signup")}
        />
      )}

      {currentPage === "signup" && (
        <SignupPage
          onSignup={() => setCurrentPage("dashboard")}
          onSwitchToLogin={() => setCurrentPage("login")}
        />
      )}

      {currentPage === "dashboard" && (
        <Dashboard
          onNavigateToMembers={() => setCurrentPage("family-members")}
          onLogout={handleLogout}
        />
      )}

      {currentPage === "family-members" && (
        <FamilyMembersPage onBack={() => setCurrentPage("dashboard")} />
      )}
    </div>
  );
}
