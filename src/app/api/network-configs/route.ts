import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
    console.log("GET /api/network-configs called")

    try {
        console.log("Fetching configurations")
        const configs = await prisma.networkConfiguration.findMany({
            include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
        })

        console.log("Configs fetched successfully:", configs.length)
        return NextResponse.json({ configs })
    } catch (error) {
        console.error("Error fetching network configurations:", error)
        return NextResponse.json({ error: "Failed to fetch network configurations" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    console.log("POST /api/network-configs called")

    try {
        const { name, data } = await request.json()
        console.log("Received data:", { name, dataLength: data.length })

        // Create a dummy user if it doesn't exist
        let dummyUser = await prisma.user.findUnique({
            where: { email: "dummy@example.com" },
        })

        if (!dummyUser) {
            dummyUser = await prisma.user.create({
                data: {
                    email: "dummy@example.com",
                    name: "Dummy User",
                    password: "dummy_password", // Note: In a real application, never store passwords in plain text
                },
            })
        }

        const newConfig = await prisma.networkConfiguration.create({
            data: {
                name,
                data,
                userId: dummyUser.id,
                versions: {
                    create: {
                        versionNumber: 1,
                        data,
                    },
                },
            },
            include: { versions: true },
        })

        console.log("New config created:", newConfig.id)
        return NextResponse.json({ config: newConfig })
    } catch (error) {
        console.error("Error creating network configuration:", error)
        return NextResponse.json({ error: "Failed to create network configuration" }, { status: 500 })
    }
}

