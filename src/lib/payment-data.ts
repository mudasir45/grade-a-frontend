export interface FPXBank {
  id: string;
  name: string;
  code: string;
  logo: string;
  active: boolean;
}

export const FPX_BANKS: FPXBank[] = [
  {
    id: 'MBB0227',
    name: 'Maybank2U',
    code: 'maybank2u',
    logo: '/icons/banks/maybank.svg',
    active: true,
  },
  {
    id: 'PHBMMYKL',
    name: 'Public Bank',
    code: 'publicbank',
    logo: '/icons/banks/publicbank.svg',
    active: true,
  },
  {
    id: 'CIBBMYKL',
    name: 'CIMB Clicks',
    code: 'cimb',
    logo: '/icons/banks/cimb.svg',
    active: true,
  },
  {
    id: 'RHBBMYKL',
    name: 'RHB Now',
    code: 'rhb',
    logo: '/icons/banks/rhb.svg',
    active: true,
  },
  {
    id: 'HLB',
    name: 'Hong Leong Connect',
    code: 'hongleong',
    logo: '/icons/banks/hongleong.svg',
    active: true,
  },
] 