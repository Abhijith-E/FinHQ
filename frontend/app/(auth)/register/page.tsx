"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";

type Step = 1 | 2 | 3;

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
        riskTolerance: "moderate",
        goal: "wealth_growth",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => setStep((s) => (s + 1) as Step);
    const prevStep = () => setStep((s) => (s - 1) as Step);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step < 3) {
            nextStep();
            return;
        }

        setLoading(true);
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${apiBase}/api/v1/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    full_name: formData.name,
                    risk_profile: formData.riskTolerance,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                toast.error((data as { detail?: string })?.detail || "Registration failed. Email might already exist.");
                return;
            }

            toast.success("Account created! Setting up 2FA...");
            router.push("/2fa-setup");
        } catch {
            toast.error("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            {/* Heading */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    Create Account
                </h1>
                <p className="text-slate-400 mt-2 text-sm">
                    Join FinHQ and transform your investments
                </p>
            </div>

            {/* Step Progress Bar */}
            <div className="flex justify-between items-center mb-2 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 -z-10 rounded-full">
                    <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${((step - 1) / 2) * 100}%` }}
                    />
                </div>
                {[1, 2, 3].map((num) => (
                    <div
                        key={num}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${step >= num
                                ? "bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}
                    >
                        {step > num ? <CheckCircle2 className="w-4 h-4" /> : num}
                    </div>
                ))}
            </div>

            {/* Step Label */}
            <p className="text-center text-xs text-slate-500 mb-6 uppercase tracking-widest">
                {step === 1 ? "Your Identity" : step === 2 ? "Secure Password" : "Investment Profile"}
            </p>

            {/* Form — normal document flow, no absolute positioning */}
            <form onSubmit={handleSubmit} className="space-y-5">

                {/* Step 1 — Identity */}
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-300">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-300 block ml-1">Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 group-focus-within:text-indigo-400 pointer-events-none">
                                    <User className="h-5 w-5" />
                                </div>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-800/50 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-300 block ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 group-focus-within:text-indigo-400 pointer-events-none">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-800/50 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2 — Password */}
                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-300">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-300 block ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 group-focus-within:text-indigo-400 pointer-events-none">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    minLength={8}
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-800/50 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                                    placeholder="Min. 8 characters"
                                />
                            </div>
                        </div>
                        <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/80">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Requirements</p>
                            {["At least 8 characters", "One uppercase letter", "One number or special character"].map((req) => (
                                <div key={req} className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600 flex-shrink-0" />
                                    {req}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3 — Investment Profile */}
                {step === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-300">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-300 block ml-1">Risk Tolerance</label>
                            <select
                                name="riskTolerance"
                                value={formData.riskTolerance}
                                onChange={handleChange}
                                className="block w-full px-3 py-3 border border-slate-700 rounded-xl bg-slate-800/50 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm appearance-none"
                            >
                                <option value="low">Low — Capital Preservation</option>
                                <option value="moderate">Moderate — Balanced Growth</option>
                                <option value="high">High — Maximum Returns</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-300 block ml-1">Primary Investment Goal</label>
                            <select
                                name="goal"
                                value={formData.goal}
                                onChange={handleChange}
                                className="block w-full px-3 py-3 border border-slate-700 rounded-xl bg-slate-800/50 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm appearance-none"
                            >
                                <option value="retirement">Retirement Planning</option>
                                <option value="wealth_growth">Wealth Accumulation</option>
                                <option value="day_trading">Active Day Trading</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons — always flows naturally below the fields */}
                <div className="flex gap-3 pt-2">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="flex-1 py-3 px-4 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-all font-medium flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`${step > 1 ? "flex-[2]" : "w-full"} flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed group`}
                    >
                        <span className="flex items-center gap-2">
                            {loading ? (
                                "Processing..."
                            ) : step === 3 ? (
                                "Create Account"
                            ) : (
                                <>
                                    Next Step
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </span>
                    </button>
                </div>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                    Sign in
                </Link>
            </p>
        </div>
    );
}
