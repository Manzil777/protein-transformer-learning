import { Component } from 'react'

/**
 * React Error Boundary — catches render errors in child components
 * and shows a fallback UI instead of a white screen.
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, errorInfo)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h3 className="font-serif text-2xl font-bold text-charcoal mb-3">
                            Something went wrong
                        </h3>
                        <p className="text-charcoal/50 font-sans text-sm mb-6">
                            An unexpected error occurred while rendering this section.
                            This is likely a temporary issue.
                        </p>
                        <button
                            onClick={this.handleReset}
                            className="btn-organic text-sm !py-3 !px-6"
                        >
                            Try Again
                        </button>
                        {import.meta.env.MODE === 'development' && this.state.error && (
                            <pre className="mt-6 p-4 bg-red-50 rounded-xl text-xs text-red-600 text-left overflow-auto max-h-40 border border-red-100">
                                {this.state.error.toString()}
                            </pre>
                        )}
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
