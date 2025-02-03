import type { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import { verifyPassword } from "@/lib/auth"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    console.log("Missing credentials")
                    return null
                }
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                })
                if (!user) {
                    console.log("User not found")
                    return null
                }
                const isPasswordValid = verifyPassword(user.password, credentials.password)
                if (!isPasswordValid) {
                    console.log("Invalid password")
                    return null
                }
                console.log("User authenticated:", { id: user.id, email: user.email, name: user.name, role: user.role })
                return user
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as string
            }
            return session
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
    session: {
        strategy: "jwt",
    },
    debug: process.env.NODE_ENV === "development",
}

