You are a professional Vue3 Developer.
You write code only in TypeScript. You don´t explain you code. You only deliver code which is commented if necessary.

You will use "pocketbase" in this project.
Pocketbase is a simple Backend with Tables, User-Auth and Blobstorage.

This code exmaples are descriping the usage. Code comes from the official documentation
´´´
import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090');
// ...

// list and filter "example" collection records
const result = await pb.collection('example').getList(1, 20, {
    filter: 'status = true && created > "2022-08-01 10:00:00"'
});
// authenticate as auth collection record
const userData = await pb.collection('users').authWithPassword('test@example.com', '123456');

// or as super-admin
const adminData = await pb.admins.authWithPassword('test@example.com', '123456');
´´´
// Binding filter parameters
// The SDK comes with a helper pb.filter(expr, params) method to generate a filter string with placeholder parameters ({:paramName}) populated from an object.
// This method is also recommended when using the SDK in Node/Deno/Bun server-side list queries and accepting untrusted user input as filter string arguments, because it will take care to properly escape the generated string expression, avoiding eventual string injection attacks (on the client-side this is not much of an issue).
const record = await pb.collection("example").getList(1, 20, {
  // the same as: "title ~ 'te\\'st' && (totalA = 123 || totalB = 123)"
  filter: pb.filter("title ~ {:title} && (totalA = {:num} || totalB = {:num})", { title: "te'st", num: 123 })
})
// The supported placeholder parameter values are:
// string (single quotes will be autoescaped)
// number
// boolean
// Date object (will be stringified into the format expected by PocketBase)
// null
// anything else is converted to a string using JSON.stringify()

// File upload
// PocketBase Web API supports file upload via multipart/form-data requests, which means that to upload a file it is enough to provide either a FormData instance OR plain object with File/Blob prop values.
// Using FormData as body:

// the standard way to create multipart/form-data body
const data = new FormData();
data.set('title', 'lorem ipsum...')
data.set('document', new File(...))
await pb.collection('example').create(data);
Using plain object as body (this is the same as above and it will be converted to FormData behind the scenes):
const data = {
  'title':    'lorem ipsum...',
  'document': new File(...),
};
await pb.collection('example').create(data);

// Error handling
pb.collection('example').getList(1, 50).then((result) {
  // success...
  console.log('Result:', result);
}).catch((error) {
  // error...
  console.log('Error:', error);
});

// OR if you are using the async/await syntax:
try {
  const result = await pb.collection('example').getList(1, 50);
  console.log('Result:', result);
} catch (error) {
  console.log('Error:', error);
}
// The response error is normalized and always returned as ClientResponseError object with the following public fields that you could use:
ClientResponseError {
    url:           string,     // requested url
    status:        number,     // response status code
    response:      { ... },    // the API JSON error response
    isAbort:       boolean,    // is abort/cancellation error
    originalError: Error|null, // the original non-normalized error
}

// Specify TypeScript definitions
// You could specify custom TypeScript definitions for your Record models using generics:

interface Task {
  // type the collection fields you want to use...
  id:   string;
  name: string;
}
pb.collection('tasks').getList<Task>(1, 20) // -> results in Promise<ListResult<Task>>
pb.collection('tasks').getOne<Task>("RECORD_ID")  // -> results in Promise<Task>

// CRUD handlers
// Returns a paginated records list.
pb.collection(collectionIdOrName).getList(page = 1, perPage = 30, options = {});

// Returns a list with all records batch fetched at once
// (by default 200 items per request; to change it set the `batch` param).
pb.collection(collectionIdOrName).getFullList(options = {});

// Returns the first found record matching the specified filter.
pb.collection(collectionIdOrName).getFirstListItem(filter, options = {});

// Returns a single record by its id.
pb.collection(collectionIdOrName).getOne(recordId, options = {});

// Creates (aka. register) a new record.
pb.collection(collectionIdOrName).create(bodyParams = {}, options = {});

// Updates an existing record by its id.
pb.collection(collectionIdOrName).update(recordId, bodyParams = {}, options = {});

// Deletes a single record by its id.
pb.collection(collectionIdOrName).delete(recordId, options = {});

// FileService
// Builds and returns an absolute record file url for the provided filename.
pb.files.getUrl(record, filename, options = {});

// Requests a new private file access token for the current auth model (admin or record).
pb.files.getToken(options = {});

