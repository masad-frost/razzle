import { createElement, Component } from 'rax';
import RaxLogo from './rax.svg';
import View from 'rax-view';
import Image from 'rax-image';
import Text from 'rax-text';

class App extends Component {
  render() {
    return (
      <View>
        <Text style={{ fontFamily: 'sans-serif', color: '#ff3f00' }}>
          Razzle + Rax
        </Text>
        <Image
          source={{
            uri: RaxLogo,
          }}
          style={{
            width: 100,
            height: 100,
          }}
          resizeMode="cover"
        />
      </View>
    );
  }
}

export default App;
