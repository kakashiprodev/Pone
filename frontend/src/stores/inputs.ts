import { defineStore } from 'pinia';
import { InputEntry } from './../services/types';
import dataprovider from './../services/dataprovider';
import { globalStore } from '@/main';

export interface InputsState {
  requestPending: boolean;
  reportId: string | null;
  allScopes: InputEntry[];
  scope1: InputEntry[];
  scope2: InputEntry[];
  scope3: InputEntry[];
  sumEmissions: number | null;
}

export interface InputsActions {
  readUserInputs: () => Promise<void>;
  addInput: (input: InputEntry) => Promise<InputEntry>;
  updateInput: (input: InputEntry) => Promise<InputEntry>;
  dropInput: (input: InputEntry) => Promise<void>;
  updateReportSum: (addValue?: number) => Promise<void>;
}

export const useInputStore = defineStore('inputs', {
  state: (): InputsState => ({
    reportId: null,
    requestPending: false,
    allScopes: [],
    scope1: [],
    scope2: [],
    scope3: [],
    sumEmissions: null,
  }),

  actions: {
    // *************************************************************
    // CRUD cache for "inputs"
    // *************************************************************

    /**
     * Update reports sum
     */
    async updateReportSum(addValue?: number) {
      try {
        if (!globalStore.selectedReport) {
          return;
        }
        // inital value
        if (this.sumEmissions == null) {
          this.sumEmissions = this.scope1.reduce(
            (acc, cur) => acc + cur.sumValue,
            0,
          );
          this.sumEmissions += this.scope2.reduce(
            (acc, cur) => acc + cur.sumValue,
            0,
          );
          this.sumEmissions += this.scope3.reduce(
            (acc, cur) => acc + cur.sumValue,
            0,
          );
        }
        if (this.sumEmissions != null && addValue != null) {
          this.sumEmissions += addValue;
        }
        await dataprovider.updateReport({
          ...globalStore.selectedReport,
          sumEmissions: this.sumEmissions,
        });
      } catch (error) {
        console.error('Error updating report sum', error);
      }
    },

    /**
     * Read user inputs for the selected report in the project
     */
    async readUserInputs() {
      try {
        if (
          !globalStore.selectedReport ||
          !globalStore.selectedProject ||
          this.reportId === globalStore.selectedReport.id
        ) {
          return;
        }
        this.requestPending = true;

        // reset values
        this.allScopes = [];
        this.scope1 = [];
        this.scope2 = [];
        this.scope3 = [];
        this.sumEmissions = null;
        this.reportId = globalStore.selectedReport.id;

        const inputs = await dataprovider.readUserInputsForProject(
          globalStore.selectedProject.id ?? '',
          [globalStore.selectedReport.year],
        );
        // set values in the store
        this.scope1 = inputs.filter((i) => i.scope === 1) ?? [];
        this.scope2 = inputs.filter((i) => i.scope === 2) ?? [];
        this.scope3 = inputs.filter((i) => i.scope === 3) ?? [];
        this.allScopes = inputs;

        // write back the sum to the report to keep it up to date
        await this.updateReportSum();
      } catch (error) {
        throw error;
      } finally {
        this.requestPending = false;
      }
    },

    /**
     * Add a new input to the cache and backend.
     */
    async addInput(input: InputEntry) {
      try {
        const created = await dataprovider.createUserInput(input);
        // add to cache
        this.allScopes.push(created);
        if (created.scope === 1) this.scope1.push(created);
        else if (created.scope === 2) this.scope2.push(created);
        else if (created.scope === 3) this.scope3.push(created);
        // update the sum
        await this.updateReportSum(created.sumValue);
        return created;
      } catch (error) {
        throw error;
      } finally {
        this.requestPending = false;
      }
    },

    /**
     * Update an input in the cache and backend.
     */
    async updateInput(input: InputEntry) {
      try {
        const updated = await dataprovider.updateUserInput(input);
        // update the cache
        const indexAll = this.allScopes.findIndex((i) => i.id === input.id);
        if (indexAll > -1) {
          this.allScopes[indexAll] = updated;
        }
        // update the scope cache
        const scope = input.scope;
        const obj =
          scope === 1 ? this.scope1 : scope === 2 ? this.scope2 : this.scope3;
        const index = obj.findIndex((i) => i.id === input.id);
        if (index > -1) {
          obj[index] = updated;
        }
        // update the sum
        await this.updateReportSum(updated.sumValue - input.sumValue);
        return updated;
      } catch (error) {
        throw error;
      } finally {
        this.requestPending = false;
      }
    },

    /**
     * Drop an input from the cache and backend.
     */
    async dropInput(input: InputEntry) {
      try {
        await dataprovider.deleteUserInput(input.id);
        // remove from cache
        const indexAll = this.allScopes.findIndex((i) => i.id === input.id);
        if (indexAll > -1) {
          this.allScopes.splice(indexAll, 1);
        }
        // remove from scope cache
        const scope = input.scope;
        const obj =
          scope === 1 ? this.scope1 : scope === 2 ? this.scope2 : this.scope3;
        const index = obj.findIndex((i) => i.id === input.id);
        if (index > -1) {
          obj.splice(index, 1);
        }
        // update the sum
        await this.updateReportSum(-input.sumValue);
      } catch (error) {
        throw error;
      } finally {
        this.requestPending = false;
      }
    },
  },
});
