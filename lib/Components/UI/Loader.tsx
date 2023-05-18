import styles from '../../../styles/Loader.module.css'

export default function Loader({ fullscreen = true }) {
    return (
        <div className={fullscreen ? `${styles['loader']} ${styles['fullscreen']} ` : styles['loader']}>
            <i className={styles['loader-el']}></i>
            <i className={styles['loader-el']}></i>
        </div>
    )
}
