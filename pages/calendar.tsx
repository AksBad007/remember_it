import { GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import Loader from '../lib/Components/Loader'
import { getUserInfo } from '../lib/Helpers/db_helpers'
import dbConnect from '../lib/Helpers/db_helpers'
import styles from '../styles/CalendarPage.module.css'

const CalendarComponent = dynamic(
  () => import('../lib/Components/CalendarComponent'),
  { loading: () => <Loader />, ssr: false }
)

export default function Calendar({ user }: any) {
    return (
        <div id={ styles['main-calendar-div'] }>
            <CalendarComponent />
        </div>
    )
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
