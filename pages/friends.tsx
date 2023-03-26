import { GetServerSideProps } from 'next'
import { getUserInfo } from '../lib/Helpers/db_helpers'
import Users from '../lib/Models/User.model'

let count = 0

export default function friends({ friendList }: any) {
    console.log(friendList)

  return (
    <div>friends</div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        const { friends_added, friends_recieved, friends_sent } = await getUserInfo(context.req)
        const yo = [...friends_added, ...friends_recieved, ...friends_sent].map(friend => friend._id)
        const friendList = await Users.find({ _id: { $in: yo } }, '_id username email').skip(count).limit(20).sort({ username: 1 })

        return {
            props: {
                frienList: JSON.parse(JSON.stringify(friendList))
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
