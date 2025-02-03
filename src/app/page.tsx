import { Suspense } from "react"
import NetworkTopologyAppWrapper from "@/components/network-topology/NetworkTopologyAppWrapper"
import { Toaster } from "@/components/ui/toaster"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function Home() {
    const session = await getServerSession(authOptions)

    return (
        <main className="min-h-screen w-full bg-gray-50">
            {session ? (
                <Suspense fallback={<div>Loading...</div>}>
                    <NetworkTopologyAppWrapper />
                </Suspense>
            ) : (
                <div className="flex items-center justify-center h-screen">
                    <Link href="/auth/signin">
                        <Button>Sign In</Button>
                    </Link>
                </div>
            )}
            <Toaster />
        </main>
    )
}

