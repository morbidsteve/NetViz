import "next-auth"
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            userId: string  // Added for redundancy
            email: string
            name: string
            role: string
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        email: string
        name: string
        role: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        userId: string  // Added explicit userId field
        role: string
    }
}