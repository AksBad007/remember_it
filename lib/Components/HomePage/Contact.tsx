import { toast } from 'react-toastify'
import { handleSubmit, post_or_put_data } from '../../Helpers/frontend_helpers'
import styles from '../../../styles/Home.module.css'

export default function Contact() {
  const contact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const body = handleSubmit(e)

    try {
      const { msg } = await post_or_put_data('contact', body)
      toast.success(msg)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <div className={ styles['contact-page-wrapper'] }>
      <h1 className={ styles['primary-heading'] }>Have Question In Mind?</h1>
      <h1 className={ styles['primary-heading'] }>Let Us Help You</h1>
      <form className={styles['contact-form-container'] } onSubmit={ contact }>
        <input type='email' name='email' placeholder='yourmail@gmail.com' />
        <button className='btn btn-lg btn-primary'>Submit</button>
      </form>
    </div>
  )
}
