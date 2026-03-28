"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
    private errorHandlerBound: ((event: ErrorEvent) => void) | null = null;
    private unhandledRejectionHandlerBound: ((event: PromiseRejectionEvent) => void) | null = null;

    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught React error:", error, errorInfo);
    }

    public componentDidMount() {
        this.errorHandlerBound = (event: ErrorEvent) => {
            console.error("Global error caught:", event.error);
            this.setState({ hasError: true, error: event.error });
        };

        this.unhandledRejectionHandlerBound = (event: PromiseRejectionEvent) => {
            console.error("Unhandled promise rejection:", event.reason);
            this.setState({ hasError: true, error: event.reason instanceof Error ? event.reason : new Error(String(event.reason)) });
        };

        window.addEventListener("error", this.errorHandlerBound);
        window.addEventListener("unhandledrejection", this.unhandledRejectionHandlerBound);
    }

    public componentWillUnmount() {
        if (this.errorHandlerBound) {
            window.removeEventListener("error", this.errorHandlerBound);
        }
        if (this.unhandledRejectionHandlerBound) {
            window.removeEventListener("unhandledrejection", this.unhandledRejectionHandlerBound);
        }
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: undefined });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <Card className="m-4 border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-800">Something went wrong</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-red-700">
                            A client-side error occurred. Please try refreshing the page.
                        </p>
                        {this.state.error && (
                            <div className="bg-red-100 border border-red-300 rounded p-3">
                                <p className="text-sm font-mono text-red-800 break-all">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}
                        <button
                            onClick={this.handleRetry}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50 transition-colors"
                        >
                            Refresh Page
                        </button>
                    </CardContent>
                </Card>
            );
        }

        return this.props.children;
    }
}
