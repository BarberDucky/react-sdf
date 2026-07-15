import { Group, ShapeTreeNode } from "../model/shape-tree";
import { DataTextureVisitor } from "./data-texture-visitor";

export function generateShaderTextures(root: Group, shapeCount: number) {

  const dataTextureVisitor = new DataTextureVisitor()

  const stack: Array<{ node: ShapeTreeNode, visited: boolean }> = []
  let resPosition = 0
  const res = new Float32Array(4 * 4 * shapeCount)

  const debugRes: string[] = []

  if (shapeCount == 0) { return res }

  stack.push({ node: root, visited: false })

  while (stack.length > 0) {
    const curr = stack.pop()!

    if (curr.visited) {
      res.set(curr.node.accept(dataTextureVisitor), 16 * resPosition)
      resPosition++

      debugRes.push(`${curr.node.type}, ${curr.node.id}`)
    } else {
      stack.push({ node: curr.node, visited: true })
      if (curr.node instanceof Group) {
        curr.node.nodes.forEach(n => stack.push({ node: n, visited: false }))
      }
    }
  }

  // console.log(debugRes)
  return res
}