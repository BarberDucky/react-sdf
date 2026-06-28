import { useSyncExternalStore } from 'react'
import { UnionIcon, IntersectionIcon, DifferenceIcon } from '../../assets/icons'
import ButtonInput from '../inputs/button-input'
import ColorInput from '../inputs/color-input'
import NumberInput from '../inputs/number-input'
import RangeInput from '../inputs/range-input'
import ShapeProp from './shape-prop'
import './shape-properties.css'
import { store } from '../../main'
import { Shape } from '../../model/shape-tree'
import { hexToRgb } from '../../utils'

const ShapeProperties = () => {

  const uiStore = useSyncExternalStore(store.subscribe, store.getState)

  const shapeData = uiStore.shapesRoot.find(flatShape => flatShape.id == uiStore.selectedExistingShape)

  function handlePositionChange(axis: 'x' | 'y' | 'z', value: number) {
    if (Number.isNaN(value)) return
    if (!(shapeData?.node instanceof Shape)) return
    shapeData.node.position[axis] = value
    store.setState({ ...uiStore })
  }

  if (shapeData == null || !(shapeData.node instanceof Shape)) {
    return null
  }

  return <div className="shape-properties">
    <ShapeProp label='Position'>
      <div className="shape-prop-point3">
        <NumberInput
          label='X'
          labelColor='#6d5e00'
          value={shapeData.node.position.x}
          onValueChange={(value) => {
            handlePositionChange('x', value)
          }}
        />
        <NumberInput
          label='Y'
          labelColor='#a43073'
          value={shapeData.node.position.y}
          onValueChange={(value) => {
            handlePositionChange('y', value)
          }}
        />
        <NumberInput
          label='Z'
          labelColor='#0060ac'
          value={shapeData.node.position.z}
          onValueChange={(value) => {
            handlePositionChange('z', value)
          }}
        />
      </div>
    </ShapeProp>

    <ShapeProp label='Rotation'>
      <div className="shape-prop-point3">
        <NumberInput
          label='X'
          labelColor='#6d5e00'
          value={0}
          onValueChange={(value) => console.log('Rotation', value)}
        />
        <NumberInput
          label='Y'
          labelColor='#a43073'
          value={0}
          onValueChange={(value) => console.log('Rotation', value)}
        />
        <NumberInput
          label='Z'
          labelColor='#0060ac'
          value={shapeData.node.position.z}
          onValueChange={(value) => {
            if (Number.isNaN(value)) return
            if (!(shapeData?.node instanceof Shape)) return
            shapeData.node.position.z = value
            store.setState({ ...uiStore })
          }}
        />
      </div>
    </ShapeProp>

    <ShapeProp label='Rotation'>
      <div className="shape-prop-point3">
        <NumberInput
          label='X'
          labelColor='#6d5e00'
          value={0}
          onValueChange={(value) => console.log('Rotation', value)}
        />
        <NumberInput
          label='Y'
          labelColor='#a43073'
          value={0}
          onValueChange={(value) => console.log('Rotation', value)}
        />
        <NumberInput
          label='Z'
          labelColor='#0060ac'
          value={0}
          onValueChange={(value) => console.log('Rotation', value)}
        />
      </div>
    </ShapeProp>

    <ShapeProp label='Scale'>
      <div className="shape-prop-point3">
        <NumberInput
          label='X'
          labelColor='#6d5e00'
          value={1}
          onValueChange={(value) => console.log('Scale', value)}
        />
        <NumberInput
          label='Y'
          labelColor='#a43073'
          value={1}
          onValueChange={(value) => console.log('Scale', value)}
        />
        <NumberInput
          label='Z'
          labelColor='#0060ac'
          value={1}
          onValueChange={(value) => console.log('Scale', value)}
        />
      </div>
    </ShapeProp>

    <ShapeProp label='Material'>
      <ColorInput
        value={`rgb(${shapeData.node.color.x * 255}, ${shapeData.node.color.y * 255}, ${shapeData.node.color.z * 255})`}
        onValueChange={(value) => {
          const {r, g, b} = hexToRgb(value)
          if (!(shapeData?.node instanceof Shape)) return
          shapeData.node.color.x = r / 255
          shapeData.node.color.y = g / 255
          shapeData.node.color.z = b / 255
          store.setState({ ...uiStore })
        }}
      />
    </ShapeProp>

    <ShapeProp label='Combine Mode'>
      <div className="shape-prop-point3">
        <ButtonInput
          label='Union'
          icon={UnionIcon}
          isSelected={true}
          type='union'
          onClick={(type: string) => console.log('Selected ', type)}
        />
        <ButtonInput
          label='Intersect'
          icon={IntersectionIcon}
          isSelected={false}
          type='intersect'
          onClick={(type: string) => console.log('Selected ', type)}
        />
        <ButtonInput
          label='Difference'
          icon={DifferenceIcon}
          isSelected={false}
          type='difference'
          onClick={(type: string) => console.log('Selected ', type)}
        />
      </div>
    </ShapeProp>

    <ShapeProp label='Roundness'>
      <RangeInput
        labelColor='#0060ac'
        range={{ min: 0, max: 100 }}
        value={50}
        onValueChange={(value) => console.log('Roundness ', value)}
      />
    </ShapeProp>
  </div>
}

export default ShapeProperties