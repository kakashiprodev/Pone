// import { DocumentItem } from "./data/types";
// import type {} from "./types";
// import { buildTree } from "./data/helpers";
// import PocketBase from "pocketbase";

// const URL: string = env.ENV_VITE_POCKETBASE_URL || "http://127.0.0.1:8090";

// export default {
//   name: "pocketbase",

//   cache: {
//     pb: null,
//     login: null,
//   },

//   async login(data: any): Promise<boolean> {
//     // authenticate on auth collection record
//     console.log("login", data);
//     await this.cache.pb.collection("users").authWithPassword(
//       data.username,
//       data.password,
//     );    
//     return true;
//   },

//   async checkLogin(): Promise<boolean> {
//     const login = this.cache.pb.collection("users").getList(1, 1);
//     console.log(login);
//     return true;
//   },

//   async logout(): Promise<void> {
//     this.cache.pb.authStore.clear();
//   },

//   async initialize() {
//     this.cache.pb = new PocketBase(URL);
//   },

//   async getDocuments(query?: DocumentQuery): Promise<{
//     tree: DocumentTreeItem[];
//     list: DocumentItem[];
//   }> {
//     let filter = `${
//       query?.langCodes ? "content.langCode ~ '" + query.langCodes + "'" : ""
//     } `;
//     filter = filter + (query?.hasOrigin ? "content.originId != null " : "");
//     filter = filter +
//       (query?.originId ? "content.originId = '" + query.originId + "'" : "");
//     filter = filter.trim();

//     const result = await this.cache.pb.collection("documents").getList(1, 500, {
//       filter,
//     });
//     if (result.status && result.status !== 200) {
//       throw Error(`Documents could not be fetched. ${result.message}`);
//     }
//     const contents = result.items.map((item: any) => {
//       return { ...item.content, id: item.id }; // overwrite id since this is empty in content
//     });

//     return {
//       tree: buildTree(contents),
//       list: contents,
//     };
//   },

//   // -------------
//   // | DOCUMENTS |
//   // -------------

//   async getDataForDocument(id: string): Promise<DocumentItem> {
//     const result = await this.cache.pb.collection("documents").getOne(id);
//     console.log(result);
//     const document = { ...result.content, id: result.id };
//     return document;
//   },

//   async addDocument(document: DocumentItem): Promise<DocumentItem> {
//     const result = await this.cache.pb.collection("documents").create({
//       content: document,
//     });
//     return { ...result.content, id: result.id };
//   },

//   async dropDocument(id: string): Promise<void> {
//     await this.cache.pb.collection("documents").delete(id);
//   },

//   async updateDocument(document: DocumentItem): Promise<DocumentItem> {
//     // get all media-ids from document.content to update them in document.media
//     const mediaIds = [];
//     for (const item of document.content) {
//       if (item.type === "medium" && item.data.id && item.data.id !== "") {
//         mediaIds.push(item.data.id);
//       }
//     }
//     document.media = mediaIds;
//     const result = await this.cache.pb.collection("documents").update(
//       document.id,
//       { content: document },
//     );

//     // update also all media-entries
//     for (const id of mediaIds) {
//       const medium = await this.getMedium(id);
//       if (!medium) continue;
//       if (medium.documents.indexOf(document.id) === -1) {
//         medium.documents.push(document.id);
//         await this.cache.pb.collection("media").update(id, {
//           content: medium,
//         });
//       }
//     }
//     return { ...result.content, id: result.id };
//   },

//   // ---------
//   // | MEDIA |
//   // ---------

//   async getMediums(query?: MediumQuery): Promise<any> {
//     let filter = `${
//       query?.documentId ? "content.documents ~ '" + query.documentId + "'" : ""
//     } `;
//     filter = filter +
//       (query?.originId ? "content.originId = '" + query.originId + "' " : "");
//     filter = filter +
//       (query?.type ? "content.type = '" + query.type + "' " : "");
//     filter = filter.trim();
//     // let url = MEDIA_URL + "query" + "?";
//     // if (query?.documentId) {
//     //   url += `documentId=${query.documentId}&`;
//     // }
//     // if (query?.originId) {
//     //   url += `originId=${query.originId}&`;
//     // }
//     // if (query?.type) {
//     //   url += `type=${query.type}&`;
//     // }

//     const result = await this.cache.pb.collection("media").getList(1, 9999, {
//       filter,
//     });
//     const contents = result.items.map((item: any) => {
//       return { ...item.content, id: item.id };
//     });
//     return contents;
//   },

//   async getMedium(id) {
//     const result = await this.cache.pb.collection("media").getOne(id);
//     if (result.status && result.status !== 200) {
//       throw Error(`Medium ${id} could not be fetched. ${result.message}`);
//     }
//     return { ...result.content, id: result.id };
//   },

//   async addMedium(
//     file: File,
//     langCode: string,
//     documentId?: string | string[],
//     originId?: string,
//   ) {
//     try {
//       let type: MediumType = "image";
//       if (file.name.endsWith(".mp4") || file.name.endsWith(".webm")) {
//         type = "video";
//       }
//       // first upload the file itself
//       const result = await this.cache.pb.collection("media").create({
//         file,
//       });
//       const url = await this.cache.pb.files.getUrl(result, result.file);
//       const dbEntry: Medium = {
//         id: result.id,
//         version: 1,
//         type,
//         langCode,
//         name: result.id,
//         url,
//         hash: "",
//         filename: result.id,
//         originId: originId || undefined,
//         documents: documentId
//           ? (Array.isArray(documentId) ? documentId : [documentId])
//           : [],
//       };

//       // update db
//       const updatedMedium = await this.cache.pb.collection("media").update(
//         result.id,
//         {
//           content: dbEntry,
//         },
//       );
//       console.log(updatedMedium);
//       return updatedMedium.content;
//     } catch (e) {
//       throw Error(`Medium ${file.name} could not be uploaded. ${e}`);
//     }
//   },

//   async updateMedium(
//     id: string,
//     file: File,
//   ) {
//     // get db entry
//     const result = await this.cache.pb.collection("media").update(id, {
//       file,
//     });
//     console.log(id, file);
//     return { ...result.content, id: result.id };
//   },

//   async getMediumUrl(id) {
//     const result = await this.cache.pb.collection("media").getOne(id);
//     if (result.status && result.status !== 200) {
//       throw Error(`Medium ${id} could not be fetched. ${result.message}`);
//     }
//     const url = await this.cache.pb.files.getUrl(result, result.file);
//     return url.startsWith("http") ? url : URL + url;
//   },

//   async dropMedium(mediumId: string): Promise<void> {
//     await this.cache.pb.collection("media").delete(mediumId);
//   },

//   // ---------
//   // | Nodes |
//   // ---------

//   async dropNodes(ids: string[]): Promise<void> {
//     for (const id of ids) {
//       await this.cache.pb.collection("documents").delete(id);
//     }
//   },

//   async moveNode(id: string, parentId: string): Promise<void> {
//     // to do
//     console.log(id, parentId);
//   },
//   // end
// } satisfies DataProvider;
