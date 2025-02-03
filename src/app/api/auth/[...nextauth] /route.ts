import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth-options"

export default NextAuth({
    ...authOptions,
    callbacks: {
        ...authOptions.callbacks,
        session: ({ session, token }) => {
            if (session.user) {
                session.user.id = token.sub
                session.user.role = token.role as string
            }
            return session
        },
    },
})

