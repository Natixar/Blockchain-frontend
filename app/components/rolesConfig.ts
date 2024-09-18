export type Role = 'mine' | 'smeltery' | 'manufacturer' | 'trader' /*| 'transport'*/;

export interface Link {
  label: string;
  path: string;
}

const rolesConfig: Record<Role, Link[]> = {
  mine: [
    { label: 'Products list', path: '/product/list' },
    { label: 'Mint product', path: '/mine/minting' },
    { label: 'Declare Product', path: '/product/declare' },
    { label: 'Transactions list', path: '/transactions/list' },
    { label: 'Create transaction', path: '/transactions/create' },
    { label: 'Load package', path: '/product/load' },
  ],
  smeltery: [
    { label: 'Products list', path: '/product/list' },
    { label: 'Load package', path: '/product/load' },
    { label: 'Unload package', path: '/product/unload' },
    { label: 'Smelter product', path: '/smeltery/smelter' },
    { label: 'Declare product', path: '/product/declare' },
    { label: 'Transactions list', path: '/transactions/list' },
    { label: 'Create transaction', path: '/transactions/create' },
  ],
  manufacturer: [
    { label: 'Scan new product', path: '/product/unload' },
    { label: 'Products list', path: '/manufacturer' },
  ],
  trader: [
    { label: 'Transactions list', path: '/transactions/list' },
    { label: 'Create transaction', path: '/transactions/create' },
  ],
  // transport: [
  //   { label: 'Transport list', path: '/transport/list' },
  //   { label: 'Scan transport', path: '/transport/scan' },
  // ],
};

export default rolesConfig;
