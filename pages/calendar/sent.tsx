import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useContext, useState } from 'react'
import { useCookies } from 'react-cookie'
import { toast } from 'react-toastify'
import { getEvents, getUserInfo } from '../../lib/Helpers/db_helpers'
import { EventListProps, redirectObj, request } from '../../lib/Helpers/frontend_helpers'
import { SocketContext } from '../../lib/Helpers/socket_helpers'
import Search from '../../lib/Components/UI/Search'
import EventComponent from '../../lib/Components/custom/EventComponent'
import CalendarCreationModal from '../../lib/Components/custom/CalendarCreationModal'
import styles from '../../styles/Event.module.css'

let offset = 0

export default function Sent({ userInfo, allEvents, totalEvents }: EventListProps) {
    const router = useRouter()
    const [cookies] = useCookies(['auth_token'])
    const [editModal, setEditModal] = useState(false)
    const [evt, setEvt] = useState<any>(null)
    const socket = useContext(SocketContext)

    if (!socket.connected) {
        socket.connect()
        socket.emit('newLogin', cookies.auth_token)
    }

    const edit = async (evtID: string) => {
        try {
            let res = await request('events/' + evtID)
            res = res.data

            setEditModal(true)
            setEvt(res)
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
                <Search />
                {
                    totalEvents ?
                    <div id={ styles['events-list'] }>
                        {
                            allEvents.map((evt, id) => (
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