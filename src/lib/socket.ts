import type { Server as NetServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import type { NextApiResponse } from "next"
import type { Socket } from "socket.io"

export type NextApiResponseServerIO = NextApiResponse & {
    socket: Socket & {
        server: NetServer & {
            io: SocketIOServer
        }
    }
}

export const initSocket = (res: NextApiResponseServerIO) => {
    if (!res.socket.server.io) {
        const io = new SocketIOServer(res.socket.server)
        res.socket.server.io = io

        io.on("connection", (socket) => {
            console.log("New client connected", socket.id)

            socket.on("join-room", (configId: string) => {
                socket.join(configId)
                console.log(`Client ${socket.id} joined room ${configId}`)
            })

            socket.on("node-update", (data) => {
                socket.to(data.configId).emit("node-updated", data)
            })

            socket.on("node-position-update", (data) => {
                socket.to(data.configId).emit("node-position-updated", data)
            })

            socket.on("user-presence", (data) => {
                socket.to(data.configId).emit("user-presence-update", {
                    userId: socket.id,
                    ...data,
                })
            })

            socket.on("disconnect", () => {
                console.log("Client disconnected", socket.id)
            })
        })
    }
    return res.socket.server.io
}

