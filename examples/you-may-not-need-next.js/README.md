# You May Not Need Next.js

This is an example of how to mimic Next.js's route-level data fetching using 
Razzle, React Router 4, a static route config, and nifty Higher Order Component. 
This technique originially came from [@ryanflorence's gist that can be found here](https://gist.github.com/ryanflorence/efbe562332d4f1cc9331202669763741). 

## How to use
Download the example [or clone the whole project](https://github.com/jaredpalmer/razzle.git):

```bash
curl https://codeload.github.com/jaredpalmer/razzle/tar.gz/master | tar -xz --strip=2 razzle-master/examples/you-may-not-need-next.js
cd you-may-not-need-next.js
```

Install it and run:

```bash
yarn install
yarn start
```

## Walkthrough
To fetch data isomorphically add a `static getInitialData` to your component.


```js
import React from 'react'
import axios from 'axios'

class MyPage extends React.Component {
  static getInitialData({ req, res, match, axios }) {
    // `req`, and `res` only. We have access to React Router's `match` here. 
    // and pass thru an instance of axios for data fetching. Bonus idea: 
    // You can also make the axios instance setup for isomorphic authenticated 
    // data fetching by setting default baseURL and headers.
    return axios.get(`/v1/user/${match.params.id}`)
  }

  state = {
    // this initialData would come from window.DATA if it's the first load.
    data: this.props.initialData || null, 
    error: null,
  };

  componentDidMount() {
    if (!this.state.data) {
      // If this.state.data is null, that means that the we are on the client.
      // To get the data we need, we just call getInitialData again.
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
    // Everything is injected into this.props.data
    // UNLIKE Next.js, ONLY first page-load render is blocked. So we need
    // to handle a loading state (when this.props.data === null). This is 
    // awesome becuase it gives users immediate feedack instead of an empty 
    // screen.
    return (
      <div>
        {this.state.data === null
          ? <div>Loading...</div> 
          : <div>{this.state.data.name}</div>}
      </div>
    )
  }
}

export default MyPage
```

We also need to add our new component to our static route config in `common/routes.js`.

```js
// common/routes.js
...
import MyPage from './MyPage'

const routes = [
  {
    path: '/users/:id',
    component: MyPage,
    exact: true,
  },
...

```

To stay DRY we can actually extract the `componentDidMount` stuff into a Higher Order Component.

```js
import React from 'react';
import axios from 'axios';

// This is a Higher Order Component that abstracts duplicated data fetching
// on the server and client.
export default function withSSR(Page) {
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
```

Now our pages can look like this:

```js
import React from 'react'

class MyPage extends React.Component {
  static getInitialData({ req, res, match, axios }) {
    return axios.get(`/v1/user/${match.params.id}`)
  }

  render() {
    return (
      <div>
        {this.props.data === null
          ? <div>Loading...</div> 
          : <div>{this.props.data.name}</div>}
      </div>
    )
  }
}

export default MyPage
```

## Sometimes you may not want to server render.

Imagine you have some routes like `/settings/profile`, `/settings/billing`. 
These don't need to be server rendered. React Router 4 still works exactly how
you want it too. Remember...routes are just components!

Here's how we could write our settings pages...

```js
import React from 'react'

class Settings extends React.Component {

  componentDidMount() {
    ....
  }

  render() {
    return (
      <div>
        <Switch>  
          <Route path="/settings/general" render={props => (
            ....
          )}/>
          <Route path="/settings/profile" render={props => (
            ....
          )}/>
        </Switch>
      </div>
    )
  }
}

export default Settings
```

We just need to tell our server that we should direct requests to 
`/settings/profile` AND `settings/general` to the SAME component in our static
route config.

```js
// common/routes.js
...
import MyPage from './MyPage'
import Settings from './Settings'

const routes = [
  {
    path: '/users/:id',
    component: MyPage,
    exact: true,
  },
  {
    path: '/settings/general',
    component: Settings,
    exact: true,
  },
  {
    path: '/settings/profile',
    component: Settings,
    exact: true,
  }
...

```