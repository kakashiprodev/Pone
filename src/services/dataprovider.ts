/**
 * Global Data Provider
 * will be used to provide data from different sources
 */
import Postgrest from './provider/postgrest';

const provider = {
  postgrest: Postgrest,
};

// to be extended in the future
export default new provider['postgrest']();
