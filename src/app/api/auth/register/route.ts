import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"

export async function POST(request: Request) {
    try {
        console.log("Starting registration process")
        console.log("DATABASE_URL:", process.env.DATABASE_URL) // Be careful with this line!
        const { name, email, password } = await request.json()
        console.log("Received data:", { name, email, passwordLength: password.length })

        const hashedPassword = hashPassword(password)
        console.log("Password hashed")

        console.log("Checking for existing user")
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            console.log("User already exists")
            return NextResponse.json({ error: "Email already in use" }, { status: 400 })
        }

        console.log("Creating new user")
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "user", // Default role
            },
        })

        console.log("User created successfully")
        return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } })
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json({ error: "Failed to create user", details: error.message }, { status: 500 })
    }
}

