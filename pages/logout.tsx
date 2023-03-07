import { useRouter } from "next/router"
import { useEffect } from "react"
import { useCookies } from "react-cookie"
import Loader from "../lib/Components/Loader"

export default function Logout() {
    const [_cookie, _setCookie, removeCookie] = useCookies(['auth_token'])
    const router = useRouter()

    useEffect(() => {
        removeCookie('auth_token')
        localStorage.clear()
        router.push('/')
    })

    return <Loader />
}
