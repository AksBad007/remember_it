import { GetServerSideProps } from "next"
import { decodeAuth } from "../../lib/Helpers/backend_helpers"
import Events from '../../lib/Models/Event.model'
import Search from "../../lib/Components/Search"

let offset = 0
const limit = global.limit

export default function received({ eventList }: any) {
    console.log(eventList)

    return (
        <div>
            <Search />
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        const userID = await decodeAuth(context.req.cookies.auth_token as string)
        let receivedEvents = await Events.find({ 'invited_users.userID': userID }).skip(offset).limit(limit).sort({ start_date: 'asc' })

        return {
            props: {
                eventList: JSON.parse(JSON.stringify(receivedEvents))
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
