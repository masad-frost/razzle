import { h, render } from 'preact';
import App from '../common/App.js';

let root;
function renderApp() {
  root = render(<App />, document.body, document.body.firstElementChild);
}

// Initial render.
renderApp();

if (module.hot) {
  module.hot.accept('../common/App.js', renderApp);
}
