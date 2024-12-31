import { canvasSetup } from './canvas'
import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <canvas id="mainCanvas" />
`
canvasSetup(document.querySelector<HTMLCanvasElement>('#mainCanvas'))