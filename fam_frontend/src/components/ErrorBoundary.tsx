import React, { Component, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: "4rem 2rem", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
                    <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⚠️</div>
                    <h2 style={{ fontSize: "2rem", color: "#ef4444", marginBottom: "1rem" }}>Oops! Something went wrong.</h2>
                    <p style={{ color: "#4b5563", marginBottom: "2rem", lineHeight: "1.6" }}>
                        We encountered an unexpected issue while loading this page.
                        This might be due to a network error or a temporary glitch.
                    </p>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: "0.75rem 1.5rem",
                                background: "#3b82f6",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "1rem"
                            }}>
                            Try Again
                        </button>
                        <button
                            onClick={() => window.location.href = "/"}
                            style={{
                                padding: "0.75rem 1.5rem",
                                background: "#e5e7eb",
                                color: "#374151",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "1rem"
                            }}>
                            Go Home
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
