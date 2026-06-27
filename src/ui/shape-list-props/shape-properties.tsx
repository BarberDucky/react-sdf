import { UnionIcon, IntersectionIcon, DifferenceIcon } from '../../assets/icons'
import ButtonInput from '../inputs/button-input'
import ColorInput from '../inputs/color-input'
import NumberInput from '../inputs/number-input'
import RangeInput from '../inputs/range-input'
import ShapeProp from './shape-prop'
import './shape-properties.css'

export type InputType = 'number' | 'color' | 'point2' | 'point3'

const ShapeProperties = (props: {
  id: string,
  type: string,
  currentValue: number,
  handleChange: (value: number) => void
}) => {

  return <div className="shape-properties">
    <ShapeProp label='Position'>
      <div className="shape-prop-point3">
        <NumberInput
          label='X'
          labelColor='#6d5e00'
          value={props.currentValue}
          onValueChange={(value) => props.handleChange(value)}
        />
        <NumberInput
          label='Y'
          labelColor='#a43073'
          value={props.currentValue}
          onValueChange={(value) => props.handleChange(value)}
        />
        <NumberInput
          label='Z'
          labelColor='#0060ac'
          value={props.currentValue}
          onValueChange={(value) => props.handleChange(value)}
        />
      </div>
    </ShapeProp>

    <ShapeProp label='Rotation'>
      <div className="shape-prop-point3">
        <NumberInput
          label='X'
          labelColor='#6d5e00'
          value={props.currentValue}
          onValueChange={(value) => props.handleChange(value)}
        />
        <NumberInput
          label='Y'
          labelColor='#a43073'
          value={props.currentValue}
          onValueChange={(value) => props.handleChange(value)}
        />
        <NumberInput
          label='Z'
          labelColor='#0060ac'
          value={props.currentValue}
          onValueChange={(value) => props.handleChange(value)}
        />
      </div>
    </ShapeProp>

    <ShapeProp label='Scale'>
      <div className="shape-prop-point3">
        <NumberInput
          label='X'
          labelColor='#6d5e00'
          value={props.currentValue}
          onValueChange={(value) => props.handleChange(value)}
        />
        <NumberInput
          label='Y'
          labelColor='#a43073'
          value={props.currentValue}
          onValueChange={(value) => props.handleChange(value)}
        />
        <NumberInput
          label='Z'
          labelColor='#0060ac'
          value={props.currentValue}
          onValueChange={(value) => props.handleChange(value)}
        />
      </div>
    </ShapeProp>

    <ShapeProp label='Material'>
      <ColorInput
        value='#ff0000'
        onValueChange={(value) => console.log('Color changed to', value)}
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
        onValueChange={(value) => props.handleChange(value)}
      />
    </ShapeProp>
  </div>
}

export default ShapeProperties