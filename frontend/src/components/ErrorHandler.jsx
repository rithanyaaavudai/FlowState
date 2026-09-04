import React, { Component } from 'react';

class ErrorHandler extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorHandler caught an error:', error, errorInfo);
  }

  handleClear = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onClear) {
      this.props.onClear();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-banner alert error-alert" role="alert">
          <p>Ledger synchronization failed. Please check connectivity.</p>
        </div>
      );
    }

    if (this.props.error) {
      return (
        <div className="error-boundary-banner alert error-alert" role="alert">
          <p>{this.props.error}</p>
          {this.props.onClear && (
            <button
              type="button"
              className="dismiss-btn"
              onClick={this.props.onClear}
            >
              Dismiss
            </button>
          )}
        </div>
      );
    }

    return this.props.children || null;
  }
}

export default ErrorHandler;
