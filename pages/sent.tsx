import { GetServerSideProps } from 'next'
import { useCallback, useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import Loader from '../lib/Components/UI/Loader'
import Search from '../lib/Components/UI/Search'
import EventComponent from '../lib/Components/custom/EventComponent'
import CalendarCreationModal from '../lib/Components/custom/CalendarCreationModal'
import { getEvents, getUserInfo } from '../lib/Helpers/db_helpers'
import { EventListProps, redirectObj, request } from '../lib/Helpers/frontend_helpers'
import { SocketContext } from '../lib/Helpers/socket_helpers'
import styles from '../styles/Event.module.css'

let offset = 0

export default function Sent({ userInfo, allEvents, totalEvents }: EventListProps) {
    const socket = useContext(SocketContext)
    const [editModal, setEditModal] = useState(false)
    const [evt, setEvt] = useState<any>(null)
    const [eventList, setEventList] = useState(allEvents)
    const [loading, setLoading] = useState(false)

    const searchEvent = async (eventQuery: string) => {
        const query = new URLSearchParams({ eventQuery })

        try {
            const { data } = await request('events/created/search?' + query)
            setEventList(data.result)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const resetList = async () => {
        offset = 0
        const query = new URLSearchParams({ offset: String(offset) })

        try {
            const { data } = await request('events/created?' + query)
            setEventList(data.allEvents)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const edit = async (evtID: string) => {
        try {
            const { data } = await request('events/' + evtID)

            setEditModal(true)
            setEvt(data)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const cancelEdit = () => {
        setEditModal(false)
        setEvt(null)
    }

    const cancel = async (evtID: string) => {
        if (window.confirm('Do you really want to delete this Event?'))
            try {
                let res = await request('events/created/' + evtID, { method: 'DELETE' })

                toast.success(res.msg)
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
                const { data } = await request('events/created?' + query)
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
        <>
            {
                editModal &&
                <CalendarCreationModal
                    userInfo={ userInfo }
                    evtDates={{ start: new Date(evt.start_date), end: new Date(evt.end_date) }}
                    evt={ evt }
                    reset={ cancelEdit }
                />
            }

            <div className='d-flex flex-column mt-2 align-items-center'>
                <Search onSearch={searchEvent} onClear={resetList}/>

                {
                    eventList.length > 0 ?
                    <div id={ styles['events-list'] }>
                        {
                            eventList.map((evt, id) => (
                                <EventComponent
                                    key={ id }
                                    evt={ evt }
                                    action={ { prompt: 'Edit', fn: () => edit(evt._id) } }
                                    cancel={ { prompt: 'Cancel', fn: () => cancel(evt._id) } }
                                />
                            ))
                        }
                    </div> :
                    'No Events Sent.'
                }

                { loading && <Loader fullscreen={ false } /> }
            </div>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        const user = await getUserInfo(context.req)
        const { allEvents, totalEvents } = await getEvents(offset, user._id, true)

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
