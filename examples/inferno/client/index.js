import Inferno from 'inferno';
import App from '../common/App';

if (module.hot) {
  require('inferno-devtools');
}

Inferno.render(<App />, document.getElementById('root'));

if (module.hot) {
  module.hot.accept();
}
