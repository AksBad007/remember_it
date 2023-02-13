import styles from '../../styles/Login.module.css'
import { _handleSubmit } from '../Helpers/frontCommon'

export default function SignUp() {
  const signUp = (e: React.FormEvent<HTMLFormElement>) => {
    _handleSubmit(e, '/api/auth?mode=register')
      .then(res => console.log(res))
      .catch(err => console.log(err))
  }

  return (
    <form className={`d-flex flex-column ${styles['sign-form']}`} onSubmit={ signUp }>
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
      <button type='submit' className={`btn btn-primary ${styles['sign-btn']}`}>Register</button>
    </form>
  )
}
