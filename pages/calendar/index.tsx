export default function Calendar({ data }: any) {
    return (
        <div>
            Calendar
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
    console.log(data);

    return { props: { data } }
}
