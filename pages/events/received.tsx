import { GetServerSideProps } from 'next'
import { useContext } from 'react'
import { toast } from 'react-toastify'
import { decodeAuth } from '../../lib/Helpers/backend_helpers'
import { getEvents } from '../../lib/Helpers/db_helpers'
import { SocketContext } from '../../lib/Helpers/socket_helpers'
import { EventListProps, post_or_put_data, redirectObj } from '../../lib/Helpers/frontend_helpers'
import Search from '../../lib/Components/Search'
import EventComponent from '../../lib/Components/EventComponent'
import styles from '../../styles/Event.module.css'

let offset = 0

export default function Received({ allEvents, totalEvents }: EventListProps) {
    const socket = useContext(SocketContext)

    const accept = async (evtID: string) => {
        try {
            let res = await post_or_put_data('/events/received/accept/' + evtID, null, false)
            res = res.data

            toast.success(res.msg)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const reject = async (evtID: string) => {
        try {
            let res = await post_or_put_data('/events/received/reject/' + evtID, null, false)
            res = res.data

            toast.success(res.msg)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    return (
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
