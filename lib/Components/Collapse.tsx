import { useState } from "react"
import styles from '../../styles/Collapse.module.css'

interface CollapseItem {
    title: string
    content: JSX.Element
}

interface CollapseProps {
    data: CollapseItem[]
    fullscreen: boolean
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
                {data.map((item, idx) => (
                    <div key={ idx } className={ styles['item'] }>
                        <div className={ styles['title'] } onClick={() => toggle(idx)}>
                            <h2>{ item.title }</h2>
                            <span>{ selected === idx ? "-" : "+" }</span>
                        </div>
                        <div className={ selected === idx ? `${ styles['content'] } ${ styles['show'] }` : styles['content'] }>
                            { item.content }
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}