# Your task
You will extend the existing data-provider for "pocketbase".

There are new tables defined in the backend:
´´´
// table "reports"
export interface ReportEntry {
  id: string;
  project: string; // the project id
  year: number;
  companyName: string;
  companyStreet: string;
  companyPostal: string;
  companyCity: string;
  companyCountry: string;
  contactName: string;
  contactTelephone: string;
  contactEmail: string;
  contactDomain: string;
  companyDomain: string;
  countEmployees: number;
  businessTurnover: number;
  baseYear: number;
  baseEquivalentSource: null | string; // reference on table sources
}

// table "sources"
export interface SourceEntry {
  id: string;
  name: string;
}

// table "projects"
export interface ProjectEntry {
  id: string;
  name: string;
}

// table "categories"
export interface CategoryEntry {
  id: string;
  name: string;
  parent: null | string; // reference on table categories. flat structure
  equivalent: null | string; // single reference on table equivalents
}
´´´

You extend the following existing dataprovider with CRUD on the new tables.
The existing dataprovider:
´´´
import PocketBase from "pocketbase";
import { Equivalent, InputEntry, UserInputQuery } from "./../types";
import { error } from "./../toast";
import { globalStore } from "./../../main";
import { getSumForInput } from "./../reporting";

export default class DataProvider {
  private pb: PocketBase;

  constructor() {
    this.pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      await this.pb.collection("users").authWithPassword(
        username,
        password,
      );
      return this.checkLogin();
    } catch (err) {
      error(err + "");
      return false;
    }
  }

  async checkLogin(): Promise<boolean> {
    console.log("checking login");
    try {
      // console.log("token: ", this.pb.authStore.token);
      const res = await this.pb.collection("users").getList(1, 1, {
        expand: "company",
      });
      if (res.items.length < 1) return false;
      // set globalStore username and company
      globalStore.username = res.items[0].username;
      globalStore.company = res.items[0].expand?.company.companyName;
      globalStore.project = res.items[0].expand?.company.prefix;

      return true;
    } catch (error) {
      console.log("error: ", error);
      return false;
    }
  }

  async logout() {
    await this.pb.authStore.clear();
  }

  // CRUD for Equivalent
  async readEquivalents() {
    const res = await this.pb.collection("equivalents").getList<Equivalent>(
      1,
      500,
      {
        filter: `report = ${globalStore.selectedReport?.year}`,
      },
    );
    return res.items;
  }

  async readEquivalentsAsDict() {
    const res = await this.pb.collection("equivalents").getList<Equivalent>(
      1,
      500,
      {
        filter: `report = ${globalStore.selectedReport?.year}`,
      },
    );
    const dict: { [key: string]: Equivalent } = {};
    res.items.forEach((item) => {
      dict[item.id] = item;
    });
    return dict;
  }

  async createEquivalent(data: Equivalent) {
    return await this.pb.collection("equivalents").create<Equivalent>(
      data,
    );
  }

  async updateEquivalents(data: Equivalent) {
    return await this.pb
      .collection("equivalents").update<Equivalent>(data.id, data);
  }

  async deleteEquivalent(id: string) {
    return await this.pb.collection("equivalents").delete(id);
  }

  // CRUD for "inputs"
  async createUserInput(data: InputEntry) {
    // calculate sum
    data.sumValue = getSumForInput(data, globalStore.equivalentDict);
    return await this.pb
      .collection("inputs").create<InputEntry>(data);
  }

  async readUserInput(id: string) {
    return await this.pb
      .collection("inputs").getOne<InputEntry>(id);
  }

  async readUserInputs(query?: UserInputQuery) {
    const res = await this.pb
      .collection("inputs").getList<InputEntry>(1, 500, {
        filter: `report = ${globalStore.selectedReport}${
          query?.scope ? " && scope = " + query.scope : ""
        }`,
        // expand: "equivalent",
      });
    return res.items;
  }

  async updateUserInput(data: InputEntry) {
    // calculate sum
    data.sumValue = getSumForInput(data, globalStore.equivalentDict);
    if (data.id == null) throw new Error("id is null");
    return await this.pb.collection("inputs").update<InputEntry>(data.id, data);
  }

  async deleteUserInput(id: string) {
    return await this.pb.collection("inputs").delete(id);
  }
}

´´´