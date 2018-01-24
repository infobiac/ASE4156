import 'whatwg-fetch';
import network from './network';

const {
  Environment,
  RecordSource,
  Store,
} = require('relay-runtime');


const source = new RecordSource();
const store = new Store(source);

const environment = new Environment({
  network,
  store,
});

export default environment;
