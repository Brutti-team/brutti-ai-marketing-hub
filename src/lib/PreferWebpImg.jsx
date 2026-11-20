import { useEffect, useRef, useState } from 'react'
import { preferRepoWebp } from './preferRepoWebp'

export function PreferWebpImg({ src, product, onError, alt = '', ...rest }) {
  const original = String(src || '')
  const productId = String(product?.id || '')
  const preferred = preferRepoWebp(original, product)
  const [current, setCurrent] = useState(preferred)
  const currentRef = useRef(current)
  currentRef.current = current
  useEffect(() => {
    setCurrent(preferRepoWebp(original, { id: productId }))
  }, [original, productId])
  if (!original && !preferred) return null
  return (
    <img
      alt={alt}
      {...rest}
      src={current}
      onError={(event) => {
        if (currentRef.current && original && currentRef.current !== original) {
          setCurrent(original)
          return
        }
        onError?.(event)
      }}
    />
  )
}
