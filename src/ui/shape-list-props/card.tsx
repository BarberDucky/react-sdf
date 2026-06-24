import { ReactNode } from 'react'
import './card.css'

const Card = (props: { title: string, icon: ReactNode, children: ReactNode }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3>{props.title}</h3>
        {props.icon}
      </div>
      <div className="card-content">
        {props.children}
      </div>
    </div>
  )
}

export default Card