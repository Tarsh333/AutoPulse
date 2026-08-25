
  import { createRoot } from "react-dom/client";
  import { Toaster } from "sonner";
  import App from "./app/App.tsx";
  import ErrorBoundary from "./app/components/ErrorBoundary.tsx";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
      <App />
      <Toaster richColors position="top-right" />
    </ErrorBoundary>
  );
