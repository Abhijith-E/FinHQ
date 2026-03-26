"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/users/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                toast.error("Could not send reset link. Please try again.");
                return;
            }

            const data = await res.json();
            setSubmitted(true);
            toast.success("Reset link sent to your email!");
            
            // For Demo purposes: Log the token to allow the user to easily find it and use it
            if (data.reset_token) {
                console.log("DEMO MODE - Reset Token Generated:", data.reset_token);
                // Also redirect to reset password directly with the token for the sake of demo
                setTimeout(() => {
                    router.push(`/reset-password?token=${data.reset_token}`);
                }, 3000);
            }
        } catch {
            toast.error("Could not connect to server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="w-full text-center">
                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Check Your Email</h1>
                <p className="text-slate-400 text-sm mb-8">
                    We've sent a secure reset link to <span className="text-slate-200 font-medium">{email}</span>. Click the link to securely reset your password.
                </p>
                <Link href="/login" className="inline-block w-full py-3 px-4 border border-slate-700 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors">
                    Return to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    Forgot Password
                </h1>
                <p className="text-slate-400 mt-2 text-sm">
                    Enter your email address and we'll send you a secure link to reset your password.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300 block ml-1">Email Address</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                            <Mail className="h-5 w-5" />
                        </div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-800/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {loading ? "Sending..." : "Send Reset Link"}
                            {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    
                    <Link href="/login" className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-slate-700 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>
                </div>
            </form>
        </div>
    );
}
