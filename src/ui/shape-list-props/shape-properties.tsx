import ColorInput from '../inputs/color-input'
import NumberInput from '../inputs/number-input'
import RangeInput from '../inputs/range-input'
import './shape-properties.css'

export type InputType = 'number' | 'color' | 'point2' | 'point3'

const ShapeProperties = (props: {
  id: string,
  type: string,
  currentValue: number,
  handleChange: (value: number) => void
}) => {

  return <div className="shape-properties">
    {props.id}
    <br />
    {props.type}
    <NumberInput
      label='Y'
      labelColor='#a43073'
      value={props.currentValue}
      onValueChange={(value) => props.handleChange(value)}
    />
    <RangeInput
      labelColor='#0060ac'
      range={{ min: 0, max: 100 }}
      value={50}
      onValueChange={(value) => props.handleChange(value)}
    />
    <ColorInput
      value='#ff0000'
      onValueChange={(value) => console.log('Color changed to', value)}
    />
  </div>
}

export default ShapeProperties