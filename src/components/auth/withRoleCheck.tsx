"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import type { ComponentType } from "react"

export function withRoleCheck(WrappedComponent: ComponentType, allowedRoles: string[]) {
    return function WithRoleCheck(props: any) {
        const { data: session, status } = useSession()
        const router = useRouter()

        useEffect(() => {
            if (status === "loading") return // Do nothing while loading
            if (!session) {
                // Redirect to login page if there's no session
                router.push("/auth/signin")
            } else if (!allowedRoles.includes(session.user.role)) {
                // Redirect to unauthorized page if user doesn't have the required role
                router.push("/unauthorized")
            }
        }, [session, status, router, allowedRoles]) // Added allowedRoles to dependencies

        if (status === "loading") {
            return <div>Loading...</div> // Or your custom loading component
        }

        if (!session || !allowedRoles.includes(session.user.role)) {
            return null // Or you could render a restricted access message
        }

        return <WrappedComponent {...props} />
    }
}

