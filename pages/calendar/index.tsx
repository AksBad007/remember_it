import { GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import Loader from '../../lib/Components/UI/Loader'
import { getUserInfo } from '../../lib/Helpers/db_helpers'
import { useContext } from 'react'
import { SocketContext } from '../../lib/Helpers/socket_helpers'

const CalendarComponent = dynamic(
  () => import('../../lib/Components/CalendarComponent'),
  { loading: () => <Loader />, ssr: false }
)

export default function Calendar({ user }: any) {
    return <CalendarComponent userInfo={ user } />
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        let user = await getUserInfo(context.req)

        return {
            props: {
                user: JSON.parse(JSON.stringify(user))
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
