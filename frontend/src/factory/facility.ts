import { FacilityEntry } from '@/services/types';

export const getEmtypFacility = (siteId: string): FacilityEntry => {
  return {
    id: 'new',
    name: '',
    manufacturer: '',
    model: '',
    description: '',
    site: siteId,
    shutdownDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
