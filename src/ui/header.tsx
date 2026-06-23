import './header.css'

const Header = (props: {
  gizmoActive: boolean,
  onGizmoToggle: () => void
}) => {
  return (
    <header>
      <h1 className="header-title">React SDF Renderer</h1>
      <div className='gizmo-button-container'>
        <button
          className={`gizmo-button ${props.gizmoActive ? 'gizmo-selected' : ''}`}
          onClick={props.onGizmoToggle}
        >
          Gizmo
        </button>
      </div>
    </header>
  )
}

export default Header