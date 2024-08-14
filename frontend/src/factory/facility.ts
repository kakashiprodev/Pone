import { FacilityEntry } from '@/services/types';

export const getEmtypFacility = (siteId: string): FacilityEntry => {
  return {
    id: 'new',
    name: '',
    manufacturer: '',
    model: '',
    description: '',
    site: siteId,
    shutdown_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};
