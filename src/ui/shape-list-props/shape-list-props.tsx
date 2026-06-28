import './shape-list-props.css'
import Card from './card'
import ShapeProperties from './shape-properties'
import { TreeIcon, TuneIcon } from '../../assets/icons'
import { useSyncExternalStore } from 'react'
import { store } from '../../main'

const ShapeListProps = () => {

  const uiStore = useSyncExternalStore(store.subscribe, store.getState)

  function handleSelectShape(shapeId: string) {
    store.setState({
      ...uiStore,
      selectedExistingShape: shapeId == uiStore.selectedExistingShape
        ? null
        : shapeId,
    })
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

  const shapeProps = <ShapeProperties
    id={'1'}
    type={'sphere'}
    currentValue={1}
    handleChange={() => { }}
  />

  return (
    <div className="shape-list-props">
      <Card title="Combination Tree" icon={<TreeIcon />}>
        {shapeButtons}
      </Card>
      <Card title="Properties" icon={<TuneIcon />}>
        {shapeProps}
      </Card>
    </div>
  )
}

export default ShapeListProps