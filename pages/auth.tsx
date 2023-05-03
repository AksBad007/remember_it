import Collapse from '../lib/Components/UI/Collapse'
import Login from '../lib/Components/Login'

export default function Auth() {
    const authForm = [
        {
            title: 'Login',
            content: <Login login />
        },
        {
            title: 'Sign Up',
            content: <Login />
        }
    ]

    return <Collapse data={ authForm } fullscreen />
}
