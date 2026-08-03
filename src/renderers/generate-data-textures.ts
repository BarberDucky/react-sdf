import { Group, ShapeTreeNode } from '../model/shape-tree'
import { DataTextureVisitor } from './data-texture-visitor'
import { DATA_TEXT_ROW_SIZE, TEXEL_COUNT } from './consts.ts'

export function generateTreeShaderTextures(root: Group, shapeCount: number) {

  const dataTextureVisitor = new DataTextureVisitor()

  const stack: Array<{ node: ShapeTreeNode, visited: boolean }> = []
  let resPosition = 0
  const res = new Float32Array(DATA_TEXT_ROW_SIZE * TEXEL_COUNT * shapeCount)

  if (shapeCount == 0) { return res }

  stack.push({ node: root, visited: false })

  while (stack.length > 0) {
    const curr = stack.pop()!

    if (curr.visited) {
      res.set(curr.node.accept(dataTextureVisitor), DATA_TEXT_ROW_SIZE * TEXEL_COUNT * resPosition)
      resPosition++

    } else {
      stack.push({ node: curr.node, visited: true })
      if (curr.node instanceof Group) {
        curr.node.nodes.forEach(n => stack.push({ node: n, visited: false }))
      }
    }
  }

  return res
}

export function generateListShaderTextures(root: Group, shapeCount: number) {

  const dataTextureVisitor = new DataTextureVisitor()

  const queue: Array<{ depth: number, node: ShapeTreeNode }> = [{ depth: 0, node: root }]
  const res = new Float32Array(DATA_TEXT_ROW_SIZE * TEXEL_COUNT * shapeCount)
  let resPosition = 0

  while (queue.length > 0) {
    const curr = queue.pop()!
    res.set(curr.node.accept(dataTextureVisitor), DATA_TEXT_ROW_SIZE * TEXEL_COUNT * resPosition)
    resPosition++

    if (curr.node instanceof Group) {
      for (let i = curr.node.nodes.length - 1; i >= 0; i--) {
        queue.push({
          node: curr.node.nodes[i],
          depth: curr.depth + 1,
        })
      }
    }
  }

  return res
}