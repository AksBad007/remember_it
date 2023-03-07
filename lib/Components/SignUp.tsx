import { useRouter } from 'next/router'
import { useCookies } from 'react-cookie'
import { toast } from 'react-toastify'
import { postData, _handleSubmit } from '../Helpers/frontend_helpers'
import styles from '../../styles/Login.module.css'

export default function SignUp() {
  const router = useRouter()
  const [_cookie, setCookie] = useCookies(['auth_token'])
  const _signUpURL = 'auth?' + new URLSearchParams({ mode: 'register' })

  const register = async (e: React.FormEvent<HTMLFormElement>) => {
    const userData = _handleSubmit(e)

    try {
      let res = await postData(_signUpURL, userData)

      res = res.data
      toast.success(res.msg)
      setCookie('auth_token', res.data, { path: '/' })

      if (userData.remember)
        localStorage.setItem('auth_token', res.data)

      router.replace('/calendar')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <form className={`d-flex flex-column ${ styles['sign-form'] }`} onSubmit={ register }>
      <div className="form-floating mb-3">
        <input name='username' type="text" className="form-control shadow-none" id="floatingInput" placeholder="Username" />
        <label htmlFor="floatingInput">Username</label>
      </div>
      <div className="form-floating mb-3">
        <input name='email' type="email" className="form-control shadow-none" id="floatingEmail" placeholder="name@example.com" />
        <label htmlFor="floatingEmail">Email address</label>
      </div>
      <div className="form-floating mb-3">
        <input name='password' type="password" className="form-control shadow-none" id="floatingPassword" placeholder="Password" />
        <label htmlFor="floatingPassword">Password</label>
      </div>
      <div className="form-check mb-3">
        <input name='remember' className="form-check-input shadow-none" type="checkbox" id="remember" />
        <label className="form-check-label" htmlFor="remember">
          Remember Me
        </label>
      </div>
      <button type='submit' className={`btn btn-primary ${ styles['sign-btn'] }`}>Register</button>
    </form>
  )
}
