import { ParticleBackground } from "@/components/ui/particle-background";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <ParticleBackground />
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm -z-10" />

            <div className="w-full max-w-md p-6 relative z-10">
                <div className="backdrop-blur-md bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl p-8 transform transition-all duration-300 hover:shadow-indigo-500/10">
                    <div className="mb-8 flex justify-center">
                        <div className="h-12 w-12 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
                            FQ
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
