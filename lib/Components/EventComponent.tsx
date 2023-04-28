import styles from '../../styles/Event.module.css'

interface Action {
  prompt: string
  fn: () => void
}

interface EventProps {
  evt: any
  action: Action
  cancel: Action
}

export default function Event({ evt, action, cancel }: EventProps) {
  const { title, start_date, location, description, invited_users } = evt

  return (
    <div className={ styles['evt_item'] }>
      <div className={ styles['evt-item_link'] }>
        <div className={ styles['evt-item_bg'] }></div>

        <div>
          <div className={ styles['evt-item_title'] }>
            { title }
          </div>

          <div className={ styles['evt-item_bg-item'] }>
            Location:
            <span className={ styles['evt-item_bg-item_child'] }>
              { location.description }
            </span>
          </div>

          <div className={ styles['evt-item_bg-item'] }>
            Description:
            <span className={ styles['evt-item_bg-item_child'] }>
              { description || 'No Description Added.' }
            </span>
          </div>

          <div className={ styles['evt-item_bg-item'] }>
            Members:
            <span className={ styles['evt-item_bg-item_child'] }>
              {
                invited_users.length > 0 ?
                invited_users.map((user: any) => user.userID.username).join(', ') :
                'No Members Added.'
              }
            </span>
          </div>
        </div>

        <div className={ styles['evt-item_date-box'] }>
          Start:
          <span className={ styles['evt-item_date'] }>
            { new Date(start_date).toLocaleString('en', { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }
          </span>
        </div>

        <div className={ styles['evt-btns'] }>
          <button className='btn btn-primary' onClick={ action.fn }>
            { action.prompt }
          </button>
          <button className='btn btn-danger' onClick={ cancel.fn }>
            { cancel.prompt }
          </button>
       </div>
      </div>
    </div>
  )
}
