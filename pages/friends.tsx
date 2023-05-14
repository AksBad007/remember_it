import type { GetServerSideProps } from 'next'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { getFriends } from '../lib/Helpers/db_helpers'
import { decodeAuth } from '../lib/Helpers/backend_helpers'
import { post_or_put_data, redirectObj, request } from '../lib/Helpers/frontend_helpers'
import Search from '../lib/Components/UI/Search'
import Modal from '../lib/Components/UI/Modal'
import FriendComponent from '../lib/Components/custom/FriendComponent'
import userImg from '../public/images/user-image.png'
import styles from '../styles/Friends.module.css'

let addedOffset = 0
let requestsOffest = 0

interface RequestsModalProps {
    reset: () => void
}

const RequestsModal = ({ reset }: RequestsModalProps) => {
    const [show, setShow] = useState(false)
    const [requestList, setRequestList] = useState<any[]>([])

    const getRequests = useCallback(async () => {
        try {
            const { data } = await request('users/friends/requests/' + requestsOffest)
            setRequestList(data.friendList)
            requestsOffest += 20
        } catch (error: any) {
            toast.error(error.message)
        }
    }, [])

    const accept = async (userID: string) => {
        try {
            const { msg } = await post_or_put_data('users/friends/accept/' + userID, null, false)
            toast.info(msg)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const reject = async (userID: string) => {
        try {
            const { msg } = await request('users/reject/' + userID, { method: 'DELETE' })
            toast.info(msg)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const hideModal = () => {
        setShow(false)
        setTimeout(() => reset(), 500)
    }

    const body =
        <div id={ styles['friends-list'] }>
            {
                requestList.length > 0 ?
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
                )) :
                <div className={ styles['no-frnds-inside'] }>No Friend Request.</div>
            }
        </div>

    useEffect(() => {
        setShow(true)
        getRequests()

        return () => { requestsOffest = 0 }
    }, [getRequests])

    return <Modal bg={ show } closeOption closeModal={ hideModal } title='Friend Requests' body={ body } />
}

export default function Friends({ friendList }: { friendList: any[] }) {
    const [frndsOnly, setFrndsOnly] = useState(false)
    const [requestsModal, showRequestsModal] = useState(false)
    const [frndList, setFrndList] = useState(friendList)

    const searchUser = async (userQuery: string) => {
        const query = new URLSearchParams({ userQuery })
        try {
            let { data } = await request(frndsOnly ? 'users/friends/search?' + query : 'users/search?' + query)
            setFrndList(data.result)
        } catch (error: any) {
            console.error(error)

            toast.error(error.message)
        }
    }

    const resetList = async () => {
        addedOffset = 0
        try {
            const { data } = await request('users/friends/' + addedOffset)
            setFrndList(data.friendList)
        } catch (error: any) {
            console.error(error)

            toast.error(error.message)
        }
    }

    const remove = async (userID: string) => {
        try {
            let { msg } = await request('users/friends/remove/' + userID, { method: 'DELETE' })
            toast.info(msg)
        } catch (error: any) {
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

    return (
        <>
            {
                requestsModal &&
                <RequestsModal reset={() => showRequestsModal(false)} />
            }
            <div className='d-flex flex-column mt-2 align-items-center'>
                <Search onSearch={searchUser} onClear={resetList} />

                <button className='btn btn-primary mb-4' onClick={() => showRequestsModal(true)}>
                    Friend Requests
                </button>

                {
                    frndList.length > 0 ?
                    <div id={ styles['friends-list'] }>
                        {
                            frndList.map(({ _id, username }: any, idx) => (
                                <FriendComponent
                                    key={ idx }
                                    user={{ username, userImg }}
                                    condition={ frndsOnly }
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
            </div>
        </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        const userID = await decodeAuth(context.req.cookies.auth_token as string)
        const friendList = await getFriends(addedOffset, userID)

        return {
            props: {
                friendList: JSON.parse(JSON.stringify(friendList))
            }
        }
    } catch (error) {
        console.error(error)

        return redirectObj
    }
}
