import { useSyncExternalStore } from "react"
import { UiShape } from "../ui"
import { ShapeSelectButton } from "./button"
import './shape-select.css'
import { store } from "../../main"

const ShapeSelect = () => {

  const uiStore = useSyncExternalStore(store.subscribe, store.getState)

  const shapes: Array<{ type: UiShape, label: string }> = [
    { type: 'sphere', label: 'Sphere' },
    { type: 'box', label: 'Box' },
  ]

  const shapeButtons = shapes.map(shape => (
    <ShapeSelectButton
      key={shape.type}
      shape={shape.type}
      isSelected={shape.type === uiStore.selectedShape}
      onClick={(selectedShape: UiShape | null) => {
        store.setState({
          ...uiStore,
          selectedShape,
        })
      }}
    />
  ))

  return (
    <div className="shape-select">
      <div className="shape-select-header">
        <h3>Shapes</h3>
        <span>Build something fun!</span>
      </div>
      {shapeButtons}
    </div>
  )
}

export default ShapeSelect