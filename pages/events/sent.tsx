import { GetServerSideProps } from "next"
import { decodeAuth } from "../../lib/Helpers/backend_helpers"
import Events from '../../lib/Models/Event.model'
import Search from "../../lib/Components/Search"
import EventComponent from "../../lib/Components/EventComponent"
import styles from '../../styles/Event.module.css'

let offset = 0
const limit = global.limit

interface EventListProps {
    allEvents: any[]
}

export default function sent({ allEvents }: EventListProps) {
    console.log(allEvents)

    const edit = async() => {}

    const cancel = async() => {}

    return (
        <div className='d-flex flex-column mt-2 align-items-center'>
            <Search />
            {
                allEvents.length > 0 ?
                <div id={ styles['events-list'] }>
                    {
                        allEvents.map(({title, start_date, location, invited_users}, id) => (
                            <EventComponent
                                key={ id }
                                title={ title }
                                start_date={ start_date }
                                location={ location }
                                invited_users={ invited_users }
                                action={ { prompt: 'Edit', fn: edit } }
                                cancel={ { prompt: 'Cancel', fn: cancel } }
                            />
                        ))
                    }
                </div> :
                'No Events Sent'
            }
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        const userID = await decodeAuth(context.req.cookies.auth_token as string)
        let createdEvents = await Events
        .find({ 'created_by.userID': userID })
        .skip(offset)
        .limit(limit)
        .sort({ start_date: 'asc' })
        .populate('created_by.userID invited_users.userID', 'email username')

        return {
            props: {
                allEvents: JSON.parse(JSON.stringify(createdEvents))
            }
        }
    } catch (error) {
        console.error(error)

        return {
            redirect: {
                permanent: false,
                destination: '/logout'
            }
        }
    }
}
