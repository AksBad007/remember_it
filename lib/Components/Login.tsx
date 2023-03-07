import { useRouter } from 'next/router'
import { useCookies } from 'react-cookie'
import { toast } from 'react-toastify'
import { postData, _handleSubmit } from '../Helpers/frontend_helpers'
import styles from '../../styles/Login.module.css'

export default function Login() {
  const router = useRouter()
  const [_cookie, setCookie] = useCookies(['auth_token'])
  const _loginURL = 'auth?' + new URLSearchParams({ mode: 'login' })

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    const userData = _handleSubmit(e)

    try {
      let res = await postData(_loginURL, userData)

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
    <form className={`d-flex flex-column ${styles['sign-form']}`} onSubmit={ login }>
      <div className="form-floating mb-3">
        <input name='email' type="email" className="form-control shadow-none" id="floatingInput" placeholder="name@example.com" />
        <label htmlFor="floatingInput">Email address</label>
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
      <button type='submit' className={`btn btn-primary ${styles['sign-btn']}`}>Login</button>
    </form>
  )
}
