export abstract class AbstractUiBindings {

  abstract setActiveShape(
    shape: 'sphere' | 'box' | null,
  ): void

  abstract toggleGizmo(): void

}