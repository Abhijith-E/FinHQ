import { useMemo, useEffect } from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
    password: string;
    onStrengthChange?: (isStrong: boolean) => void;
}

export function PasswordStrengthMeter({ password, onStrengthChange }: PasswordStrengthProps) {
    const requirements = useMemo(() => [
        { id: "length", text: "At least 14 characters", fulfilled: password.length >= 14 },
        { id: "upper", text: "At least one uppercase letter", fulfilled: /[A-Z]/.test(password) },
        { id: "lower", text: "At least one lowercase letter", fulfilled: /[a-z]/.test(password) },
        { id: "number", text: "At least one number", fulfilled: /\d/.test(password) },
        { id: "special", text: "At least one special character", fulfilled: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
    ], [password]);

    const score = requirements.filter(r => r.fulfilled).length;
    const allFulfilled = score === requirements.length;

    useEffect(() => {
        onStrengthChange?.(allFulfilled);
    }, [allFulfilled, onStrengthChange]);

    const getStrengthColor = () => {
        if (score === 0) return "bg-slate-700";
        if (score <= 2) return "bg-red-500";
        if (score <= 4) return "bg-yellow-500";
        return "bg-green-500";
    };

    const getStrengthText = () => {
        if (score === 0) return "";
        if (score <= 2) return "Weak";
        if (score <= 4) return "Fair";
        return "Strong";
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-medium">
                    <span className="text-slate-300">Password strength</span>
                    <span className={score === 5 ? "text-green-400" : "text-slate-400"}>
                        {getStrengthText()}
                    </span>
                </div>
                <div className="flex h-1.5 gap-1.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                        <div
                            key={level}
                            className={`flex-1 rounded-full transition-colors duration-300 ${
                                level <= score ? getStrengthColor() : "bg-slate-700"
                            }`}
                        />
                    ))}
                </div>
            </div>

            <div className="space-y-1.5">
                {requirements.map((req) => (
                    <div key={req.id} className="flex items-center gap-2 text-xs">
                        {req.fulfilled ? (
                            <Check className="h-3 w-3 text-green-500" />
                        ) : (
                            <X className="h-3 w-3 text-slate-500" />
                        )}
                        <span className={req.fulfilled ? "text-slate-300" : "text-slate-500"}>
                            {req.text}
                        </span>
                    </div>
                ))}
            </div>
            
            {!allFulfilled && password.length > 0 && (
                <p className="text-xs text-amber-400/80 italic mt-2">
                    Password must meet all criteria to proceed.
                </p>
            )}
        </div>
    );
}
