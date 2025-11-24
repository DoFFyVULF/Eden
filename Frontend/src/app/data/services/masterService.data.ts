export interface MasterService {
  masterId: number;
  serviceIds: number[];
}

export const masterServices: MasterService[] = [
  {
    masterId: 1,
    serviceIds: [1, 2],
  },
  {
    masterId: 2,
    serviceIds: [4, 5, 6, 7, 8], 
  },
  {
    masterId: 3,
    serviceIds: [1, 2, 3], 
  },
  {
    masterId: 4,
    serviceIds: [6, 7, 8], 
  },
];