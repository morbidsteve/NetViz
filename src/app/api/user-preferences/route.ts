import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
    const userId = request.headers.get("X-User-Id")
    if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    try {
        const preferences = await prisma.userPreference.findUnique({
            where: { userId },
        })

        if (!preferences) {
            return NextResponse.json({ error: "User preferences not found" }, { status: 404 })
        }

        return NextResponse.json(preferences)
    } catch (error) {
        console.error("Error fetching user preferences:", error)
        return NextResponse.json({ error: "Failed to fetch user preferences" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const userId = request.headers.get("X-User-Id")
    if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    try {
        const { theme, language } = await request.json()
        const preferences = await prisma.userPreference.upsert({
            where: { userId },
            update: { theme, language },
            create: { userId, theme, language },
        })

        return NextResponse.json(preferences)
    } catch (error) {
        console.error("Error updating user preferences:", error)
        return NextResponse.json({ error: "Failed to update user preferences" }, { status: 500 })
    }
}

