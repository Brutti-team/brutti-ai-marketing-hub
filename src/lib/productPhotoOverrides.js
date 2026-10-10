// Product photos hosted in this repo (app/public/product-photos/), keyed by
// product ID from the Google Sheet "Product Library" tab. These win over the
// sheet image URL, a Meta caption match and the Drive name overlay, because the
// sheet / Drive images for these IDs were wrong or duplicated.
//
// The offline demo data in src/data.js reuses BR-001…BR-016 for different
// products, so an override never applies to one of those local catalog names.

const PHOTO_BASE = '/brutti-ai-marketing-hub/product-photos/'

export const productPhotoOverrideById = {
  'BR-006': 'BR-006-photo.jpg', // Dangsanak Dining Table (Extendable)
  'BR-008': 'BR-008-photo.jpg', // Woody Picnic Table
  'BR-026': 'BR-026-photo.jpg', // Puloudopuan Besi Kitchen Island
  'BR-041': 'BR-041-photo.jpg', // Perla
  'BR-048': 'BR-048-photo.jpg', // King Bed Frame
  'BR-064': 'BR-064-photo.jpg', // Folding Table
  'BR-065': 'BR-065-photo.jpg', // Signage
  'BR-069': 'BR-069-photo.jpg', // Bespoke Burger Stall
  'BR-075': 'BR-075-photo.jpg', // Wooden Crate
  'BR-076': 'BR-076-photo.jpg', // Arch
  'BR-083': 'BR-083-photo.jpg', // Counter (Fluted Wall Panel - Brown Oak)
  'BR-115': 'BR-115-photo.jpg', // Kiosk Tradisi Rotan
}

// IDs whose stored image is wrong and should show the normal placeholder.
export const productPhotoHiddenIds = new Set(['BR-085'])

export function productPhotoOverride(product, localNames = []) {
  const id = String(product?.id || '').trim().toUpperCase()
  if (!id || localNames.includes(product?.name)) return null
  if (productPhotoOverrideById[id]) return { src: `${PHOTO_BASE}${productPhotoOverrideById[id]}`, source: 'override' }
  if (productPhotoHiddenIds.has(id)) return { src: '', source: 'hidden' }
  return null
}
