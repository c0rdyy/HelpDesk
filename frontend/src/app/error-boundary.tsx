import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

import { Button } from '@/components/ui/button'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-lg font-semibold">Что-то пошло не так</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Приложение столкнулось с неожиданной ошибкой. Попробуйте
            перезагрузить страницу — если проблема повторится, обратитесь к
            администратору.
          </p>
          <Button onClick={this.handleReload} type="button">
            Перезагрузить страницу
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
