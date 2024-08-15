import { EquivalentEntry } from '@/services/types';

export const getEmptyEquivalent = (
  scope: number,
  projectId: string,
): EquivalentEntry => {
  {
    return {
      id: 'new',
      scope: scope,
      addName1: '',
      category: 'Benutzereingaben',
      specification1: '',
      specification2: '',
      specification3: '',
      comment: '',
      in: '',
      out: 'kg',
      source: 'Benutzereingabe',
      avgValue: null as any,
      monthlyValues: false,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
};
