import type { GetServerSideProps } from 'next'
import { useCallback, useEffect, useState, useContext } from 'react'
import { toast } from 'react-toastify'
import { getFriends } from '../lib/Helpers/db_helpers'
import { decodeAuth } from '../lib/Helpers/backend_helpers'
import { SocketContext } from '../lib/Helpers/socket_helpers'
import { post_or_put_data, redirectObj, request } from '../lib/Helpers/frontend_helpers'
import Search from '../lib/Components/UI/Search'
import Loader from '../lib/Components/UI/Loader'
import { RequestsModal } from '../lib/Components/custom/RequestsModal'
import FriendComponent from '../lib/Components/custom/FriendComponent'
import userImg from '../public/images/user-image.png'
import styles from '../styles/Friends.module.css'

let offset = 0

interface FriendsProps {
    friendList: any[]
    totalFriends: number
}

export default function Friends({ friendList, totalFriends }: FriendsProps) {
    const socket = useContext(SocketContext)
    const [frndsOnly, setFrndsOnly] = useState(false)
    const [requestsModal, showRequestsModal] = useState(false)
    const [frndList, setFrndList] = useState(friendList)
    const [loading, setLoading] = useState(false)

    const searchUser = async (userQuery: string) => {
        setLoading(true)
        const query = new URLSearchParams({ userQuery })

        try {
            let { data } = await request(frndsOnly ? 'users/friends/search?' + query : 'users/search?' + query)
            setFrndList(data.result)
            setLoading(false)
        } catch (error: any) {
            setLoading(false)
            console.error(error)

            toast.error(error.message)
        }
    }

    const resetList = async () => {
        setLoading(true)
        offset = 0

        try {
            const { data } = await request('users/friends/' + offset)
            setFrndList(data.friendList)
            setLoading(false)
        } catch (error: any) {
            setLoading(false)
            console.error(error)

            toast.error(error.message)
        }
    }

    const remove = async (userID: string) => {
        setLoading(true)

        try {
            let { msg } = await request('users/friends/remove/' + userID, { method: 'DELETE' })
            toast.info(msg)

            setFrndList((prev) => prev.filter(({ _id }) => _id !== userID))
            setLoading(false)
        } catch (error: any) {
            setLoading(false)
            toast.error(error.message)
        }
    }

    const sendRequest = async (userID: string) => {
        try {
            let { msg } = await post_or_put_data('users/add/' + userID)
            toast.info(msg)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const getMoreFriends = useCallback(async () => {
        if (totalFriends === friendList.length)
            return

        const { scrollHeight, scrollTop } = document.documentElement
        if (window.innerHeight + scrollTop + 1 >= scrollHeight) {
            offset += 20
            const query = new URLSearchParams({ offset: String(offset) })
            setLoading(true)

            try {
                const { data } = await request('users/friends?' + query)
                setFrndList((prev) => [...prev, ...data.friendList])
                setLoading(false)
            } catch (error: any) {
                setLoading(false)
                offset -= 20
                toast.error(error.message)
            }
        }
    }, [friendList.length, totalFriends])

    useEffect(() => {
        window.addEventListener('scroll',getMoreFriends)

        const expandList = (user: any) => {
            user = JSON.parse(JSON.stringify(user))
            user.isFrnd = true
            setFrndList((prev) => [...prev, user])
        }

        socket.on('requestAccepted', expandList)

        // Unbind Listeners on page change
        return () => {
            window.removeEventListener('scroll', getMoreFriends)

            socket.off('requestAccepted', expandList)
        }
    }, [getMoreFriends, socket])

    return (
        <>
            {
                requestsModal &&
                <RequestsModal
                    reset={async () => {
                        showRequestsModal(false)
                        await resetList()
                    }}
                />
            }

            <div className='d-flex flex-column mt-2 align-items-center'>
                <Search onSearch={searchUser} onClear={resetList} />

                <label htmlFor='frndsOnly' className='cursor-pointer mb-4'>
                    <input
                        id='frndsOnly'
                        className='m-2'
                        type='checkbox'
                        checked={ frndsOnly }
                        onChange={e => setFrndsOnly(e.currentTarget.checked)}
                    />
                    Search Friends Only
                </label>

                <button className='btn btn-primary mb-4' onClick={() => showRequestsModal(true)}>
                    Friend Requests
                </button>

                {
                    frndList.length > 0 ?
                    <div id={ styles['friends-list'] }>
                        {
                            frndList.map(({ _id, username, isFrnd }: any, idx) => (
                                <FriendComponent
                                    key={ idx }
                                    user={{ username, userImg }}
                                    condition={ isFrnd }
                                    onTrue={{
                                        fn: () => remove(_id),
                                        prompt: 'Remove Friend'
                                    }}
                                    onFalse={{
                                        fn: () => sendRequest(_id),
                                        prompt: 'Add Friend'
                                    }}
                                />
                            ))
                        }
                    </div> :
                    <div className={ styles['no-frnds'] }>No Friend Added Yet.</div>
                }

                { loading && <Loader fullscreen={ false } /> }
            </div>
        </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        const userID = await decodeAuth(context.req.cookies.auth_token as string)
        const { friendList, totalFriends } = await getFriends(offset, userID)

        return {
            props: {
                friendList: JSON.parse(JSON.stringify(friendList)),
                totalFriends
            }
        }
    } catch (error) {
        console.error(error)

        return redirectObj
    }
}
