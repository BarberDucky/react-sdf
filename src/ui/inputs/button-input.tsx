import { SetIconType } from '../../assets/icons'
import './button-input.css'

function ButtonInput<T>(props: {
  type: T
	label: string,
	icon: SetIconType,
  isSelected: boolean,
  onClick: (type: T) => void,
}) {

  return (<button
    onClick={() => props.onClick(props.type)}
    className={`button-input ${props.isSelected ? 'button-input-selected' : ''}`}
  >
    {props.icon({ width: 32, height: 32 })}
    <span>{props.label}</span>
  </button>)
}

export default ButtonInput