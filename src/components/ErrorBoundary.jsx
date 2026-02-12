import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("VideoTile Crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return <div className="bg-red-900 text-white p-2">Video Error</div>;
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;