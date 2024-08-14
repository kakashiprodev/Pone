import { ProjectEntry } from '@/services/types';

export const getEmptyProject = (): ProjectEntry => {
  return {
    id: 'new',
    name: '',
    logo: '',
    logo_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};
