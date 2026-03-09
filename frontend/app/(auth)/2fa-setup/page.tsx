"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Copy, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function TwoFactorSetupPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [secret, setSecret] = useState("");
    const [qrCode, setQrCode] = useState("");
    const [code, setCode] = useState("");
    const [copied, setCopied] = useState(false);
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        // In actual implementation, we'd fetch the QR code and secret from the backend here
        // For demo purposes, we'll set mock data after a short delay
        const setup2FA = async () => {
            setLoading(true);
            try {
                // Mock API call
                await new Promise(resolve => setTimeout(resolve, 800));
                setSecret("JBSWY3DPEHPK3PXP");
                setQrCode("https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/FinHQ:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=FinHQ");
            } catch (error) {
                toast.error("Failed to setup 2FA");
            } finally {
                setLoading(false);
            }
        };

        setup2FA();
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(secret);
        setCopied(true);
        toast.success("Secret copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length < 6) {
            toast.error("Please enter a 6-digit code");
            return;
        }

        setVerifying(true);
        try {
            // Mock API call verifying the code
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Assume success
            setVerified(true);
            toast.success("2FA Successfully Enabled!");

            // Redirect to dashboard after a delay
            setTimeout(() => {
                router.push("/dashboard");
            }, 1500);

        } catch (error) {
            toast.error("Invalid verification code");
        } finally {
            setVerifying(false);
        }
    };

    if (verified) {
        return (
            <div className="w-full text-center space-y-6 py-8 animate-in zoom-in duration-500">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/50">
                        <ShieldCheck className="w-10 h-10 text-green-500" />
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Account Secured</h2>
                    <p className="text-slate-400 text-sm">
                        Two-factor authentication has been successfully enabled. Redirecting to your dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-indigo-400" />
                    Secure Your Account
                </h1>
                <p className="text-slate-400 mt-2 text-sm">
                    Set up Two-Factor Authentication (2FA) for extra security
                </p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm animate-pulse">Generating secure keys...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5 text-center">
                        <h3 className="text-sm font-medium text-slate-300 mb-4">1. Scan this QR Code with your Authenticator App</h3>
                        <div className="flex justify-center mb-4">
                            <div className="p-2 bg-white rounded-xl shadow-lg">
                                {qrCode ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={qrCode} alt="2FA QR Code" className="w-36 h-36" />
                                ) : (
                                    <div className="w-36 h-36 bg-slate-200 animate-pulse rounded-lg" />
                                )}
                            </div>
                        </div>
                        <div className="text-left mt-6">
                            <p className="text-xs text-slate-400 mb-2">Or enter this code manually:</p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-slate-900 px-3 py-2 rounded-lg text-indigo-400 font-mono text-sm tracking-wider border border-slate-700">
                                    {secret}
                                </code>
                                <button
                                    onClick={handleCopy}
                                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors"
                                    title="Copy to clipboard"
                                >
                                    {copied ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleVerify} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-300 ml-1">2. Enter the 6-digit code</label>
                            <input
                                type="text"
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                className="mt-1 block w-full px-4 py-3 border border-slate-700 rounded-xl bg-slate-800/50 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 text-center text-2xl tracking-[0.5em] font-mono outline-none transition-all"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={verifying || code.length < 6}
                            className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all group relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {verifying ? "Verifying..." : "Verify and Enable 2FA"}
                                {!verifying && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                            </span>
                        </button>
                    </form>

                    <div className="text-center pt-2">
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="text-xs text-slate-500 hover:text-slate-300 transition-colors underline object-bottom"
                        >
                            Skip for now (Not Recommended)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
