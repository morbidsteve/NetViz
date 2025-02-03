import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

interface RouteParams {
    params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteParams) {
    try {
        const params = await context.params
        const { id } = params

        const config = await prisma.networkConfiguration.findUnique({
            where: { id },
            include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
        })

        if (!config) {
            return NextResponse.json({ error: "Network configuration not found" }, { status: 404 })
        }

        return NextResponse.json(config)
    } catch (error) {
        console.error("Error fetching network configuration:", error)
        return NextResponse.json({ error: "Failed to fetch network configuration" }, { status: 500 })
    }
}

export async function PUT(request: NextRequest, context: RouteParams) {
    try {
        const params = await context.params
        const { id } = params
        const { name, data } = await request.json()

        if (!name || !data) {
            return NextResponse.json({ error: "Name and data are required" }, { status: 400 })
        }

        const existingConfig = await prisma.networkConfiguration.findUnique({
            where: { id },
            include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
        })

        if (!existingConfig) {
            return NextResponse.json({ error: "Network configuration not found" }, { status: 404 })
        }

        const updatedConfig = await prisma.networkConfiguration.update({
            where: { id },
            data: {
                name,
                data,
                versions: {
                    create: {
                        versionNumber: existingConfig.versions[0].versionNumber + 1,
                        data,
                    },
                },
            },
            include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
        })

        return NextResponse.json(updatedConfig)
    } catch (error) {
        console.error("Error updating network configuration:", error)
        return NextResponse.json({ error: "Failed to update network configuration" }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
    try {
        const params = await context.params
        const { id } = params

        const config = await prisma.networkConfiguration.findUnique({
            where: { id },
        })

        if (!config) {
            return NextResponse.json({ error: "Network configuration not found" }, { status: 404 })
        }

        await prisma.networkConfigurationVersion.deleteMany({
            where: { configurationId: id },
        })

        await prisma.networkConfiguration.delete({
            where: { id },
        })

        return NextResponse.json({ message: "Network configuration deleted successfully" })
    } catch (error) {
        console.error("Error deleting network configuration:", error)
        return NextResponse.json({ error: "Failed to delete network configuration" }, { status: 500 })
    }
}

