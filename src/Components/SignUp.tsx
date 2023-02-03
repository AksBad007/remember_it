import styles from '../../styles/Login.module.css'

export default function SignUp() {
  const signUp = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <form className={`d-flex flex-column ${styles['sign-form']}`} onSubmit={ signUp }>
      <div className="form-floating mb-3">
        <input type="text" className="form-control shadow-none" id="floatingInput" placeholder="Username" />
        <label htmlFor="floatingInput">Username</label>
      </div>
      <div className="form-floating mb-3">
        <input type="email" className="form-control shadow-none" id="floatingEmail" placeholder="name@example.com" />
        <label htmlFor="floatingEmail">Email address</label>
      </div>
      <div className="form-floating mb-3">
        <input type="password" className="form-control shadow-none" id="floatingPassword" placeholder="Password" />
        <label htmlFor="floatingPassword">Password</label>
      </div>
      <button type='submit' className={`btn btn-primary ${styles['sign-btn']}`}>Login</button>
    </form>
  )
}