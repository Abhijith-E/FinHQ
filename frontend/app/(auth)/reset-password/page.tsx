"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { PasswordStrengthMeter } from "@/components/auth/password-strength";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error("Invalid or missing reset token.");
        }
    }, [token]);

    const isValidPassword = (pwd: string) => {
        return pwd.length >= 14 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd) && /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!token) {
            toast.error("No valid reset token found.");
            return;
        }

        if (!isValidPassword(password)) {
            toast.error("Please ensure your password meets all strength criteria.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/api/v1/users/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, new_password: password }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                toast.error((data as { detail?: string })?.detail || "Could not reset password. Your token may have expired.");
                return;
            }

            setSuccess(true);
            toast.success("Password successfully updated!");
            
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch {
            toast.error("Could not connect to server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="w-full text-center animate-in fade-in duration-500">
                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Password Updated!</h1>
                <p className="text-slate-400 text-sm mb-8">
                    Your password has been successfully reset. Redirecting you to login...
                </p>
                <button
                    onClick={() => router.push("/login")}
                    className="inline-block w-full py-3 px-4 border border-slate-700 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                    Return to Login
                </button>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    Secure Reset
                </h1>
                <p className="text-slate-400 mt-2 text-sm">
                    Enter your new secure password below to regain access.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300 block ml-1">New Password</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                            <Lock className="h-5 w-5" />
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-800/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                            placeholder="Min. 14 characters"
                        />
                    </div>
                </div>

                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/80">
                    <PasswordStrengthMeter password={password} />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading || !isValidPassword(password) || !token}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {loading ? "Resetting..." : "Reset Password"}
                            {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="text-center py-8 text-slate-400">Loading secure connection...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
