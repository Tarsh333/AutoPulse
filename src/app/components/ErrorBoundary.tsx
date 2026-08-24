import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

// Catches render/runtime errors in the subtree and shows a fallback
// instead of a blank white screen.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Uncaught UI error:", error, info);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.assign("/");
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-[#EAF2FB] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-10 w-full max-w-md shadow-[0_8px_30px_rgb(47,93,159,0.12)] text-center">
          <h1 className="text-[#1F3E72] mb-3" style={{ fontSize: "24px" }}>
            Something went wrong
          </h1>
          <p className="text-[#5C7BA8] mb-6">
            An unexpected error occurred. Try reloading the page.
          </p>
          <pre className="text-left text-xs bg-[#EAF2FB] text-[#5C7BA8] rounded-lg p-3 mb-6 overflow-auto max-h-40">
            {this.state.error.message}
          </pre>
          <button
            onClick={this.handleReload}
            className="w-full py-3 bg-[#2F5D9F] text-white rounded-xl hover:bg-[#1F3E72] transition-colors"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
