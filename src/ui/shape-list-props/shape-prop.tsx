import './shape-prop.css'

function ShapeProp(props: {
  label: string
  children: React.ReactNode
}) {
  return <div className="shape-prop">
    <div className="shape-prop-label">{props.label}</div>
    <div className="shape-prop-inputs">{props.children}</div>
  </div>
}

export default ShapeProp