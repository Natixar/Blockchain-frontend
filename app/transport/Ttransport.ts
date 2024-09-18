export type Transport = {
    id: number
    packageAddress: string
    from: string
    to: string
    transporter: string
    date: Date
    name: string
    symbol: string
    product: string
    quantity: number
    unit: string
    co2Emission: string
    distance: number
    energyType: string
    transportType: string
    geolocation: {latitude: string, longitude: string}
    files: File[]
    isArchived: boolean
}
