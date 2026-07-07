import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser'

interface Props {
  onDetected: (code: string) => void
  onClose: () => void
}

export function BarcodeScanner({ onDetected, onClose }: Props) {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [detected, setDetected] = useState(false)

  useEffect(() => {
    if (!videoRef.current) return

    const reader = new BrowserMultiFormatReader()

    reader
      .decodeFromVideoDevice(undefined, videoRef.current, (result, _err, controls) => {
        controlsRef.current = controls
        if (result) {
          setDetected(true)
          controls.stop()
          // Small delay so the user sees the "detected" feedback
          setTimeout(() => onDetected(result.getText()), 300)
        }
      })
      .catch(() => {
        setCameraError(t('scanner.cameraError'))
      })

    return () => {
      controlsRef.current?.stop()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-safe-top pt-4 pb-4 bg-black/60">
        <h2 className="text-white font-semibold text-lg">{t('scanner.title')}</h2>
        <button
          onClick={onClose}
          aria-label={t('common.cancel')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white text-xl hover:bg-white/20 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Camera view */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          playsInline
        />

        {/* Dimming overlay with cutout illusion */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 pointer-events-none">
          {/* Top dimming */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Scanning box */}
          <div className={`relative z-10 w-72 h-44 transition-all duration-300 ${detected ? 'scale-105' : ''}`}>
            {/* Clear area - white border */}
            <div className={`absolute inset-0 rounded-2xl border-2 transition-colors duration-300 ${detected ? 'border-emerald-400' : 'border-white/80'}`} />

            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />

            {/* Scanning line */}
            {!detected && (
              <div className="absolute inset-x-4 h-0.5 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.6)] animate-scan" />
            )}

            {/* Detected checkmark */}
            {detected && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl animate-bounce">✓</span>
              </div>
            )}
          </div>

          {/* Hint text */}
          <p className="relative z-10 text-white/80 text-sm text-center px-8">
            {detected ? t('scanner.detected') : t('scanner.pointAtBarcode')}
          </p>
        </div>
      </div>

      {/* Error state */}
      {cameraError && (
        <div className="p-6 text-center">
          <p className="text-red-400 mb-4">{cameraError}</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/10 text-white rounded-xl text-sm hover:bg-white/20 transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      )}
    </div>
  )
}
