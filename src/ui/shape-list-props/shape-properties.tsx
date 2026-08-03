import { useSyncExternalStore } from 'react'
import { DifferenceIcon, IntersectionIcon, UnionIcon } from '../../assets/icons'
import ButtonInput from '../inputs/button-input'
import ColorInput from '../inputs/color-input'
import NumberInput from '../inputs/number-input'
import RangeInput from '../inputs/range-input'
import ShapeProp from './shape-prop'
import './shape-properties.css'
import { store } from '../../main'
import { Operation, Shape } from '../../model/shape-tree'
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

  function handleRotationChange(axis: 'x' | 'y' | 'z', value: number) {
    if (Number.isNaN(value)) return
    if (!(shapeData?.node instanceof Shape)) return
    shapeData.node.rotation[axis] = value
    store.setState({ ...uiStore })
  }

  function handleCombineModeChange(operation: Operation['type']) {
    if (!(shapeData?.node instanceof Shape)) return
    shapeData.node.operation.type = operation
    store.setState({ ...uiStore })
  }

  if (shapeData == null || !(shapeData.node instanceof Shape)) {
    return null
  }

  return <div className="shape-properties">
    <ShapeProp label="Position">
      <div className="shape-prop-point3">
        <NumberInput
          label="X"
          labelColor="#6d5e00"
          value={shapeData.node.position.x}
          onValueChange={(value) => {
            handlePositionChange('x', value)
          }}
        />
        <NumberInput
          label="Y"
          labelColor="#a43073"
          value={shapeData.node.position.y}
          onValueChange={(value) => {
            handlePositionChange('y', value)
          }}
        />
        <NumberInput
          label="Z"
          labelColor="#0060ac"
          value={shapeData.node.position.z}
          onValueChange={(value) => {
            handlePositionChange('z', value)
          }}
        />
      </div>
    </ShapeProp>

    <ShapeProp label="Rotation">
      <div className="shape-prop-point3">
        <NumberInput
          label="X"
          labelColor="#6d5e00"
          value={shapeData.node.rotation.x}
          onValueChange={(value) => {
            handleRotationChange('x', value)
          }}
        />
        <NumberInput
          label="Y"
          labelColor="#a43073"
          value={shapeData.node.rotation.y}
          onValueChange={(value) => {
            handleRotationChange('y', value)
          }}
        />
        <NumberInput
          label="Z"
          labelColor="#0060ac"
          value={shapeData.node.rotation.z}
          onValueChange={(value) => {
            handleRotationChange('z', value)
          }}
        />
      </div>
    </ShapeProp>

    <ShapeProp label="Scale">
      <RangeInput
        labelColor="#0060ac"
        range={{ min: 0.1, max: 10 }}
        step={0.1}
        value={shapeData.node.scale}
        onValueChange={(value) => {
          if (!(shapeData?.node instanceof Shape)) return
          shapeData.node.scale = value
          store.setState({ ...uiStore })
        }}
      />
    </ShapeProp>

    <ShapeProp label="Material">
      <ColorInput
        value={`rgb(${shapeData.node.color.x * 255}, ${shapeData.node.color.y * 255}, ${shapeData.node.color.z * 255})`}
        onValueChange={(value) => {
          const { r, g, b } = hexToRgb(value)
          if (!(shapeData?.node instanceof Shape)) return
          shapeData.node.color.x = r / 255
          shapeData.node.color.y = g / 255
          shapeData.node.color.z = b / 255
          store.setState({ ...uiStore })
        }}
      />
    </ShapeProp>

    <ShapeProp label="Combine Mode">
      <div className="shape-prop-point3">
        <ButtonInput
          label="Union"
          icon={UnionIcon}
          isSelected={shapeData.node.operation.type == 'union'}
          type="union"
          onClick={() => handleCombineModeChange('union')}
        />
        <ButtonInput
          label="Intersect"
          icon={IntersectionIcon}
          isSelected={shapeData.node.operation.type == 'intersection'}
          type="intersect"
          onClick={() => handleCombineModeChange('intersection')}
        />
        <ButtonInput
          label="Difference"
          icon={DifferenceIcon}
          isSelected={shapeData.node.operation.type == 'difference'}
          type="difference"
          onClick={() => handleCombineModeChange('difference')}
        />
      </div>
    </ShapeProp>

    <ShapeProp label="Combine Intensity">
      <RangeInput
        labelColor="#0060ac"
        step={0.05}
        range={{ min: 0, max: 2 }}
        value={shapeData.node.operation.smoothness ?? 0}
        onValueChange={(value) => {
          if (!(shapeData?.node instanceof Shape)) return
          shapeData.node.operation.smoothness = value
          store.setState({ ...uiStore })
        }}
      />
    </ShapeProp>

    <ShapeProp label="Roundness">
      <RangeInput
        labelColor="#0060ac"
        range={{ min: 0, max: 100 }}
        step={1}
        value={shapeData.node.roundness}
        onValueChange={(value) => {
          if (!(shapeData?.node instanceof Shape)) return
          shapeData.node.roundness = value
          store.setState({ ...uiStore })
        }}
      />
    </ShapeProp>
  </div>
}

export default ShapeProperties