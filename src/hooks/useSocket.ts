import { useEffect, useRef, useCallback } from "react"
import { io, type Socket } from "socket.io-client"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"

export const useSocket = (configId: string) => {
    const { data: session } = useSession()
    const socketRef = useRef<Socket | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        if (!configId || !session) {
            console.log("Socket not initialized: missing configId or session")
            return
        }

        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || `http://localhost:3001`
        console.log("Attempting to connect to socket server at:", socketUrl)

        const socket = io(socketUrl, {
            reconnectionDelay: 1000,
            reconnection: true,
            reconnectionAttempts: 10,
            transports: ["websocket", "polling"],
            forceNew: true,
        })

        socket.on("connect", () => {
            console.log("Socket connected successfully", socket.id)
            console.log("Current transport:", socket.io.engine.transport.name)
            socket.emit("join-room", configId)
            socket.emit("user-presence", {
                configId,
                user: session.user,
                action: "joined",
            })
            toast({
                title: "Connected to server",
                description: "Real-time collaboration is now active.",
                duration: 3000,
            })
        })

        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error)
            toast({
                title: "Connection error",
                description: "Failed to connect to the server. Retrying...",
                variant: "destructive",
                duration: 3000,
            })
        })

        socket.on("error", (error) => {
            console.error("Socket error:", error)
            toast({
                title: "Socket error",
                description: "An error occurred with the socket connection.",
                variant: "destructive",
                duration: 3000,
            })
        })

        socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason)
            toast({
                title: "Disconnected",
                description: "Lost connection to the server. Attempting to reconnect...",
                variant: "destructive",
                duration: 3000,
            })
        })

        socket.on("reconnect", (attemptNumber) => {
            console.log("Socket reconnected after", attemptNumber, "attempts")
            toast({
                title: "Reconnected",
                description: "Successfully reconnected to the server.",
                duration: 3000,
            })
        })

        socketRef.current = socket

        return () => {
            if (socket) {
                console.log("Cleaning up socket connection")
                socket.emit("user-presence", {
                    configId,
                    user: session.user,
                    action: "left",
                })
                socket.disconnect()
            }
        }
    }, [configId, session, toast])

    const emitNodeUpdate = useCallback(
        (nodeData: any) => {
            if (socketRef.current) {
                console.log("Emitting node update:", nodeData)
                socketRef.current.emit("node-update", {
                    configId,
                    ...nodeData,
                })
            } else {
                console.warn("Attempted to emit node update, but socket is not connected")
            }
        },
        [configId],
    )

    const emitNodePositionUpdate = useCallback(
        (nodeData: any) => {
            if (socketRef.current) {
                console.log("Emitting node position update:", nodeData)
                socketRef.current.emit("node-position-update", {
                    configId,
                    ...nodeData,
                })
            } else {
                console.warn("Attempted to emit node position update, but socket is not connected")
            }
        },
        [configId],
    )

    return {
        socket: socketRef.current,
        emitNodeUpdate,
        emitNodePositionUpdate,
    }
}

