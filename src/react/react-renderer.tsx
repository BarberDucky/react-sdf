import ReactReconciler from "react-reconciler";
import { HostConfig } from "./reconciler";
import { ShapeController } from "../model/shape-controller";
import React from "react";

export class SDFReactCanvas {

  private reconciler = ReactReconciler(HostConfig)

  constructor (
    private shapeController: ShapeController
  ) {}

  render(scene: React.ReactNode) {

    console.log(scene)

    const container = this.reconciler.createContainer(
      this.shapeController, 
      1,
      null,
      false,
      null,
      'sdf-canvas',
      (e) => { console.log(e) },
      null,
    )
    this.reconciler.updateContainer(scene, container)
  }

} 