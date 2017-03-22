import React from 'react';
import axios from 'axios';

// This is a Higher Order Component that abstracts duplicated data fetching
// on the server and client.
export default function SSR(Page) {
  class SSR extends React.Component {
    static getInitialData(ctx) {
      // Need to call the wrapped components getInitialData if it exists
      return Page.getInitialData
        ? Page.getInitialData(ctx)
        : Promise.resolve(null);
    }

    state = {
      data: this.props.initialData || null,
      error: null,
    };

    componentDidMount() {
      if (!this.state.data) {
        // if this.state.data is null, that means that the we are on the client.
        // To get the data we need, we just call getInitialData again on mount.
        this.constructor
          .getInitialData({ match: this.props.match, axios })
          .then(
            data => {
              this.setState(state => ({ data }));
            },
            error => {
              this.setState(state => ({ data: null, error: error }));
            }
          );
      }
    }

    render() {
      // Unlike Next, which flatly returns all props returned by `getInitialData`,
      // Our function places them in data or error. If you'd rather flatten
      // your props you can use something like recompose to do so.
      return (
        <Page {...this.props} data={this.state.data} error={this.state.error} />
      );
    }
  }

  SSR.displayName = `SSR(${getDisplayName(Page)})`;

  return SSR;
}

// This make debugging easier. Components will show as SSR(MyComponent) in
// react-dev-tools.
function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
