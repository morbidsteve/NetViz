"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"

const SessionInfo = () => {
    const { data: session, status, update } = useSession()

    useEffect(() => {
        const updateSession = async () => {
            await update()
            console.log("Session updated:", session)
        }
        updateSession()
    }, [update, session])

    return (
        <div className="p-4 bg-gray-100 rounded-lg mt-4">
            <h2 className="text-lg font-bold mb-2">Session Information</h2>
            <p>Status: {status}</p>
            <pre className="bg-white p-2 rounded mt-2 overflow-auto max-h-40">{JSON.stringify(session, null, 2)}</pre>
            <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => update()}>
                Force Update Session
            </button>
        </div>
    )
}

export default SessionInfo

