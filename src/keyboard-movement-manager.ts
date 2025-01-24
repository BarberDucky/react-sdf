import { Point3 } from "./utils"

type Movements =
  'Forward' |
  'Backward' |
  'Left' |
  'Right' |
  'Up' |
  'Down'

export default class KeyboardMovementManager {

  private readonly KEY_TO_MOVEMENT_MAP: Record<string, Movements | undefined> = {
    ['w']: 'Forward',
    ['W']: 'Forward',
    ['ArrowUp']: 'Forward',

    ['s']: 'Backward',
    ['S']: 'Backward',
    ['ArrowDown']: 'Backward',

    ['a']: 'Left',
    ['A']: 'Left',
    ['ArrowLeft']: 'Left',

    ['d']: 'Right',
    ['D']: 'Right',
    ['ArrowRight']: 'Right',

    [' ']: 'Up',

    ['Shift']: 'Down',
  }

  private readonly MOVEMENT_TO_VECTOR_MAP: Record<Movements, Point3> = {
    ['Forward']: { x: 0, y: 0, z: 1 },
    ['Backward']: { x: 0, y: 0, z: -1 },
    ['Left']: { x: -1, y: 0, z: 0 },
    ['Right']: { x: 1, y: 0, z: 0 },
    ['Up']: { x: 0, y: 1, z: 0 },
    ['Down']: { x: 0, y: -1, z: 0 },
  }

  private activeMovements: Record<Movements, boolean> = {
    ['Forward']: false,
    ['Backward']: false,
    ['Left']: false,
    ['Right']: false,
    ['Up']: false,
    ['Down']: false,
  }

  public constructor() {
    document.addEventListener('keydown', e => {
      const pressedKey = this.KEY_TO_MOVEMENT_MAP[e.key]

      if (pressedKey == null) { return }

      this.activeMovements[pressedKey] = true
    })

    document.addEventListener('keyup', e => {
      const pressedKey = this.KEY_TO_MOVEMENT_MAP[e.key]

      if (pressedKey == null) { return }

      this.activeMovements[pressedKey] = false
    })

    window.addEventListener('blur', () => {
      for (let movement in this.activeMovements) {
        this.activeMovements[movement as Movements] = false
      }
    })

    window.addEventListener('contextmenu', () => {
      for (let movement in this.activeMovements) {
        this.activeMovements[movement as Movements] = false
      }
    })
  }

  public getCurrentDirectionVector(): Point3 {
    let directionVector = { x: 0, y: 0, z: 0 }

    for (const movement in this.MOVEMENT_TO_VECTOR_MAP) {
      if (this.activeMovements[movement as Movements]) {
        const movementVector = this.MOVEMENT_TO_VECTOR_MAP[movement as Movements]
        directionVector = {
          x: directionVector.x + movementVector.x,
          y: directionVector.y + movementVector.y,
          z: directionVector.z + movementVector.z,
        }
      }
    }

    return directionVector
  }

}