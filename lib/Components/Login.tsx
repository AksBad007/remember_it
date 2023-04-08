import { useRouter } from 'next/router'
import { useCookies } from 'react-cookie'
import { toast } from 'react-toastify'
import { post_or_put_data, _handleSubmit } from '../Helpers/frontend_helpers'
import styles from '../../styles/Login.module.css'

interface LoginProps {
  login?: boolean
}

export default function Login({ login=false }: LoginProps) {
  const router = useRouter()
  const [_cookie, setCookie] = useCookies(['auth_token'])
  const _authUrl = 'auth?' + new URLSearchParams({ mode: login ? 'login' : 'register' })

  const authenticate = async (e: React.FormEvent<HTMLFormElement>) => {
    const userData = _handleSubmit(e)

    try {
      let res = await post_or_put_data(_authUrl, userData)
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
    <form className={`d-flex flex-column ${styles['sign-form']}`} onSubmit={authenticate}>
      {
        !login &&
        <div className='form-floating mb-3'>
          <input name='username' type='text' className='form-control shadow-none' id='floatingInput' placeholder='Username' />
          <label htmlFor='floatingInput'>Username</label>
        </div>
      }
      <div className='form-floating mb-3'>
        <input name='email' type='email' className='form-control shadow-none' id='floatingEmail' placeholder='name@example.com' />
        <label htmlFor='floatingEmail'>Email address</label>
      </div>
      <div className='form-floating mb-3'>
        <input name='password' type='password' className='form-control shadow-none' id='floatingPassword' placeholder='Password' />
        <label htmlFor='floatingPassword'>Password</label>
      </div>
      <div className='form-check mb-3'>
        <label className='form-check-label cursor-pointer' htmlFor='remember'>
          <input name='remember' className='form-check-input shadow-none' type='checkbox' id='remember' /> Remember Me
        </label>
      </div>
      <button type='submit' className={`btn btn-primary ${styles['sign-btn']}`}>
        { login ? 'Login' : 'Sign Up' }
      </button>
    </form>
  )
}
