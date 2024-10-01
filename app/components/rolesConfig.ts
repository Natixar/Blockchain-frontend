export type Role = 'mine' | 'smeltery' | 'manufacturer' | 'trader' /*| 'transport'*/;

export interface Link {
  label: string;
  path: string;
}

const rolesConfig: Record<Role, Link[]> = {
  mine: [
    { label: 'Mint commodity', path: '/mine/minting' },
    { label: 'Commodities stock', path: '/product/list' },
    { label: 'Create transaction', path: '/transactions/create' },
    { label: 'Transactions list', path: '/transactions/list' },
    { label: 'Define commodity', path: '/product/declare' },
    { label: 'Load package', path: '/product/load' },
  ],
  smeltery: [
    { label: 'Commodities stock', path: '/product/list' },
    { label: 'Load package', path: '/product/load' },
    { label: 'Unload package', path: '/product/unload' },
    { label: 'Smelt commodities', path: '/smeltery/smelter' },
    { label: 'Define commodity', path: '/product/declare' },
    { label: 'Create transaction', path: '/transactions/create' },
    { label: 'Transactions list', path: '/transactions/list' },
  ],
  manufacturer: [
    { label: 'Scan new product', path: '/product/unload' },
    { label: 'Products list', path: '/manufacturer' },
  ],
  trader: [
    { label: 'Create transaction', path: '/transactions/create' },
    { label: 'Transactions list', path: '/transactions/list' },
  ],
  // transport: [
  //   { label: 'Transport list', path: '/transport/list' },
  //   { label: 'Scan transport', path: '/transport/scan' },
  // ],
};

export default rolesConfig;
