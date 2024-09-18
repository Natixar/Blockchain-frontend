export type Transaction = {
    address: string
    from: string
    to: string
    transportEmissions: number
    product: {
        name: string
        symbol: string
        quantity: number
        price: number
        co2: number
    }
}