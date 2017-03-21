import { createElement, render } from 'rax';
import App from '../common/App';

render(<App />, document.getElementById('root'));

if (module.hot) {
  module.hot.accept();
}
