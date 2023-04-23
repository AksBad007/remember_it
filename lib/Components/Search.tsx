import { FaSearch } from 'react-icons/fa'
import styles from '../../styles/Search.module.css'

export default function Search() {
    let searchTimeout: NodeJS.Timeout

    const searchSubmit = (e: React.FormEvent) => {
        clearTimeout(searchTimeout)
        const searchElement = e.target as HTMLInputElement

        searchTimeout = setTimeout(() => {
            console.log('value =', searchElement.value);
            searchElement.value = ''
        }, 1000)
    }

    return (
        <form className={ `mb-4 ${styles['wrap']}` } onSubmit={() => false }>
            <div className={ styles['search'] }>
                <div className='form-floating'>
                    <input
                        type='text'
                        name='searchTerm'
                        className={ `form-control shadow-none ${styles['searchTerm']}` }
                        id='floatingSearch'
                        placeholder='Search'
                        onInput={searchSubmit}
                    />
                    <label htmlFor='floatingSearch'>Search</label>
                </div>
                <button type='submit' className={ styles['searchButton'] }>
                    <FaSearch />
                </button>
            </div>
        </form>
    )
}
