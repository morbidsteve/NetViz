import "@/app/globals.css"
import type { ReactNode } from "react"
import SessionWrapper from "@/components/SessionWrapper"

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
        <head>
            <title>Network Topology Visualizer</title>
        </head>
        <body className="min-h-screen bg-background">
        <SessionWrapper>{children}</SessionWrapper>
        </body>
        </html>
    )
}

export const metadata = {
    title: "Network Topology Visualizer",
    description: "Visualize and manage network topology configurations",
}

