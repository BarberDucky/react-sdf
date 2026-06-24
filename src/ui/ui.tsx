import { useContext, useState, useSyncExternalStore } from "react"
import ShapeSelect from "./shape-select/shape-select"
import Header from "./header"
import './ui.css'
import { store, UiContext } from "../main"
import ShapeList from "./shape-list-props/shape-list"
import ShapeProperties from "./shape-list-props/shape-properties"
import ShapeListProps from "./shape-list-props/shape-list-props"
import { Shape } from "../model/shape-tree"

export type UiShape = 'sphere' | 'box'

const Ui = () => {

  const uiBindings = useContext(UiContext)

  const uiStore = useSyncExternalStore(store.subscribe, store.getState)

  const [gizmoActive, setGizmoActive] = useState<boolean>(true)

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
      gizmoActive={gizmoActive}
      onGizmoToggle={() => {
        uiBindings.toggleGizmo()
        setGizmoActive(!gizmoActive)
      }}
    />
    <div className="ui-main">
      <ShapeSelect
        shapeList={shapes}
        selectedShape={selectedShape}
        onSelectShape={(shape: UiShape) => {
          uiBindings.setActiveShape(selectedShape != shape ? shape : null)
          setSelectedShape(selectedShape != shape ? shape : null)
        }}
      />
      <ShapeListProps
        shapeList={uiStore.shapesRoot}
        selectedShapeId={uiStore.selectedExistingShape}
        onSelectShape={(id: string) => setSelectedExistingShape(id)}
      />
    </div>
  </div>
}

export default Ui