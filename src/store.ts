export class Store<T> {
  private state: T
  private listeners: Array<(state: T) => void> = []

  constructor(initialState: T) {
    this.state = initialState
  }

  getState = (): T => {
    return this.state
  }

  setState = (newState: T) => {
    this.state = newState
    this.updateListeners()
  }

  subscribe = (listener: (state: T) => void): () => void => {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l != listener)
    }
  }

  private updateListeners() {
    for (let listener of this.listeners) {
      listener(this.state)
    }
  }
}