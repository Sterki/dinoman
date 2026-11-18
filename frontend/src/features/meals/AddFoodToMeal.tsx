import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { useFoods } from '../../hooks/useFoods'
import {
  fetchProductByBarcode,
  ProductNoCarbsError,
  ProductNotFoundError,
} from '../../lib/openFoodFacts'
import type { Food } from '../../types'
import { BarcodeScanner } from '../foods/BarcodeScanner'

interface Props {
  onAdd: (foodId: string, grams: number) => Promise<void>
  onCancel: () => void
}

type ScanStatus = 'idle' | 'fetching' | 'creating'

export function AddFoodToMeal({ onAdd, onCancel }: Props) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [grams, setGrams] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showScanner, setShowScanner] = useState(false)
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle')
  const [scanError, setScanError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { foods, create } = useFoods(debouncedSearch)

  // When no search: show most recently added first
  const sortedFoods = useMemo(() => {
    if (debouncedSearch) return foods
    return [...foods].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [foods, debouncedSearch])

  const carbsPreview = useMemo(() => {
    if (!selectedFood || !grams) return null
    return ((selectedFood.carbsPer100g / 100) * Number(grams)).toFixed(1)
  }, [selectedFood, grams])

  async function handleBarcodeDetected(code: string) {
    setShowScanner(false)
    setScanError(null)
    setScanStatus('fetching')

    try {
      const product = await fetchProductByBarcode(code)

      // Check if the food already exists in the library (case-insensitive)
      const existing = foods.find(
        f => f.name.toLowerCase() === product.name.toLowerCase()
      )

      if (existing) {
        setSelectedFood(existing)
        setScanStatus('idle')
        return
      }

      // Create it automatically and select it
      setScanStatus('creating')
      const newFood = await create({
        name: product.name,
        carbsPer100g: product.carbsPer100g,
        ...(product.imageUrl ? { photo: product.imageUrl } : {}),
      })
      setSelectedFood(newFood)
      setScanStatus('idle')
    } catch (e) {
      if (e instanceof ProductNoCarbsError) {
        setScanError(t('scanner.noCarbs'))
      } else if (e instanceof ProductNotFoundError) {
        setScanError(t('scanner.productNotFound'))
      } else {
        setScanError(t('errors.unknownError'))
      }
      setScanStatus('idle')
    }
  }

  async function handleAdd() {
    if (!selectedFood) { setError(t('errors.foodRequired')); return }
    if (!grams || Number(grams) <= 0) { setError(t('errors.gramsRequired')); return }
    setLoading(true)
    setError(null)
    try {
      await onAdd(selectedFood.id, Number(grams))
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errors.addingError'))
    } finally {
      setLoading(false)
    }
  }

  const isScanning = scanStatus !== 'idle'

  return (
    <>
      {showScanner && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setShowScanner(false)}
        />
      )}

      <div className="flex flex-col gap-4">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!selectedFood ? (
          <>
            {/* Scan button */}
            <button
              type="button"
              onClick={() => { setScanError(null); setShowScanner(true) }}
              disabled={isScanning}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-600 font-medium text-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  {scanStatus === 'fetching' ? t('scanner.fetchingProduct') : t('scanner.creatingFood')}
                </>
              ) : (
                <>
                  <span className="text-xl">📷</span>
                  {t('scanner.scanBarcode')}
                </>
              )}
            </button>

            {/* Scan error */}
            {scanError && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700 flex items-start gap-2">
                <span>⚠️</span>
                <span>{scanError}</span>
              </div>
            )}

            {/* Search */}
            <Input
              label={t('foods.searchFood')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('foods.searchFoodPlaceholder')}
              autoFocus={false}
            />

            {/* Food list */}
            {!debouncedSearch && sortedFoods.length > 0 && (
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide -mb-2">
                {t('foods.recentFoods')}
              </p>
            )}
            <ul className="flex flex-col gap-1 max-h-60 overflow-y-auto -mt-1">
              {sortedFoods.map(food => (
                <li key={food.id}>
                  <button
                    onClick={() => setSelectedFood(food)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left hover:bg-blue-50 transition-colors"
                  >
                    {food.photo ? (
                      <img
                        src={food.photo}
                        alt={food.name}
                        className="w-8 h-8 rounded-lg object-cover shrink-0 bg-slate-100"
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0 text-sm">🥗</div>
                    )}
                    <span className="flex-1 font-medium text-slate-800 truncate">{food.name}</span>
                    <span className="text-sm text-slate-500 shrink-0">{food.carbsPer100g}{t('common.carbsOf100g')}</span>
                  </button>
                </li>
              ))}
              {sortedFoods.length === 0 && (
                <p className="text-center text-slate-400 py-6 text-sm">{t('common.noResults')}</p>
              )}
            </ul>
          </>
        ) : (
          <>
            {/* Selected food */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              {selectedFood.photo && (
                <img
                  src={selectedFood.photo}
                  alt={selectedFood.name}
                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-blue-900 truncate">{selectedFood.name}</p>
                <p className="text-sm text-blue-600">{selectedFood.carbsPer100g}{t('common.carbsOf100g')}</p>
              </div>
              <button
                onClick={() => { setSelectedFood(null); setGrams('') }}
                className="text-blue-400 hover:text-blue-600 text-lg shrink-0"
              >
                ✕
              </button>
            </div>

            <Input
              label={t('foods.gramsConsumed')}
              type="number"
              min="0.1"
              step="0.1"
              value={grams}
              onChange={e => setGrams(e.target.value)}
              placeholder={t('foods.gramsConsumedPlaceholder')}
              autoFocus
            />

            {carbsPreview !== null && (
              <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
                <p className="text-3xl font-bold text-green-700">{carbsPreview}g</p>
                <p className="text-sm text-green-600 mt-1">{t('foods.carbsPreviewLabel')}</p>
              </div>
            )}
          </>
        )}

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" fullWidth onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          {selectedFood && (
            <Button type="button" fullWidth loading={loading} onClick={handleAdd}>
              {t('foods.addToMeal')}
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
