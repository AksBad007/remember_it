import { GetServerSideProps } from 'next'
import { useState, useEffect, useCallback, useContext } from 'react'
import { toast } from 'react-toastify'
import { getEvents, getUserInfo } from '../lib/Helpers/db_helpers'
import { SocketContext } from '../lib/Helpers/socket_helpers'
import { EventListProps, post_or_put_data, redirectObj, request } from '../lib/Helpers/frontend_helpers'
import Loader from '../lib/Components/UI/Loader'
import Search from '../lib/Components/UI/Search'
import EventComponent from '../lib/Components/custom/EventComponent'
import styles from '../styles/Event.module.css'

let offset = 0

export default function Received({ userInfo, allEvents, totalEvents }: EventListProps) {
    const socket = useContext(SocketContext)
    const [eventList, setEventList] = useState(allEvents)
    const [loading, setLoading] = useState(false)

    const searchEvent = async (eventQuery: string) => {
        const query = new URLSearchParams({ eventQuery })

        try {
            const { data } = await request('events/received/search?' + query)
            setEventList(data.result)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const resetList = async () => {
        offset = 0
        const query = new URLSearchParams({ offset: String(offset) })

        try {
            const { data } = await request('events/received?' + query)
            setEventList(data.allEvents)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const accept = async (evtID: string) => {
        try {
            let { msg } = await post_or_put_data('/events/received/accept/' + evtID, null, false)
            toast.success(msg)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const reject = async (evtID: string) => {
        try {
            let { msg } = await post_or_put_data('/events/received/reject/' + evtID, null, false)
            toast.success(msg)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const getMoreEvents = useCallback(async () => {
        if (totalEvents === allEvents.length)
            return

        const { scrollHeight, scrollTop } = document.documentElement
        if (window.innerHeight + scrollTop + 1 >= scrollHeight) {
            offset += 20
            const query = new URLSearchParams({ offset: String(offset) })
            setLoading(true)

            try {
                const { data } = await request('events/received?' + query)
                setEventList((prev) => [...prev, ...data.allEvents])
                setLoading(false)
            } catch (error: any) {
                setLoading(false)
                offset -= 20
                toast.error(error.message)
            }
        }
    }, [allEvents.length, totalEvents])

    const handleNewEvt = useCallback((evt: any) => setEventList((prev) => [...prev, evt]), [])

    const handleEvtUpdate = useCallback((evt: any) => setEventList((prev) => prev.map(prevEvt => prevEvt._id === evt._id ? evt : prevEvt)), [])

    const handleDelEvt = useCallback((evtID: string) => setEventList((prev) => prev.filter(evt => evt._id !== evtID)), [])

    useEffect(() => {
        window.addEventListener('scroll', getMoreEvents)

        // Socket Events
        socket.on('newEvt', handleNewEvt)
        socket.on('evtUpdate', handleEvtUpdate)
        socket.on('delEvt', handleDelEvt)

        // Unbind Listeners on page change
        return () => {
            window.removeEventListener('scroll', getMoreEvents)

            socket.off('newEvt', handleNewEvt)
            socket.off('evtUpdate', handleEvtUpdate)
            socket.off('delEvt', handleDelEvt)
        }
    }, [getMoreEvents, socket, handleDelEvt, handleEvtUpdate, handleNewEvt])

    return (
        <div className='d-flex flex-column mt-2 align-items-center'>
            <Search onSearch={searchEvent} onClear={resetList} />

            {
                eventList.length > 0 ?
                    <div id={styles['events-list']}>
                        {
                            eventList.map((evt, id) => (
                                <EventComponent
                                    key={id}
                                    evt={evt}
                                    action={{ prompt: 'Accept', fn: () => accept(evt._id) }}
                                    cancel={{ prompt: 'Reject', fn: () => reject(evt._id) }}
                                    received
                                    userInfo={ userInfo }
                                />
                            ))
                        }
                    </div> :
                    'No Invites Received.'
            }

            { loading && <Loader fullscreen={ false } />}
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        const user = await getUserInfo(context.req)
        const { allEvents, totalEvents } = await getEvents(offset, user._id)

        console.log('user yo =', user)

        return {
            props: {
                userInfo: JSON.parse(JSON.stringify(user)),
                allEvents: JSON.parse(JSON.stringify(allEvents)),
                totalEvents: totalEvents
            }
        }
    } catch (error) {
        console.error(error)

        return redirectObj
    }
}
