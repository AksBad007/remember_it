import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { CookiesProvider, useCookies } from 'react-cookie'
import { ToastContainer } from 'react-toastify'
import { socket, SocketContext } from '../lib/Helpers/socket_helpers'
import NavBar from '../lib/Components/custom/NavBar'
import 'react-toastify/dist/ReactToastify.css'
import 'bootstrap/dist/css/bootstrap.css'
import '../styles/slimselect.min.css'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const currentPath = router.pathname
  const [cookies, setCookie] = useCookies(['auth_token'])
  const mainPages = ['/', '/auth']
  const mainPage = mainPages.findIndex(page => currentPath === page)

  useEffect(() => {
    let auth_token = localStorage.getItem('auth_token')

    if (auth_token)
      setCookie('auth_token', auth_token, { path: '/' })

      // Disconnect on unmount
      if (socket.connected) return () => {
        console.log('about to disconnect.')
        socket.emit('beforeDisconnect', cookies.auth_token)
        socket.disconnect()
      }
  }, [cookies.auth_token, setCookie])

  return (
    <CookiesProvider>
      <SocketContext.Provider value={ socket }>
        <Head>
          <title>Remember It - A Calendar App</title>
          <meta name='description' content='Remember It - A Calendar App' />
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <link rel='icon' href='/favicon.ico' />
        </Head>

        <NavBar showSide={ mainPage === -1 } />

        <main>
          <Component {...pageProps} />
        </main>

        <ToastContainer
          position='top-right'
          hideProgressBar
          newestOnTop
          pauseOnFocusLoss
          theme='colored'
        />
      </SocketContext.Provider>
    </CookiesProvider>
  )
}
