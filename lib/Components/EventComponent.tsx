import styles from '../../styles/Event.module.css'

interface Action {
  prompt: string
  fn: () => void
}

interface EventProps {
  title: string
  start_date: Date
  location: {
    coordinates: any
    description: string
    link?: string
  }
  invited_users: any[]
  action: Action
  cancel: Action
}

export default function Event({ title, start_date, location, invited_users, action, cancel }: EventProps) {
  return (
    <div className={`g-col-6 ${styles['event-wrapper']}`}>
      <div>Title: {title}</div>
      <div>Date: {new Date(start_date).toLocaleString('en', { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
      <div>Location: {location.description}</div>
      {
        invited_users.length > 0 &&
        <div>Members: {invited_users.map((user) => user.username).join(', ')}</div>
      }
      <button className='btn btn-primary' onClick={action.fn}>
        {action.prompt}
      </button>
      <button className='btn btn-danger' onClick={cancel.fn}>
        {cancel.prompt}
      </button>
    </div>
  )
}
