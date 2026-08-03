import './shape-list-props.css'
import Card from './card'
import ShapeProperties from './shape-properties'
import { TreeIcon, TuneIcon } from '../../assets/icons'
import { useSyncExternalStore } from 'react'
import { store } from '../../main'
import { Box, Sphere } from '../../model/shapes.ts'

const ShapeListProps = () => {

  const uiStore = useSyncExternalStore(store.subscribe, store.getState)

  function handleSelectShape(shapeId: string) {

    const oldShapeId = uiStore.selectedExistingShape

    store.setState({
      ...uiStore,
      selectedExistingShape: shapeId == oldShapeId
        ? null
        : shapeId,
    })

    const oldSelectedShape = uiStore.shapesRoot.find(flatShape => flatShape.id == oldShapeId)?.node
    if (oldSelectedShape instanceof Sphere || oldSelectedShape instanceof Box) {
      oldSelectedShape.isSelected = false
    }

    const selectedShape = uiStore.shapesRoot.find(flatShape => flatShape.id == shapeId)?.node
    if (selectedShape instanceof Sphere || selectedShape instanceof Box) {
      selectedShape.isSelected = shapeId == store.getState().selectedExistingShape
    }
  }

  const shapeButtons = uiStore.shapesRoot.map(shape => (
    <button
      key={shape.id}
      onClick={() => handleSelectShape(shape.id)}
      className={`
        shape-list-entry 
        ${shape.id == uiStore.selectedExistingShape ? 'selected' : ''}
        `}
    >
      {`${Array.from({ length: shape.depth }).fill('-')}`}
      {shape.type}
    </button>
  ))

  const shapeProps = <Card title="Properties" icon={<TuneIcon/>}>
    <ShapeProperties/>
  </Card>

  return (
    <div className="shape-list-props">
      <Card title="Combination Tree" icon={<TreeIcon/>}>
        {shapeButtons}
      </Card>
      {uiStore.selectedExistingShape != null ? shapeProps : null}
    </div>
  )
}

export default ShapeListProps