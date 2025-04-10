import { Point3 } from "../utils"
import { AbstractUiBindings } from "./bindings"

export class Ui {

  constructor(
    root: HTMLElement,
    private readonly _bindings: AbstractUiBindings,
  ) {
    this.createAddSphereForm(root, _bindings.createSphere)
    this.createAddBoxForm(root, _bindings.createBox)
  }

  createAddSphereForm(
    root: HTMLElement,
    onSubmit: (
      position: Point3,
      radius: number,
      color: Point3,
    ) => void
  ): void {
    const form = document.createElement('form')
    form.style.position = 'absolute'
    form.style.top = '0'
    form.style.width = '300px'
    form.style.height = 'fit-content'
    form.style.overflowX = 'hidden'
    form.style.overflowY = 'hidden'

    const xInput = document.createElement('input')
    xInput.type = 'number'
    xInput.step = 'any'
    xInput.placeholder = 'X'
    xInput.name = 'x'
    xInput.style.marginRight = '8px'
    xInput.style.height = '30px'

    const yInput = document.createElement('input')
    yInput.type = 'number'
    yInput.step = 'any'
    yInput.placeholder = 'Y'
    yInput.name = 'y'
    yInput.style.marginRight = '8px'
    yInput.style.height = '30px'

    const zInput = document.createElement('input')
    zInput.type = 'number'
    zInput.step = 'any'
    zInput.placeholder = 'Z'
    zInput.name = 'z'
    zInput.style.marginRight = '8px'
    zInput.style.height = '30px'

    const radiusInput = document.createElement('input')
    radiusInput.type = 'number'
    radiusInput.step = 'any'
    radiusInput.placeholder = 'Radius'
    radiusInput.name = 'radius'
    radiusInput.style.marginRight = '8px'
    radiusInput.style.height = '30px'

    const colorInput = document.createElement('input')
    colorInput.type = 'color'
    colorInput.name = 'color'
    colorInput.value = '#ff0000'
    colorInput.style.marginRight = '8px'
    colorInput.style.height = '30px'

    const submitButton = document.createElement('button')
    submitButton.type = 'submit'
    submitButton.textContent = 'Submit'
    submitButton.style.height = '30px'

    form.appendChild(xInput)
    form.appendChild(yInput)
    form.appendChild(zInput)
    form.appendChild(radiusInput)
    form.appendChild(colorInput)
    form.appendChild(submitButton)

    form.addEventListener('submit', (event) => {
      event.preventDefault()
      const x = parseFloat(xInput.value) || 0
      const y = parseFloat(yInput.value) || 0
      const z = parseFloat(zInput.value) || 0
      const radius = parseFloat(radiusInput.value) || 0
      const colorValue = colorInput.value
      const rHex = colorValue.slice(1, 3)
      const gHex = colorValue.slice(3, 5)
      const bHex = colorValue.slice(5, 7)
      const r = parseInt(rHex, 16) / 255
      const g = parseInt(gHex, 16) / 255
      const b = parseInt(bHex, 16) / 255
      form.reset()
      onSubmit({ x, y, z }, radius, { x: r, y: g, z: b })
    })

    root.appendChild(form)
  }

  createAddBoxForm(
    root: HTMLElement,
    onSubmit: (
      position: Point3,
      dimensions: Point3,
      color: Point3,
    ) => void
  ): void {
    const form = document.createElement('form')
    form.style.position = 'absolute'
    form.style.top = '300px'
    form.style.width = '300px'
    form.style.height = 'fit-content'
    form.style.overflowX = 'hidden'
    form.style.overflowY = 'hidden'

    const xInput = document.createElement('input')
    xInput.type = 'number'
    xInput.step = 'any'
    xInput.placeholder = 'X'
    xInput.name = 'xBox'
    xInput.style.marginRight = '8px'
    xInput.style.height = '30px'

    const yInput = document.createElement('input')
    yInput.type = 'number'
    yInput.step = 'any'
    yInput.placeholder = 'Y'
    yInput.name = 'yBox'
    yInput.style.marginRight = '8px'
    yInput.style.height = '30px'

    const zInput = document.createElement('input')
    zInput.type = 'number'
    zInput.step = 'any'
    zInput.placeholder = 'Z'
    zInput.name = 'zBox'
    zInput.style.marginRight = '8px'
    zInput.style.height = '30px'

    const widthInput = document.createElement('input')
    widthInput.type = 'number'
    widthInput.step = 'any'
    widthInput.placeholder = 'Width'
    widthInput.name = 'width'
    widthInput.style.marginRight = '8px'
    widthInput.style.height = '30px'

    const heightInput = document.createElement('input')
    heightInput.type = 'number'
    heightInput.step = 'any'
    heightInput.placeholder = 'Height'
    heightInput.name = 'height'
    heightInput.style.marginRight = '8px'
    heightInput.style.height = '30px'

    const breadthInput = document.createElement('input')
    breadthInput.type = 'number'
    breadthInput.step = 'any'
    breadthInput.placeholder = 'Breadth'
    breadthInput.name = 'Breadth'
    breadthInput.style.marginRight = '8px'
    breadthInput.style.height = '30px'

    const colorInput = document.createElement('input')
    colorInput.type = 'color'
    colorInput.name = 'colorBox'
    colorInput.value = '#ff0000'
    colorInput.style.marginRight = '8px'
    colorInput.style.height = '30px'

    const submitButton = document.createElement('button')
    submitButton.type = 'submit'
    submitButton.textContent = 'Submit'
    submitButton.style.height = '30px'

    form.appendChild(xInput)
    form.appendChild(yInput)
    form.appendChild(zInput)
    form.appendChild(widthInput)
    form.appendChild(heightInput)
    form.appendChild(breadthInput)
    form.appendChild(colorInput)
    form.appendChild(submitButton)

    form.addEventListener('submit', (event) => {
      event.preventDefault()
      const x = parseFloat(xInput.value) || 0
      const y = parseFloat(yInput.value) || 0
      const z = parseFloat(zInput.value) || 0
      const width = parseFloat(widthInput.value) || 0
      const height = parseFloat(heightInput.value) || 0
      const breadth = parseFloat(breadthInput.value) || 0
      const colorValue = colorInput.value
      const rHex = colorValue.slice(1, 3)
      const gHex = colorValue.slice(3, 5)
      const bHex = colorValue.slice(5, 7)
      const r = parseInt(rHex, 16) / 255
      const g = parseInt(gHex, 16) / 255
      const b = parseInt(bHex, 16) / 255
      form.reset()
      onSubmit(
        { x, y, z }, 
        { x: width, y: height, z: breadth }, 
        { x: r, y: g, z: b },
      )
    })

    root.appendChild(form)
  }

}