import { GetServerSideProps } from 'next'
import { getUserInfo } from '../lib/Helpers/db_helpers'
import Users from '../lib/Models/User.model'
import Search from '../lib/Components/Search'

let offset = 0
const limit = global.limit

export default function friends({ friendList }: any) {
    console.log(friendList)

    return (
        <div className='d-flex flex-column mt-2 align-items-center'>
            <Search />
        </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        const { friends_added, friends_recieved, friends_sent } = await getUserInfo(context.req)
        const friendIds: string[] = [...friends_added, ...friends_recieved, ...friends_sent].map(friend => friend._id)
        const friendList = await Users.find({ _id: { $in: friendIds } }, '_id username email').skip(offset).limit(limit).sort({ username: 'asc' })

        return {
            props: {
                friendList: JSON.parse(JSON.stringify(friendList))
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
