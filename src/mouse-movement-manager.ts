import { Point2 } from "./utils"

export default class MouseMovementManager {

  private isDragging = false
  private dragStart: Point2 | null = null

  private callbacks: Array<(deltaMove: Point2) => void> = []

  public constructor() {
    document.addEventListener('pointerdown', e => {
      this.isDragging = true
      this.dragStart = { x: e.clientX, y: e.clientY }
    })

    document.addEventListener('pointerup', () => {
      this.isDragging = false
      this.dragStart = null
    })

    document.addEventListener('pointermove', e => {
      if (this.isDragging && this.dragStart != null) {
        const delta = {
          x: this.dragStart.x - e.clientX,
          y: e.clientY - this.dragStart.y,
        }

        this.dragStart = { x: e.clientX, y: e.clientY }

        for (const fn of this.callbacks) {
          fn(delta)
        }
      }
    })

    window.addEventListener('blur', () => {
      this.isDragging = false
    })

    window.addEventListener('contextmenu', () => {
      this.isDragging = false
    })
  }

  public addCallback(fn: (deltaMove: Point2) => void) {
    this.callbacks.push(fn)
  }
}