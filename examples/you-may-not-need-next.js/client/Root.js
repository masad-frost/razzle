import React from 'react';
import BrowserRouter from 'react-router-dom/BrowserRouter';
import Route from 'react-router-dom/Route';
import App from '../common/App';
import routes from '../common/routes';

// Here we rehydrate our routes with data on the client.
const Root = () => (
  <BrowserRouter>
    <App routes={routes} initialData={window.DATA} />
  </BrowserRouter>
);

export default Root;
