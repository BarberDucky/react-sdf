import { useSyncExternalStore } from "react"
import ShapeSelect from "./shape-select/shape-select"
import Header from "./header"
import './ui.css'
import { store } from "../main"
import ShapeProperties from "./shape-list-props/shape-properties"
import ShapeListProps from "./shape-list-props/shape-list-props"
import { Shape } from "../model/shape-tree"

export type UiShape = 'sphere' | 'box'

const Ui = () => {

  const uiStore = useSyncExternalStore(store.subscribe, store.getState)

  const shapes: Array<{ type: UiShape, label: string }> = [
    { type: 'sphere', label: 'Sphere' },
    { type: 'box', label: 'Box' },
  ]

  const selectedShape = uiStore.selectedShape

  function setSelectedShape(selectedShape: UiShape | null) {
    store.setState({
      ...uiStore,
      selectedShape,
    })
  }

  function setSelectedExistingShape(selectedExistingShape: string) {
    store.setState({
      ...uiStore,
      selectedExistingShape: selectedExistingShape == uiStore.selectedExistingShape
        ? null
        : selectedExistingShape,
    })
  }

  function toggleGizmo(): void {
    store.setState({
      ...uiStore,
      isGizmoEnabled: !uiStore.isGizmoEnabled,
    })
  }

  let shapeProperties = null
  const selectedExistingShape = store.getState().selectedExistingShape
  if (selectedExistingShape != null) {
    const shape = store.getState().shapesRoot
      .find(element => element.id == selectedExistingShape)

    if (shape != null && shape.node instanceof Shape) {
      shapeProperties = <ShapeProperties
        id={shape.id}
        type={shape.type}
        currentValue={shape.node.position.y}
        handleChange={(value) => {
          if (shape.node instanceof Shape) {
            shape.node.position.y = value
            store.setState({
              ...store.getState(),
            })
          }
        }}
      />
    }
  }

  console.log(shapeProperties)

  return <div className="ui">
    <Header
      gizmoActive={uiStore.isGizmoEnabled}
      onGizmoToggle={() => {
        toggleGizmo()
      }}
    />
    <div className="ui-main">
      <ShapeSelect
        shapeList={shapes}
        selectedShape={selectedShape}
        onSelectShape={(shape: UiShape) => {
          setSelectedShape(selectedShape != shape ? shape : null)
        }}
      />
      <ShapeListProps
        shapeList={store.getState().shapesRoot}
        selectedShapeId={uiStore.selectedExistingShape}
        onSelectShape={(id: string) => setSelectedExistingShape(id)}
      />
    </div>
  </div>
}

export default Ui