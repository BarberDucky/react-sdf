import './shape-list-props.css'
import { FlatShapeListEntry } from "../../model/shape-controller"
import Card from './card'
import ShapeProperties from './shape-properties'
import { TreeIcon, TuneIcon } from '../../assets/icons'

const ShapeListProps = (props: { 
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
  
  const shapeProps = <ShapeProperties
        id={'1'}
        type={'sphere'}
        currentValue={1}
        handleChange={(value) => {}}
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