import { GetServerSideProps } from 'next'
import { useContext, useState } from 'react'
import { toast } from 'react-toastify'
import { getEvents, getUserInfo } from '../../lib/Helpers/db_helpers'
import { SocketContext } from '../../lib/Helpers/socket_helpers'
import { EventListProps, redirectObj, request } from '../../lib/Helpers/frontend_helpers'
import Search from '../../lib/Components/Search'
import EventComponent from '../../lib/Components/EventComponent'
import CalendarCreationModal from '../../lib/Components/CalendarCreationModal'
import styles from '../../styles/Event.module.css'

let offset = 0

export default function Sent({ userInfo, allEvents, totalEvents }: EventListProps) {
    const [editModal, setEditModal] = useState(false)
    const [evt, setEvt] = useState<any>(null)
    const socket = useContext(SocketContext)

    const edit = async (evtID: string) => {
        try {
            let res = await request('events/' + evtID)
            res = res.data.data

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
                res = res.data

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
