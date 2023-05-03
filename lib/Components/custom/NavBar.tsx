import Link from 'next/link'
import { useState } from 'react'
import { IconContext } from 'react-icons'
import { FaUserFriends, FaBars, FaChevronLeft, FaPowerOff } from 'react-icons/fa'
import { IoSend } from 'react-icons/io5'
import { IoMdSettings } from 'react-icons/io'
import { AiFillHome } from 'react-icons/ai'
import { MdOutlineCallReceived } from 'react-icons/md'
import styles from '../../../styles/NavBar.module.css'

export default function NavBar({ showSide=true }) {
    const [sidebar, setSidebar] = useState(false)
    const toggleBar = () => setSidebar(!sidebar)
    const SidebarData = [
        {
            title: 'Home',
            path: '/calendar',
            icon: <AiFillHome />
        },
        {
            title: 'Received',
            path: '/calendar/received',
            icon: <MdOutlineCallReceived />
        },
        {
            title: 'Sent',
            path: '/calendar/sent',
            icon: <IoSend />
        },
        {
            title: 'Friends',
            path: '/friends',
            icon: <FaUserFriends />
        }
    ]

    return (
        <IconContext.Provider value={{ color: '#fff' }}>
            <div id={ styles['navbar'] }>
                <div>
                    {
                        showSide &&
                        <span onClick={ toggleBar } id={ styles['open-sidebar'] } className={ styles['menu-bars'] }>
                            <FaBars />
                        </span>
                    }
                </div>

                <div id={ styles['nav-header'] }>
                    <h1>Remember It!</h1>
                </div>

                {
                    showSide &&
                    <div className='d-flex justify-content-center'>
                        <Link href='/logout' id='logout-btn' className={ styles['menu-bars'] }>
                            <FaPowerOff />
                        </Link>
                    </div>
                }
            </div>

            {
                showSide &&
                <nav className={ sidebar ? `${ styles['nav-menu'] } ${ styles['active'] }` : styles['nav-menu'] }>
                    <ul className={ styles['nav-menu-items'] }>
                        <li id={ styles['navbar-toggle'] }>
                            <span id={ styles['close-sidebar'] } onClick={ toggleBar } className={ styles['menu-bars'] }>
                                <FaChevronLeft />
                            </span>
                        </li>

                        {
                            SidebarData.map((item, idx) => (
                                <li key={ idx } onClick={ toggleBar } className={ styles['nav-text'] }>
                                    <Link href={ item.path }>
                                        { item.icon } <span>{ item.title }</span>
                                    </Link>
                                </li>
                            ))
                        }
                    </ul>
                    <hr />

                    <div onClick={ toggleBar } className={ styles['nav-text'] }>
                        <Link href='/settings'>
                            <IoMdSettings /> <span>Settings</span>
                        </Link>
                    </div>
                </nav>
            }
        </IconContext.Provider>
    )
}
