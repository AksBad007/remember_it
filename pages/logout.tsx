import { useRouter } from 'next/router'
import { useContext, useEffect } from 'react'
import { useCookies } from 'react-cookie'
import Loader from '../lib/Components/UI/Loader'
import { SocketContext } from '../lib/Helpers/socket_helpers'

export default function Logout() {
    const [cookies, _setCookie, removeCookie] = useCookies(['auth_token'])
    const router = useRouter()
    const socket = useContext(SocketContext)

    useEffect(() => {
        socket.emit('beforeDisconnect', cookies.auth_token)
        removeCookie('auth_token')
        localStorage.clear()
        router.replace('/')
    })

    return <Loader />
}
