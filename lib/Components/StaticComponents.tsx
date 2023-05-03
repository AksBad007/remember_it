import { useRouter } from 'next/router'
import { useContext } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import { useCookies } from 'react-cookie'
import { SocketContext } from '../Helpers/socket_helpers'

export default function StaticComponents() {
    const router = useRouter()
    const [cookies] = useCookies(['auth_token'])
    const auth_token = cookies.auth_token
    const socket = useContext(SocketContext)
    const { BASE_URL } = process.env

    if (auth_token) {
        console.log(socket)

        // Socket Events
        socket.on('connect', () => console.log('init connection', socket.id))

        socket.on('sendUserID', () => socket.emit('newLogin', auth_token))

        socket.on('newEvt', (msg: string) => toast.info(msg, { onClick: () => router.push(BASE_URL + '/calendar/events/sent') }))

        socket.on('newRequest', (msg) => console.log('new Req =', msg))

        socket.on('requestAccepted', (msg: string) => toast.info(msg))

        socket.on('disconnect', () => console.log('Disconnected with ', socket.id))
    }

    return (
        <ToastContainer
            position='top-right'
            hideProgressBar
            newestOnTop
            pauseOnFocusLoss
            theme='colored'
        />
    )
}
