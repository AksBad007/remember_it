import { GetServerSideProps } from 'next'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { decodeAuth } from '../../lib/Helpers/backend_helpers'
import { getEvents } from '../../lib/Helpers/db_helpers'
import { EventListProps, post_or_put_data, redirectObj, request } from '../../lib/Helpers/frontend_helpers'
import Search from '../../lib/Components/UI/Search'
import EventComponent from '../../lib/Components/custom/EventComponent'
import styles from '../../styles/Event.module.css'

let offset = 0

export default function Received({ allEvents, totalEvents }: EventListProps) {
    const [eventList, setEventList] = useState(allEvents)

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
            setEventList(data.data)
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

    return (
        <div className='d-flex flex-column mt-2 align-items-center'>
            <Search onSearch={searchEvent} onClear={resetList} />
            {
                eventList.length > 0 ?
                <div id={ styles['events-list'] }>
                    {
                        allEvents.map((evt, id) => (
                            <EventComponent
                                key={ id }
                                evt={ evt }
                                action={ { prompt: 'Accept', fn: () => accept(evt._id) } }
                                cancel={ { prompt: 'Reject', fn: () => reject(evt._id) } }
                            />
                        ))
                    }
                </div> :
                'No Invites Received.'
            }
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        const userID = await decodeAuth(context.req.cookies.auth_token as string)
        const { allEvents, totalEvents } = await getEvents(offset, userID)

        return {
            props: {
                allEvents: JSON.parse(JSON.stringify(allEvents)),
                totalEvents: totalEvents
            }
        }
    } catch (error) {
        console.error(error)

        return redirectObj
    }
}
