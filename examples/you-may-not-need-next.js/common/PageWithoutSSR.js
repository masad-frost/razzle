import React, { Component } from 'react';
import Helmet from 'react-helmet';

class PageWithoutSSR extends Component {
  render() {
    return (
      <div>
        <Helmet>
          <title>About</title>
        </Helmet>
        Page without SSR
      </div>
    );
  }
}

export default PageWithoutSSR;
