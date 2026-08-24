import { Point2 } from './utils'

export enum MouseDragEvent {
  Start,
  Move,
  End,
}

export default class MouseMovementManager {

  private targetElement: HTMLElement

  private isDragging = false
  private dragStarted = false
  private dragOrigin: Point2 | null = null
  private clickOrigin: Point2 | null = null

  private moveCallbacks: Array<(origin: Point2, current: Point2, deltaMove: Point2, eventType: MouseDragEvent) => void> = []
  private wheelCallbacks: Array<(deltaWheel: number) => void> = []
  private clickCallbacks: Array<(position: Point2) => void> = []

  public constructor(targetElement: HTMLElement) {
    this.targetElement = targetElement

    this.targetElement.addEventListener('pointerdown', e => {
      this.isDragging = true
      this.dragOrigin = { x: e.clientX, y: e.clientY }
      this.clickOrigin = { x: e.clientX, y: e.clientY }
    })

    this.targetElement.addEventListener('pointerup', e => {
      if (this.clickOrigin != null && this.isDragging && this.dragOrigin != null) {
        const distance = Math.sqrt(
          Math.pow(this.clickOrigin.x - e.clientX, 2) +
          Math.pow(this.clickOrigin.y - e.clientY, 2),
        )

        if (distance < 1) {
          for (const fn of this.clickCallbacks) {
            fn(this.clickOrigin)
          }
        } else {
          const origin = this.clickOrigin!
          const delta = {
            x: this.dragOrigin.x - e.clientX,
            y: e.clientY - this.dragOrigin.y,
          }

          this.dragOrigin = { x: e.clientX, y: e.clientY }

          for (const fn of this.moveCallbacks) {
            fn(origin, this.dragOrigin, delta, MouseDragEvent.End)
            this.dragStarted = false
          }
        }
      }

      this.isDragging = false
      this.dragOrigin = null
      this.clickOrigin = null
    })

    this.targetElement.addEventListener('pointermove', e => {
      if (this.isDragging && this.dragOrigin != null) {
        const origin = this.clickOrigin!
        const delta = {
          x: this.dragOrigin.x - e.clientX,
          y: e.clientY - this.dragOrigin.y,
        }

        this.dragOrigin = { x: e.clientX, y: e.clientY }

        for (const fn of this.moveCallbacks) {
          if (this.dragStarted) {
            fn(origin, this.dragOrigin, delta, MouseDragEvent.Move)
          } else {
            fn(origin, this.dragOrigin, delta, MouseDragEvent.Start)
            this.dragStarted = true
          }
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

  public addMoveCallback(fn: (origin: Point2, current: Point2, deltaMove: Point2, eventType: MouseDragEvent) => void) {
    this.moveCallbacks.push(fn)
  }

  public addWheelCallback(fn: (deltaWheel: number) => void) {
    this.wheelCallbacks.push(fn)
  }

  public addClickCallback(fn: (position: Point2) => void) {
    this.clickCallbacks.push(fn)
  }
}