import { Component, type ReactNode } from 'react'

interface Props {
  fallback: ReactNode
  children: ReactNode
}

interface State {
  failed: boolean
}

/**
 * A malformed or unsupported GLB must never take the page down: if the model
 * throws while loading or rendering, the placeholder is shown instead.
 */
export class CharacterErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    if (import.meta.env.DEV) {
      console.warn('[character] falling back to the placeholder:', error)
    }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
