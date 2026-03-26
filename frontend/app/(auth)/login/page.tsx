"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [requires2FA, setRequires2FA] = useState(false);
    const [tempToken, setTempToken] = useState("");
    const [totpCode, setTotpCode] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const form = new FormData(e.currentTarget);
        const email = form.get("email") as string;
        const password = form.get("password") as string;

        try {
            // FastAPI OAuth2PasswordRequestForm requires form-encoded body
            const body = new URLSearchParams();
            body.append("username", email);
            body.append("password", password);

            const res = await fetch(`${API_BASE}/api/v1/auth/login/access-token`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: body.toString(),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                toast.error((data as { detail?: string })?.detail || "Invalid email or password");
                return;
            }

            const tokens = await res.json();
            
            if (tokens.requires_2fa) {
                setTempToken(tokens.access_token);
                setRequires2FA(true);
                toast.success("Please enter your 2FA code");
                return;
            }

            localStorage.setItem("access_token", tokens.access_token);
            if (tokens.refresh_token) {
                localStorage.setItem("refresh_token", tokens.refresh_token);
            }

            toast.success("Welcome back!");
            router.push("/dashboard");
        } catch {
            toast.error("Could not connect to server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/v1/auth/login/verify-2fa`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: tempToken, code: totpCode }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                toast.error((data as { detail?: string })?.detail || "Invalid 2FA code");
                return;
            }
            const tokens = await res.json();
            localStorage.setItem("access_token", tokens.access_token);
            if (tokens.refresh_token) {
                localStorage.setItem("refresh_token", tokens.refresh_token);
            }
            toast.success("Welcome back!");
            router.push("/dashboard");
        } catch {
            toast.error("Could not connect to server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    {requires2FA ? "Two-Factor Auth" : "Welcome Back"}
                </h1>
                <p className="text-slate-400 mt-2 text-sm">
                    {requires2FA ? "Enter the 6-digit code from your authenticator app" : "Sign in to your FinHQ account to continue"}
                </p>
            </div>

            {requires2FA ? (
                <form onSubmit={handleVerify2FA} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-300 block ml-1 text-center">Authenticator Code</label>
                        <input
                            type="text"
                            required
                            value={totpCode}
                            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                            className="block w-full px-4 py-3 border border-slate-700 rounded-xl bg-slate-800/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-center tracking-[0.5em] font-mono text-lg"
                            placeholder="000000"
                            maxLength={6}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || totpCode.length !== 6}
                        className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {loading ? "Verifying..." : "Verify Code"}
                            {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button
                        type="button"
                        onClick={() => { setRequires2FA(false); setTotpCode(""); }}
                        className="w-full text-xs text-slate-400 hover:text-slate-300 transition-colors mt-2 text-center block"
                    >
                        Back to login
                    </button>
                </form>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300 block ml-1">Email</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                            <Mail className="h-5 w-5" />
                        </div>
                        <input
                            name="email"
                            type="email"
                            required
                            className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-800/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between ml-1">
                        <label className="text-sm font-medium text-slate-300">Password</label>
                        <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                            <Lock className="h-5 w-5" />
                        </div>
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            className="block w-full pl-10 pr-10 py-3 border border-slate-700 rounded-xl bg-slate-800/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        {loading ? "Signing in..." : "Sign in"}
                        {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                </form>
            )}

            <p className="mt-8 text-center text-sm text-slate-400">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                    Sign up
                </Link>
            </p>
        </div>
    );
}
