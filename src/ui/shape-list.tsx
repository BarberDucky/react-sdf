import { Shape } from "./ui"
import './shape-list.css'
import { Operation } from "../model/shape-tree"
import { FlatShapeListEntry } from "../model/shape-controller"

const ShapeList = (props: { 
  selectedShapeId: string | null,
  onSelectShape: (shapeId: string) => void
  shapeList: Array<FlatShapeListEntry>
}) => {
  

  console.log(props.selectedShapeId)

  const shapeButtons = props.shapeList.map(shape => (
    <button 
      key={shape.id}
      onClick={() => props.onSelectShape(shape.id)}
      className={`
        shape-list-entry 
        ${shape.id == props.selectedShapeId ? 'selected' : ''}
        `}
    >
      {`${Array.from({length: shape.depth}).fill('-')}`}
      {shape.type}
    </button>
  ))
  
  return (
    <div className="shape-list">
      {shapeButtons}
    </div>
  )
}

export default ShapeList