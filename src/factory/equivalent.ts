import { EquivalentEntry } from '@/services/types';

export const getEmptyEquivalent = (
  scope: number,
  projectId: string,
): EquivalentEntry => {
  {
    return {
      id: 'new',
      scope: scope,
      add_name1: '',
      category: 'Benutzereingaben',
      specification1: '',
      specification2: '',
      specification3: '',
      comment: '',
      in: '',
      out: 'kg',
      source: 'Benutzereingabe',
      avg_value: null as any,
      monthly_values: false,
      project: projectId,
      jan: null,
      feb: null,
      mar: null,
      apr: null,
      may: null,
      jun: null,
      jul: null,
      aug: null,
      sep: null,
      oct: null,
      nov: null,
      dec: null,
      parent: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
};
