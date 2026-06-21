import { CubeIcon, ShapeIconType, SphereIcon } from '../../assets/icons'
import { UiShape } from '../ui'
import './button.css'

const SHAPE_TYPE_TO_LABEL_MAP: Record<UiShape, { label: string, icon: ShapeIconType }> = {
  sphere: { label: 'Sphere', icon: SphereIcon },
  box: { label: 'Box', icon: CubeIcon },
}

export function ShapeSelectButton(props: {
  shape: UiShape,
  isSelected: boolean,
  onClick: (shape: UiShape) => void,
}) {

  return (<button
    key={SHAPE_TYPE_TO_LABEL_MAP[props.shape].label}
    onClick={() => props.onClick(props.shape)}
    className={`shape-button ${props.isSelected ? 'shape-button-selected' : ''}`}
  >
    {SHAPE_TYPE_TO_LABEL_MAP[props.shape].icon({ width: 32, height: 32 })}
    <span>{SHAPE_TYPE_TO_LABEL_MAP[props.shape].label}</span>
  </button>)
}