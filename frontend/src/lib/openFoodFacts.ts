const OFF_API = 'https://world.openfoodfacts.net/api/v3/product'

const FIELDS = [
  'product_name',
  'generic_name',
  'abbreviated_product_name',
  'brands',
  'nutriments',
  'nutrition',
  'image_front_url',
  'selected_images',
].join(',')

interface OFFNutriments {
  carbohydrates_100g?: number
  carbohydrates?: number
}

interface OFFNutritionNutrient {
  value?: number
  unit?: string
}

interface OFFProduct {
  product_name?: string
  generic_name?: string
  abbreviated_product_name?: string
  brands?: string
  image_front_url?: string
  nutriments?: OFFNutriments
  nutrition?: {
    aggregated_set?: {
      per?: string
      nutrients?: {
        carbohydrates?: OFFNutritionNutrient
      }
    }
  }
  selected_images?: {
    front?: {
      display?: Record<string, string>
      small?: Record<string, string>
    }
  }
}

interface OFFResponse {
  status: string
  product?: OFFProduct
}

export interface ScannedProduct {
  name: string
  carbsPer100g: number
  imageUrl: string | null
  brand: string | null
}

export class ProductNotFoundError extends Error {}
export class ProductNoCarbsError extends Error {}

export async function fetchProductByBarcode(code: string): Promise<ScannedProduct> {
  const url = `${OFF_API}/${encodeURIComponent(code)}?fields=${FIELDS}&product_type=food`

  let data: OFFResponse
  try {
    const res = await fetch(url)
    if (!res.ok) throw new ProductNotFoundError(`HTTP ${res.status}`)
    data = await res.json()
  } catch (e) {
    if (e instanceof ProductNotFoundError) throw e
    throw new ProductNotFoundError('Network error')
  }

  if (data.status !== 'success' || !data.product) {
    throw new ProductNotFoundError('Product not found')
  }

  const p = data.product

  const name =
    p.product_name?.trim() ||
    p.abbreviated_product_name?.trim() ||
    p.generic_name?.trim() ||
    null

  if (!name) throw new ProductNotFoundError('No name available')

  // v3 `nutrition` field (per 100g by convention), fall back to legacy `nutriments`
  const carbsV3 = p.nutrition?.aggregated_set?.nutrients?.carbohydrates?.value
  const carbsLegacy = p.nutriments?.carbohydrates_100g ?? p.nutriments?.carbohydrates
  const carbsPer100g = carbsV3 ?? carbsLegacy ?? null

  if (carbsPer100g === null) throw new ProductNoCarbsError('No carb data')

  const imageUrl =
    p.image_front_url ||
    p.selected_images?.front?.display?.en ||
    p.selected_images?.front?.small?.en ||
    null

  const brand = p.brands ? p.brands.split(',')[0].trim() : null

  return {
    name,
    carbsPer100g: Math.round(carbsPer100g * 100) / 100,
    imageUrl,
    brand,
  }
}
