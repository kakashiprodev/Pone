/**
 * Global Data Provider
 * will be used to provide data from different sources
 */

import PocketBaseDataProvider from "./provider/pocketbase";

const provider = {
  pocketbase: PocketBaseDataProvider,
  //supabase: SupabaseDataProvider,
};

// to be extended in the future
export default new provider["pocketbase"]();
