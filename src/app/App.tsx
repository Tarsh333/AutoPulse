import { useState } from "react";
import EntryPage from "./components/EntryPage";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import Dashboard from "./components/Dashboard";
import FamilyMembersPage from "./components/FamilyMembersPage";
import SharedDocumentsPage from "./components/SharedDocumentsPage";
import { clearSession, isLoggedIn } from "./api/client";

type Page = "entry" | "login" | "signup" | "dashboard" | "family-members";

export interface ActiveMember {
  id: number;
  name: string;
}

export default function App() {
  // If a valid session already exists, land straight on the dashboard.
  const [currentPage, setCurrentPage] = useState<Page>(
    isLoggedIn() ? "dashboard" : "entry"
  );

  // null = viewing your own dashboard; otherwise a family member you manage.
  const [activeMember, setActiveMember] = useState<ActiveMember | null>(null);

  const handleLogout = () => {
    clearSession();
    setActiveMember(null);
    setCurrentPage("login");
  };

  // Public share links (/share/:token) bypass auth entirely.
  const shareMatch = window.location.pathname.match(/^\/share\/([^/]+)$/);
  if (shareMatch) {
    return <SharedDocumentsPage token={decodeURIComponent(shareMatch[1])} />;
  }

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
          activeMember={activeMember}
          onNavigateToMembers={() => setCurrentPage("family-members")}
          onViewSelf={() => setActiveMember(null)}
          onLogout={handleLogout}
        />
      )}

      {currentPage === "family-members" && (
        <FamilyMembersPage
          onBack={() => setCurrentPage("dashboard")}
          onSelectMember={(m) => {
            setActiveMember(m);
            setCurrentPage("dashboard");
          }}
        />
      )}
    </div>
  );
}
