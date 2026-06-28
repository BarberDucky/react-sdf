import ShapeSelect from "./shape-select/shape-select"
import Header from "./header"
import './ui.css'
import ShapeListProps from "./shape-list-props/shape-list-props"

export type UiShape = 'sphere' | 'box'

const Ui = () => {
  return <div className="ui">
    <Header />
    <div className="ui-main">
      <ShapeSelect />
      <ShapeListProps />
    </div>
  </div>
}

export default Ui