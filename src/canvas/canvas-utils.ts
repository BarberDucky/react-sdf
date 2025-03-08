export function initializeCanvas(canvasId: string) {
  const canvas = document.querySelector<HTMLCanvasElement>(canvasId)

  if (canvas == null) {
    throw new Error(`Supplied canvas doesn't exist.`)
  }

  return canvas
}

export function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
  const displayWidth = canvas.clientWidth
  const displayHeight = canvas.clientHeight

  const needResize =
    canvas.width !== displayWidth ||
    canvas.height !== displayHeight

  if (needResize) {
    canvas.width = displayWidth
    canvas.height = displayHeight
  }

  return needResize
}