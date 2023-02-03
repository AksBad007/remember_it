import styles from '../../styles/Login.module.css'

export default function Login() {
  const login = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(e.target);
  }

  return (
    <form className={`d-flex flex-column ${styles['sign-form']}`} onSubmit={ login }>
      <div className="form-floating mb-3">
        <input type="email" className="form-control shadow-none" id="floatingInput" placeholder="name@example.com" />
        <label htmlFor="floatingInput">Email address</label>
      </div>
      <div className="form-floating mb-3">
        <input type="password" className="form-control shadow-none" id="floatingPassword" placeholder="Password" />
        <label htmlFor="floatingPassword">Password</label>
      </div>
      <div className="form-check mb-3">
        <input className="form-check-input shadow-none" type="checkbox" id="remember" />
        <label className="form-check-label" htmlFor="remember">
          Remember Me
        </label>
      </div>
      <button type='submit' className={`btn btn-primary ${styles['sign-btn']}`}>Login</button>
    </form>
  )
}