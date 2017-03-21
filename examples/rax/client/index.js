import { createElement, render } from 'rax';
import App from '../common/App';

const app = document.getElementById('root');

function renderApp() {
  render(<App />, app);
}
// Initial render.
renderApp();

if (module.hot) {
  module.hot.accept('../common/App', renderApp);
}
