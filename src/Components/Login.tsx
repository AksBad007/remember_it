import styles from '../../styles/Login.module.css'
import { _handleSubmit } from '../Helpers/frontCommon'

export default function Login() {
  const login = (e: React.FormEvent<HTMLFormElement>) => {
    _handleSubmit(e, '/api/auth?mode=login')
      .then(res => console.log(res))
      .catch(err => console.log(err))
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
