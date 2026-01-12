import { Shape } from "./ui"
import './shape-select.css'

const ShapeSelect = (props: { 
  selectedShape: Shape | null,
  onSelectShape: (shape: Shape) => void
  shapeList: Array<{ type: Shape, label: string }>
}) => {
  
  const shapeButtons = props.shapeList.map(shape => (
    <button 
      key={shape.type}
      onClick={() => props.onSelectShape(shape.type)}
      className={`
        shape-button 
        ${shape.type == props.selectedShape ? 'selected' : ''}
        `}
    >
      {shape.label}
    </button>
  ))
  
  return (
    <div className="shape-select">
      {shapeButtons}
    </div>
  )
}

export default ShapeSelect