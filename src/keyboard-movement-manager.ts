import { vec3 } from "./utils"

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

  private readonly MOVEMENT_TO_VECTOR_MAP: Record<Movements, vec3> = {
    ['Forward']: [0, 0, 1],
    ['Backward']: [0, 0, -1],
    ['Left']: [-1, 0, 0],
    ['Right']: [1, 0, 0],
    ['Up']: [0, 1, 0],
    ['Down']: [0, -1, 0],
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

  public getCurrentDirectionVector(): vec3 {
    let directionVector: vec3 = [0, 0, 0]

    for (const movement in this.MOVEMENT_TO_VECTOR_MAP) {
      if (this.activeMovements[movement as Movements]) {
        const movementVector = this.MOVEMENT_TO_VECTOR_MAP[movement as Movements]
        directionVector = directionVector.map((value, index) => value + movementVector[index]) as vec3
      }
    }

    return directionVector
  }

}