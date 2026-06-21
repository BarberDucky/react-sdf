import { UiShape } from "../ui"
import { ShapeSelectButton } from "./button"
import './shape-select.css'

const ShapeSelect = (props: {
  selectedShape: UiShape | null,
  onSelectShape: (shape: UiShape) => void
  shapeList: Array<{ type: UiShape, label: string }>
}) => {

  const shapeButtons = props.shapeList.map(shape => (
    <ShapeSelectButton
      key={shape.type}
      shape={shape.type}
      isSelected={shape.type === props.selectedShape}
      onClick={props.onSelectShape}
    />
  ))

  return (
    <div className="shape-select">
      {shapeButtons}
    </div>
  )
}

export default ShapeSelect