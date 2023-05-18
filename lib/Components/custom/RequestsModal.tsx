import { useState, useEffect, useCallback, useContext } from 'react'
import { toast } from 'react-toastify'
import Modal from '../UI/Modal'
import Loader from '../UI/Loader'
import FriendComponent from './FriendComponent'
import { request, post_or_put_data } from '../../Helpers/frontend_helpers'
import { SocketContext } from '../../Helpers/socket_helpers'
import userImg from '../../../public/images/user-image.png'
import styles from '../../../styles/Friends.module.css'

let requestsOffest = 0

export function RequestsModal({ reset }: { reset: () => Promise<void> }) {
    const socket = useContext(SocketContext)
    const [show, setShow] = useState(false)
    const [loading, setLoading] = useState(false)
    const [requestList, setRequestList] = useState<any[]>([])

    const getRequests = useCallback(async () => {
        setLoading(true)

        try {
            const { data } = await request('users/friends/requests/' + requestsOffest)
            setRequestList(data.friendList)

            requestsOffest += 20
            setLoading(false)
        } catch (error: any) {
            setLoading(false)

            toast.error(error.message)
        }
    }, [])

    const shrinkList = (userID: string) => setRequestList((prev) => prev.filter(({ _id }) => _id !== userID))

    const accept = async (userID: string) => {
        setLoading(true)

        try {
            const { msg } = await post_or_put_data('users/friends/accept/' + userID, null, false)
            
            shrinkList(userID)
            setLoading(false)
            toast.info(msg)
        } catch (error: any) {
            setLoading(false)
            toast.error(error.message)
        }
    }

    const reject = async (userID: string) => {
        setLoading(true)

        try {
            const { msg } = await request('users/reject/' + userID, { method: 'DELETE' })
            
            shrinkList(userID)
            setLoading(false)
            toast.info(msg)
        } catch (error: any) {
            setLoading(false)
            toast.error(error.message)
        }
    }

    const hideModal = () => {
        setShow(false)
        setTimeout(async () => await reset(), 500)
    }

    useEffect(() => {
        setShow(true)
        getRequests()

        window.addEventListener('scroll', getRequests)

        const expandList = (user: any) => setRequestList((prev) => [...prev, user])

        // Socket Events
        socket.on('newRequest', expandList)

        // Unbind Listeners on Modal Close
        return () => {
            requestsOffest = 0
            window.removeEventListener('scroll', getRequests)
            socket.off('newRequest', expandList)
        }
    }, [getRequests, socket])

    return (
        <Modal bg={ show } closeOption closeModal={ hideModal } title='Friend Requests'>
            <>
                {
                    requestList.length > 0 ?
                    <div id={ styles['friends-list'] }>
                        {
                            requestList.map(({ _id, username }: any, idx) => (
                                <FriendComponent
                                    key={ idx }
                                    user={{ username, userImg }}
                                    request
                                    onTrue={{
                                        fn: () => accept(_id),
                                        prompt: 'Accept'
                                    }}
                                    onFalse={{
                                        fn: () => reject(_id),
                                        prompt: 'Reject'
                                    }}
                                />
                            ))
                        }
                    </div> :
                    <div className={ styles['no-frnds-inside'] }>No Friend Request.</div>
                }

                { loading && <Loader fullscreen={ false }/> }
            </>
        </Modal>
    )
}
