import Collapse from '../lib/Components/Collapse'
import Login from '../lib/Components/Login'
import SignUp from '../lib/Components/SignUp'

export default function Auth() {
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

    return <Collapse data={ authForm } fullscreen />
}
