export interface Product {
  id: 'thought' | 'keychain'
  name: string
  description: string
  priceInPence: number
}

export const PRODUCTS: Record<Product['id'], Product> = {
  thought: {
    id: 'thought',
    name: 'Inject a Thought',
    description: 'Permanently lock one 140-character thought into the master scroll.',
    priceInPence: 100,
  },
  keychain: {
    id: 'keychain',
    name: 'Physical Piece of the Scroll',
    description: 'Custom engraved keyring tag featuring your thought and its neighbours on the scroll.',
    priceInPence: 1200,
  },
}

export const MAX_THOUGHTS = 1_000_000
export const MAX_MESSAGE_LENGTH = 140
export const MAX_NAME_LENGTH = 40
