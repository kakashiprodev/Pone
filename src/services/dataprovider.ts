import PocketBaseDataProvider from "./data/pocketbase";

const provider = {
  pocketbase: PocketBaseDataProvider,
  //supabase: SupabaseDataProvider,
};

// to be extended in the future
export default new provider["pocketbase"]();
