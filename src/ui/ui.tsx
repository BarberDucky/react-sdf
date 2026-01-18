import { useContext, useState, useSyncExternalStore } from "react"
import ShapeSelect from "./shape-select"
import Header from "./header"
import './ui.css'
import { store, UiContext } from "../main"

export type Shape = 'sphere' | 'box'

const Ui = () => {

  const uiBindings = useContext(UiContext)
  
  const uiStore = useSyncExternalStore(store.subscribe, store.getState)
  
  const [gizmoActive, setGizmoActive] = useState<boolean>(true)

  const shapes: Array<{ type: Shape, label: string }> = [
    { type: 'sphere', label: 'Sphere' },
    { type: 'box', label: 'Box' },
  ]

  const selectedShape = uiStore.selectedShape
  function setSelectedShape (selectedShape: Shape | null) {
    store.setState({
      ...uiStore,
      selectedShape,
    })
  }

  return <div className="ui">
    <Header
      gizmoActive={gizmoActive}
      onGizmoToggle={() => {
        uiBindings.toggleGizmo()
        setGizmoActive(!gizmoActive)
      }}
    />
    <ShapeSelect
      shapeList={shapes}
      selectedShape={selectedShape}
      onSelectShape={(shape: Shape) => {
        uiBindings.setActiveShape(selectedShape != shape ? shape : null)
        setSelectedShape(selectedShape != shape ? shape : null)
      }}
    />
  </div>
}

export default Ui