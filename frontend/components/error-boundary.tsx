"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ErrorBoundary({
    children,
}: {
    children: React.ReactNode
}) {
    const [hasError, setHasError] = useState(false)

    useEffect(() => {
        const handleError = (error: ErrorEvent) => {
            console.error("Caught error:", error)
            setHasError(true)
        }
        window.addEventListener("error", handleError)
        return () => window.removeEventListener("error", handleError)
    }, [])

    if (hasError) {
        return (
            <Card className="m-4 border-red-200 bg-red-50">
                <CardHeader>
                    <CardTitle className="text-red-800">Something went wrong</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-red-700">
                        A client-side error occurred. Please try refreshing the page.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return <>{children}</>
}
