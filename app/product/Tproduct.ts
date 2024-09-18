export type Product = {
  packageAddress?: string
  from?: string
  to?: string
  transporter?: string
  address: string
  name: string
  symbol: string
  quantity: number
  unit: string
  co2?: number
  files?: string[]
  price?: number
  // transportDetailsHash?: string
}
