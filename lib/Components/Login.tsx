import { useRouter } from 'next/router'
import { useContext, useState } from 'react'
import { useCookies } from 'react-cookie'
import { toast } from 'react-toastify'
import { SocketContext } from '../Helpers/socket_helpers'
import { post_or_put_data, handleSubmit } from '../Helpers/frontend_helpers'
import styles from '../../styles/Login.module.css'

export default function Login({ login=false }) {
  const router = useRouter()
  const [_cookies, setCookie] = useCookies(['auth_token'])
  const [btn, disableBtn] = useState(false)
  const authUrl = 'auth?' + new URLSearchParams({ mode: login ? 'login' : 'register' })
  const socket = useContext(SocketContext)

  const authenticate = async (e: React.FormEvent<HTMLFormElement>) => {
    disableBtn(true)
    const userData = handleSubmit(e)

    try {
      let res = await post_or_put_data(authUrl, userData)
      const auth_token = res.data

      toast.success(res.msg)
      setCookie('auth_token', auth_token, { path: '/' }) 

      if (userData.remember)
        localStorage.setItem('auth_token', auth_token)

      router.replace('/calendar')

      socket.emit('newLogin', auth_token)
    } catch (error: any) {
      toast.error(error.message)

      disableBtn(false)
    }
  }

  return (
    <form className={`d-flex flex-column ${styles['sign-form']}`} onSubmit={authenticate}>
      {
        !login &&
        <div className='form-floating mb-3'>
          <input name='username' type='text' className='form-control shadow-none' id='floatingInput' placeholder='Username' disabled={btn} />
          <label htmlFor='floatingInput'>Username</label>
        </div>
      }
      <div className='form-floating mb-3'>
        <input name='email' type='email' className='form-control shadow-none' id='floatingEmail' placeholder='name@example.com' disabled={btn} />
        <label htmlFor='floatingEmail'>Email address</label>
      </div>
      <div className='form-floating mb-3'>
        <input name='password' type='password' className='form-control shadow-none' id='floatingPassword' placeholder='Password' disabled={btn} />
        <label htmlFor='floatingPassword'>Password</label>
      </div>
      <div className='form-check mb-3'>
        <label className='form-check-label cursor-pointer' htmlFor='remember'>
          <input name='remember' className='form-check-input shadow-none' type='checkbox' id='remember' /> Remember Me
        </label>
      </div>
      <button type='submit' className={`btn btn-primary ${styles['sign-btn']}`} disabled={btn}>
        { login ? 'Login' : 'Sign Up' }
      </button>
    </form>
  )
}
