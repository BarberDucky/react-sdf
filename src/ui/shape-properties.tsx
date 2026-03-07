import { useState } from 'react'
import './shape-properties.css'

export type InputType = 'number' | 'color' | 'point2' | 'point3'

const NumberInput = (props: {
  name: string,
  value: number,
  onChange: (value: number) => void,
}) => {
  return (
    <div>
      <span>{props.name}</span>
      <input
        type="number"
        step={0.1}
        onChange={(e) => props.onChange(Number.parseFloat(e.target.value))} />
    </div>
  )
}

const ShapeProperties = (props: {
  id: string,
  type: string,
  currentValue: number,
  handleChange: (value: number) => void
}) => {

  return <div className="shape-properties">
    {props.id}
    <br/>
    {props.type}
    <NumberInput
      name="height"
      value={props.currentValue}
      onChange={(value) => props.handleChange(value)}
    />
  </div>
}

export default ShapeProperties