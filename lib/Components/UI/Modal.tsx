import { AiFillCloseCircle } from 'react-icons/ai'
import styles from '../../../styles/Modal.module.css'

interface ModalProps {
    bg: boolean
    closeOption?: boolean
    closeModal?: () => void
    title: string
    children: JSX.Element
}

export default function Modal({ bg, closeOption=false, closeModal, title, children }: ModalProps) {
    return (
        <div className={ bg ? `${styles['modal-background']} ${styles['show']}` : `${styles['modal-background']}`}>
            <div className={ styles['modal-container'] }>
                <div className={ styles['modal-title'] }>
                    { closeOption && <button className='btn btn-danger' onClick={ closeModal }> <AiFillCloseCircle /> </button> }
                    <h2>{ title }</h2>
                </div>
                <div className={ styles['modal-body'] }>
                    { children }
                </div>
            </div>
        </div>
    );
}
