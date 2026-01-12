import { Point2 } from "./utils"

export default class MouseMovementManager {

  private targetElement: HTMLElement

  private isDragging = false
  private dragStart: Point2 | null = null
  private clickStart: Point2 | null = null

  private moveCallbacks: Array<(deltaMove: Point2) => void> = []
  private wheelCallbacks: Array<(deltaWheel: number) => void> = []
  private clickCallbacks: Array<(position: Point2) => void> = []

  public constructor(targetElement: HTMLElement) {
    this.targetElement = targetElement

    this.targetElement.addEventListener('pointerdown', e => {
      this.isDragging = true
      this.dragStart = { x: e.clientX, y: e.clientY }
      this.clickStart = { x: e.clientX, y: e.clientY }
    })

    this.targetElement.addEventListener('pointerup', e => {
      if (this.clickStart != null) {
        const distance = Math.sqrt(
          Math.pow(this.clickStart.x - e.clientX, 2) +
          Math.pow(this.clickStart.y - e.clientY, 2)
        )
        
        if (distance < 1) {
          for (const fn of this.clickCallbacks) {
            fn(this.clickStart)
          }
        }
      }

      this.isDragging = false
      this.dragStart = null
      this.clickStart = null
    })

    this.targetElement.addEventListener('pointermove', e => {
      if (this.isDragging && this.dragStart != null) {
        const delta = {
          x: this.dragStart.x - e.clientX,
          y: e.clientY - this.dragStart.y,
        }

        this.dragStart = { x: e.clientX, y: e.clientY }

        for (const fn of this.moveCallbacks) {
          fn(delta)
        }
      }
    })

    this.targetElement.addEventListener('wheel', e => {
      for (const fn of this.wheelCallbacks) {
        fn(e.deltaY)
      }
    })

    this.targetElement.addEventListener('blur', () => {
      this.isDragging = false
    })

    this.targetElement.addEventListener('contextmenu', () => {
      this.isDragging = false
    })
  }

  public addMoveCallback(fn: (deltaMove: Point2) => void) {
    this.moveCallbacks.push(fn)
  }

  public addWheelCallback(fn: (deltaWheel: number) => void) {
    this.wheelCallbacks.push(fn)
  }

  public addClickCallback(fn: (position: Point2) => void) {
    this.clickCallbacks.push(fn)
  }
}