import { useSession } from "next-auth/react"
import { useEffect } from "react"

export const useForceUpdateSession = () => {
    const { update } = useSession()

    useEffect(() => {
        const updateSession = async () => {
            await update()
            console.log("Session forcefully updated")
        }
        updateSession()
    }, [update])
}

