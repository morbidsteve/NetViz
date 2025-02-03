"use client"

import { withRoleCheck } from "@/components/auth/withRoleCheck"
import NetworkTopologyApp from "./NetworkTopologyApp"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const ProtectedNetworkTopologyApp = withRoleCheck(NetworkTopologyApp, ["admin", "user"])

export default function NetworkTopologyAppWrapper() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    return null
  }

  return <ProtectedNetworkTopologyApp />
}

