// Prefer a repo-hosted WebP sibling when the original URL is a GitHub Pages
// or app public image, or when a Drive-hosted Product Library image was
// copied into app/public/product-photos/{ID}.webp. Original JPG/PNG files
// stay in the repo so existing Sheet URLs keep working until they are updated.
const REPO_IMAGE_PATH = /(?:https:\/\/brutti-team\.github\.io)?\/brutti-ai-marketing-hub\/(product-photos|catalog-products|kol-photos)\/([^/?#]+)\.(jpe?g|png)(?:[?#].*)?$/i

const DRIVE_IMPORTED_PRODUCT_IDS = new Set([
  'BR-006',
  'BR-007',
  'BR-012',
  'BR-019',
  'BR-022',
  'BR-025',
  'BR-026',
  'BR-027',
  'BR-028',
  'BR-030',
  'BR-032',
  'BR-033',
  'BR-035',
  'BR-036',
  'BR-039',
  'BR-041',
  'BR-044',
  'BR-045',
  'BR-050',
  'BR-051',
  'BR-052',
  'BR-057',
  'BR-061',
  'BR-062',
  'BR-063',
  'BR-065',
  'BR-067',
  'BR-068',
  'BR-069',
  'BR-075',
  'BR-076',
  'BR-081',
  'BR-086',
  'BR-089',
  'BR-090',
  'BR-091',
  'BR-092',
  'BR-093',
  'BR-094',
  'BR-095',
  'BR-097',
  'BR-098',
  'BR-099',
  'BR-100',
  'BR-101',
  'BR-102',
  'BR-103',
  'BR-105',
  'BR-106',
  'BR-107',
  'BR-110',
  'BR-111',
  'BR-112',
  'BR-113',
  'BR-114',
  'BR-116',
  'BR-117',
  'BR-118',
  'BR-119',
  'BR-120',
  'BR-121',
  'BR-122',
  'BR-123',
])

export function isDriveHostedImageUrl(url = '') {
  return /(?:googleusercontent\.com|drive\.google\.com|googleapis\.com\/drive)/i.test(String(url || ''))
}

export function mapRepoImageUrlToWebp(url = '') {
  const value = String(url || '').trim()
  if (!value) return ''
  const match = value.match(REPO_IMAGE_PATH)
  if (!match) return ''
  const prefix = /^https?:\/\//i.test(value) ? 'https://brutti-team.github.io' : ''
  return `${prefix}/brutti-ai-marketing-hub/${match[1]}/${match[2]}.webp`
}

export function preferRepoWebp(url, product) {
  const original = String(url || '').trim()
  const sibling = mapRepoImageUrlToWebp(original)
  if (sibling) return sibling
  const id = String(product?.id || '').trim().toUpperCase()
  if (id && DRIVE_IMPORTED_PRODUCT_IDS.has(id) && isDriveHostedImageUrl(original)) {
    return `/brutti-ai-marketing-hub/product-photos/${id}.webp`
  }
  return original
}

