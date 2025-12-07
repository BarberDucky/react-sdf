import ReactReconciler from "react-reconciler";
import { DefaultEventPriority } from "react-reconciler/constants"
import { ShapeController } from "../model/shape-controller";
import { Point3 } from "../utils";
import { Operation, ShapeTreeNode } from "../model/shape-tree";

type SdfSphere = {
  type: 'sphere'
  position: Point3
  color: Point3
  radius: number
}

type SdfBox = {
  type: 'box'
  position: Point3
  color: Point3
  dimensions: Point3
}

type SdfUnion = {
  type: 'union'
  children: any[]
}

type SdfSmoothUnion = {
  type: 'smoothUnion'
  smoothness: number
  children: any[]
}

type SDFElements =
  | SdfSphere
  | SdfBox
  | SdfUnion
  | SdfSmoothUnion

export type SDFElementsObject = {
  [K in Type]: Omit<Extract<SDFElements, { type: K }>, 'type'>
}

type Type = SDFElements['type']
type Props = SDFElements
type Container = ShapeController
type Instance = ShapeTreeNode
type TextInstance = {}
type SuspenseInstance = {}
type HydratableInstance = {}
type PublicInstance = ShapeTreeNode
type HostContext = {}
type UpdatePayload = Props
type ChildSet = {}
type TimeoutHandle = {}
type NoTimeout = {}

export const HostConfig: ReactReconciler.HostConfig<
  Type,
  Props,
  Container,
  Instance,
  TextInstance,
  SuspenseInstance,
  HydratableInstance,
  PublicInstance,
  HostContext,
  UpdatePayload,
  ChildSet,
  TimeoutHandle,
  NoTimeout
> = {
  supportsMutation: true,
  supportsPersistence: false,
  createInstance: function (type: Type, props: Props, rootContainer: Container): Instance {

    console.log(type, props);

    switch (type) {
      case 'sphere':
        const s = props as Omit<SdfSphere, 'type'>
        return rootContainer.addSphere(s.position, s.radius, s.color);
      case 'box':
        const b = props as Omit<SdfBox, 'type'>
        return rootContainer.addBox(b.position, b.dimensions, b.color);
      case 'union':
        return rootContainer.addUnion();
      case 'smoothUnion':
        const su = props as Omit<SdfSmoothUnion, 'type'>
        return rootContainer.addSmoothUnion(su.smoothness);
      default:
        throw new Error(`No instance of type ${type} can be created.`);
    }

  },
  createTextInstance: function (): TextInstance {
    throw new Error("Function 'createTextInstance' not implemented.");
  },
  appendInitialChild: function (parentInstance: Instance, child: Instance): void {
    if (parentInstance instanceof Operation) {
      parentInstance.addNodes(child);
    }
    return;
  },
  finalizeInitialChildren: function (): boolean {
    return false;
  },
  prepareUpdate: function (instance: Instance, type: Type, oldProps: Props, newProps: Props): UpdatePayload | null {
    return newProps;
  },
  shouldSetTextContent: function (): boolean {
    return false;
  },
  getRootHostContext: function (): HostContext | null {
    return null;
  },
  getChildHostContext: function (parentHostContext: HostContext): HostContext {
    return parentHostContext;
  },
  getPublicInstance: function (instance: Instance): PublicInstance {
    return instance;
  },
  prepareForCommit: function (): Record<string, any> | null {
    return null;
  },
  resetAfterCommit: function (): void {
    return;
  },
  preparePortalMount: function (): void {
    return;
  },
  scheduleTimeout: function (fn: (...args: unknown[]) => unknown, delay?: number): TimeoutHandle {
    throw new Error("Function not implemented.");
  },
  cancelTimeout: function (id: TimeoutHandle): void {
    throw new Error("Function not implemented.");
  },
  noTimeout: -1,
  isPrimaryRenderer: false,
  getCurrentEventPriority: function (): ReactReconciler.Lane {
    return DefaultEventPriority;
  },
  supportsHydration: false,
  getInstanceFromNode: function (node: any): ReactReconciler.Fiber | null | undefined {
    throw new Error("Function not implemented.");
  },
  beforeActiveInstanceBlur: function (): void {
    throw new Error("Function not implemented.");
  },
  afterActiveInstanceBlur: function (): void {
    throw new Error("Function not implemented.");
  },
  prepareScopeUpdate: function (scopeInstance: any, instance: any): void {
    throw new Error("Function not implemented.");
  },
  getInstanceFromScope: function (scopeInstance: any): ShapeTreeNode | null {
    throw new Error("Function not implemented.");
  },
  detachDeletedInstance: function (node: ShapeTreeNode): void {
    throw new Error("Function not implemented.");
  }
}