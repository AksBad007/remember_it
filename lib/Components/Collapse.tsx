import { useState } from 'react'
import styles from '../../styles/Collapse.module.css'

interface CollapseProps {
    fullscreen: boolean
    data: {
        title: string
        content: JSX.Element
    }[]
}

export default function Collapse({ data, fullscreen = false }: CollapseProps) {
    const [selected, setSelected] = useState(0)
    const toggle = (i: number) => {
        if (selected === i)
            setSelected(-1)
        else
            setSelected(i)
    }

    return (
        <div className={ fullscreen ? `${ styles['wrapper'] } ${ styles['wrapper-fullscreen'] }` : styles['wrapper'] }>
            <div className={ styles['accordion'] }>
                {
                    data.map(({ title, content }, idx) => (
                        <div key={ idx } className={ styles['item'] }>
                            <div className={ styles['title'] } onClick={() => toggle(idx)}>
                                <h2>{ title }</h2>
                                <span>{ selected === idx ? '-' : '+' }</span>
                            </div>
                            <div className={ selected === idx ? `${ styles['content'] } ${ styles['show'] }` : styles['content'] }>
                                { content }
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}
