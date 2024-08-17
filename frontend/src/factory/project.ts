import { ProjectEntry } from '@/services/types';

export const getEmptyProject = (): ProjectEntry => {
  return {
    id: 'new',
    name: '',
    logo: '',
    logoId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
