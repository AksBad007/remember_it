import styles from '../../../styles/Loader.module.css'

export default function Loader() {
  return (
    <div className={ styles['loader']}>
        <i className={ styles['loader-el']}></i>
        <i className={ styles['loader-el']}></i>
    </div>
  )
}
