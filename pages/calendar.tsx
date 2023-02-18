import dynamic from 'next/dynamic'
import styles from '../styles/CalendarPage.module.css'

const CalendarComponent = dynamic(
  () => import('../lib/Components/Calendar'),
  { loading: () => <p>Loading ...</p>, ssr: false }
)

export default function Calendar({ data }: any) {
    console.log(data);
    return (
        <div id={ styles['main-calendar-div'] }>
            <CalendarComponent />
        </div>
    )
}

export async function getServerSideProps(context: any) {
    let req = await fetch('http://localhost:3000/api/auth', {
        headers: {
            Cookie: context.req.headers.cookie
        }
    })
    let data = await req.json()

    return { props: { data } }
}
