import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import {
  fetchProductByBarcode,
  ProductNoCarbsError,
  ProductNotFoundError,
  type ScannedProduct,
} from '../../lib/openFoodFacts'
import type { Food } from '../../types'
import { BarcodeScanner } from './BarcodeScanner'

interface Props {
  initial?: Partial<Food>
  onSubmit: (data: Partial<Food>) => Promise<void>
  onCancel?: () => void
}

export function FoodForm({ initial = {}, onSubmit, onCancel }: Props) {
  const { t } = useTranslation()

  const [name, setName] = useState(initial.name ?? '')
  const [carbsPer100g, setCarbsPer100g] = useState(String(initial.carbsPer100g ?? ''))
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null)

  const [showScanner, setShowScanner] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleBarcodeDetected(code: string) {
    setShowScanner(false)
    setScanning(true)
    setScanError(null)

    try {
      const product = await fetchProductByBarcode(code)
      setScannedProduct(product)
      setName(product.name)
      setCarbsPer100g(String(product.carbsPer100g))
    } catch (e) {
      if (e instanceof ProductNoCarbsError) {
        setScanError(t('scanner.noCarbs'))
      } else if (e instanceof ProductNotFoundError) {
        setScanError(t('scanner.productNotFound'))
      } else {
        setScanError(t('errors.unknownError'))
      }
    } finally {
      setScanning(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError(t('errors.nameRequired')); return }
    if (!carbsPer100g || Number(carbsPer100g) < 0) { setError(t('errors.carbsGe0')); return }
    setLoading(true)
    setError(null)
    try {
      await onSubmit({
        name: name.trim(),
        carbsPer100g: Number(carbsPer100g),
        ...(scannedProduct?.imageUrl ? { photo: scannedProduct.imageUrl } : {}),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.savingError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {showScanner && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setShowScanner(false)}
        />
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Scan button */}
        <button
          type="button"
          onClick={() => { setScanError(null); setShowScanner(true) }}
          disabled={scanning}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-600 font-medium text-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {scanning ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              {t('scanner.fetchingProduct')}
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

        {/* Scanned product preview */}
        {scannedProduct && !scanError && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 flex items-start gap-3">
            {scannedProduct.imageUrl && (
              <img
                src={scannedProduct.imageUrl}
                alt={scannedProduct.name}
                className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-emerald-200"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              />
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-0.5">
                {t('scanner.autoFilled')}
              </p>
              <p className="text-sm font-medium text-emerald-900 truncate">{scannedProduct.name}</p>
              {scannedProduct.brand && (
                <p className="text-xs text-emerald-600">{scannedProduct.brand}</p>
              )}
            </div>
          </div>
        )}

        {/* Form error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Input
          label={`${t('foods.name')} ${t('common.required')}`}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={t('foods.namePlaceholder')}
          required
        />
        <Input
          label={`${t('foods.carbsPer100g')} ${t('common.required')}`}
          type="number"
          min="0"
          step="0.01"
          value={carbsPer100g}
          onChange={e => setCarbsPer100g(e.target.value)}
          placeholder={t('foods.carbsPer100gPlaceholder')}
          required
        />

        <div className="flex gap-3 pt-2">
          {onCancel && (
            <Button type="button" variant="secondary" fullWidth onClick={onCancel}>
              {t('common.cancel')}
            </Button>
          )}
          <Button type="submit" fullWidth loading={loading}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </>
  )
}
