import React, { Component } from 'react';
import SSR from './withSSR';
import Helmet from 'react-helmet';

class PageWithSSR extends Component {
  // This works similarly to Next.js's `getInitialProps`. Except it has access
  //  to RR4's match and an instance of Axios!
  static getInitialProps({ match, req, res, axios }) {
    return new Promise(function(resolve, reject) {
      setTimeout(
        function() {
          resolve({
            friends: [
              { id: '12342', name: 'brent' },
              { id: '124234', name: 'jared' },
            ],
            currentRoute: match.path,
          });
        },
        500
      );
    });
  }

  render() {
    return (
      <div>
        <Helmet>
          <title>Home</title>
        </Helmet>
        {this.props.data === null
          ? <div>
              this is a loading state. It will only show if user navigates to this route from somewhere else.
            </div>
          : <div>
              {this.props.data &&
                this.props.data.friends &&
                this.props.data.friends.length > 0 &&
                this.props.data.friends.map(t => (
                  <div key={t.id}>{t.name}</div>
                ))}
            </div>}
      </div>
    );
  }
}

// We wrap pages we want to server-render in a HOC.
export default SSR(PageWithSSR);
