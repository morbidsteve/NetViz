import { SessionProvider } from "next-auth/react"
import type { AppProps } from "next/app"

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
    return (
        <SessionProvider session={session} refetchInterval={0} refetchOnWindowFocus={false}>
            <Component {...pageProps} />
        </SessionProvider>
    )
}

export default MyApp

