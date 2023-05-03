import { FaSearch } from 'react-icons/fa'
import styles from '../../../styles/Search.module.css'

interface SearchProps {
    onSearch: (query: string) => Promise<void>
    onClear: () => Promise<void>
}

export default function Search({ onSearch, onClear }: SearchProps) {
    let searchTimeout: NodeJS.Timeout

    const searchSubmit = async (e: React.FormEvent) => {
        clearTimeout(searchTimeout)
        const { value } = e.target as HTMLInputElement

        if (value)
            searchTimeout = setTimeout(async () => await onSearch(value), 1000)
        else
            await onClear()
    }

    return (
        <form className={ `mb-4 ${styles['wrap']}` } onSubmit={(e) => e.preventDefault() }>
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
