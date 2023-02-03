import { useRouter } from "next/router"
import Collapse from "../../src/Components/Collapse"
import Login from "../../src/Components/Login"
import SignUp from "../../src/Components/SignUp"

const index = () => {
    // const router = useRouter()
    // const user_id = localStorage.getItem('user_id')
    const authForm = [
        {
            title: 'Login',
            content: <Login />
        },
        {
            title: 'Sign Up',
            content: <SignUp />
        }
    ]
    // if (user_id) return router.replace('/calendar')

    return <Collapse data={ authForm } fullscreen={ true } />
}

export default index