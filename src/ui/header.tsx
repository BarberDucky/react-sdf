import { useSyncExternalStore } from 'react'
import { store } from '../main'
import './header.css'

const Header = () => {

  const uiStore = useSyncExternalStore(store.subscribe, store.getState)

  return (
    <header>
      <h1 className="header-title">React SDF Renderer</h1>
      <div className='gizmo-button-container'>
        <button
          className={`gizmo-button ${uiStore.isGizmoEnabled ? 'gizmo-selected' : ''}`}
          onClick={() => {
            store.setState({
              ...uiStore,
              isGizmoEnabled: !uiStore.isGizmoEnabled,
            })
          }}
        >
          Gizmo
        </button>
      </div>
    </header>
  )
}

export default Header