import React from 'react';
import Route from 'react-router-dom/Route';
import Switch from 'react-router-dom/Switch';
import Hello from './Hello';

const App = () => (
  <Switch>
    <Route exact path="/" component={Hello} />
  </Switch>
);

export default App;
