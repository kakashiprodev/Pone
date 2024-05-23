/**
 * Global Data Provider
 * will be used to provide data from different sources
 */
// import PocketBaseDataProvider from './provider/pocketbase';
import Postgrest from './provider/postgrest';

const provider = {
  // pocketbase: PocketBaseDataProvider,
  postgrest: Postgrest,
};

// to be extended in the future
export default new provider['postgrest']();
