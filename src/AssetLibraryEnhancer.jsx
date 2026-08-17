import { useEffect } from 'react'
import { callMarketingApi, hasWorkspaceKey } from './lib/googleWorkspace'

const META_KEY = 'brutti-asset-library-metadata-v1'
const HIDDEN_KEY = 'brutti-asset-library-hidden-v1'
const DB_NAME = 'brutti-asset-library'
const DB_VERSION = 1
const STORE_NAME = 'local-assets'

function readJson(key, fallback) {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function assetKey(asset) {
  return String(asset.id || asset.name || '').trim()
}

function inferredCategory(name = '') {
  const value = name.toLowerCase()
  if (/logo|brand|guideline|monogram/.test(value)) return 'Brand'
  if (/workshop|kilang|factory|team|artisan|process/.test(value)) return 'Workshop'
  if (/customer|client|installation|install/.test(value)) return 'Customer / Project'
  if (/poster|campaign|retreat|promo/.test(value)) return 'Campaign'
  if (/front view|side view|product|rack|shelf|console|organizer|wardrobe|bed|cabinet/.test(value)) return 'Product'
  return 'Other'
}

function inferredProduct(name = '') {
  return name
    .replace(/\b(front|side|product|display|console|shoe|organizer|workshop|reference|view|photo|image)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function openAssetDb() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function getLocalAssets() {
  if (!('indexedDB' in window)) return []
  const db = await openAssetDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).getAll()
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

async function saveLocalAsset(record) {
  const db = await openAssetDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(record)
    tx.oncomplete = () => resolve(record)
    tx.onerror = () => reject(tx.error)
  })
}

async function removeLocalAsset(id) {
  const db = await openAssetDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(id)
    tx.oncomplete = resolve
    tx.onerror = () => reject(tx.error)
  })
}

function makeButton(label, className, handler) {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = className
  button.textContent = label
  button.addEventListener('click', handler)
  return button
}

function createField(label, input) {
  const wrapper = document.createElement('label')
  wrapper.className = 'asset-upgrade-field'
  const text = document.createElement('span')
  text.textContent = label
  wrapper.append(text, input)
  return wrapper
}

function toastMessage(message) {
  const toast = document.querySelector('.toast')
  if (!toast) return
  const previous = toast.innerHTML
  toast.innerHTML = ''
  const dot = document.createElement('span')
  dot.className = 'pulse-dot'
  toast.append(dot, document.createTextNode(message))
  toast.classList.add('show')
  window.setTimeout(() => {
    toast.classList.remove('show')
    window.setTimeout(() => { toast.innerHTML = previous }, 220)
  }, 2800)
}

function findNativeUseButton(name) {
  const cards = [...document.querySelectorAll('.asset-grid-native article')]
  const card = cards.find((item) => item.querySelector('strong')?.textContent?.trim() === name)
  return card?.querySelector('.asset-use-button') || null
}

function openModal(asset, metadata, options) {
  document.querySelector('.asset-upgrade-modal-backdrop')?.remove()
  const backdrop = document.createElement('div')
  backdrop.className = 'asset-upgrade-modal-backdrop'
  const modal = document.createElement('div')
  modal.className = 'asset-upgrade-modal'
  const head = document.createElement('div')
  head.className = 'asset-upgrade-modal-head'
  const heading = document.createElement('div')
  const eyebrow = document.createElement('span')
  eyebrow.textContent = options.mode === 'edit' ? 'ASSET DETAILS' : 'ASSET PREVIEW'
  const title = document.createElement('h2')
  title.textContent = asset.name
  heading.append(eyebrow, title)
  const close = makeButton('×', 'asset-upgrade-close', () => backdrop.remove())
  head.append(heading, close)
  modal.append(head)

  if (options.mode === 'preview') {
    const preview = document.createElement('div')
    preview.className = 'asset-upgrade-large-preview'
    if (asset.local && asset.objectUrl) {
      if (String(asset.mimeType).startsWith('video/')) {
        const video = document.createElement('video')
        video.controls = true
        video.src = asset.objectUrl
        preview.append(video)
      } else {
        const img = document.createElement('img')
        img.src = asset.objectUrl
        img.alt = asset.name
        preview.append(img)
      }
    } else if (asset.id && !String(asset.id).startsWith('fallback-')) {
      const img = document.createElement('img')
      img.src = `https://drive.google.com/thumbnail?id=${encodeURIComponent(asset.id)}&sz=w1200`
      img.alt = asset.name
      img.onerror = () => { img.remove(); preview.textContent = 'Preview tidak dapat dibuka. Gunakan Open in Drive untuk lihat file asal.' }
      preview.append(img)
    } else {
      preview.innerHTML = '<div class="asset-upgrade-placeholder">IMAGE<br/>REFERENCE</div>'
    }
    const info = document.createElement('div')
    info.className = 'asset-upgrade-info-grid'
    ;[
      ['Category', metadata.category || inferredCategory(asset.name)],
      ['Product / Project', metadata.product || inferredProduct(asset.name) || '—'],
      ['Type', asset.mimeType || 'reference'],
      ['Tags', metadata.tags || '—'],
      ['Notes', metadata.notes || '—'],
    ].forEach(([label, value]) => {
      const row = document.createElement('div')
      const small = document.createElement('span')
      const strong = document.createElement('strong')
      small.textContent = label
      strong.textContent = value
      row.append(small, strong)
      info.append(row)
    })
    const actions = document.createElement('div')
    actions.className = 'asset-upgrade-modal-actions'
    if (asset.url) {
      actions.append(makeButton('Open in Drive', 'button secondary', () => window.open(asset.url, '_blank', 'noopener')))
    }
    const useButton = findNativeUseButton(asset.name)
    const use = makeButton(useButton ? 'Use in Content Studio' : 'Drive sync required', 'button primary', () => {
      if (!useButton) { toastMessage('Asset lokal perlu dimasukkan ke Google Drive dulu sebelum boleh digunakan untuk publishing.'); return }
      backdrop.remove()
      useButton.click()
    })
    if (!useButton) use.disabled = true
    actions.append(use)
    modal.append(preview, info, actions)
  } else {
    const form = document.createElement('form')
    form.className = 'asset-upgrade-edit-form'
    const nameInput = document.createElement('input')
    nameInput.value = metadata.displayName || asset.name
    const category = document.createElement('select')
    ;['Product','Customer / Project','Campaign','Brand','Workshop','Other'].forEach((value) => {
      const option = document.createElement('option')
      option.value = value
      option.textContent = value
      category.append(option)
    })
    category.value = metadata.category || inferredCategory(asset.name)
    const product = document.createElement('input')
    product.value = metadata.product || inferredProduct(asset.name)
    product.placeholder = 'e.g. PERLA / KAANAGAN / Lok Kawi'
    const tags = document.createElement('input')
    tags.value = metadata.tags || ''
    tags.placeholder = 'front view, bedroom, storage'
    const notes = document.createElement('textarea')
    notes.rows = 4
    notes.value = metadata.notes || ''
    notes.placeholder = 'Internal notes about this visual…'
    form.append(createField('Display name', nameInput), createField('Category', category), createField('Product / project', product), createField('Tags', tags), createField('Notes', notes))
    const actions = document.createElement('div')
    actions.className = 'asset-upgrade-modal-actions'
    actions.append(makeButton('Cancel', 'button secondary', () => backdrop.remove()))
    const save = makeButton('Save details', 'button primary', () => {
      options.onSave({
        displayName: nameInput.value.trim() || asset.name,
        category: category.value,
        product: product.value.trim(),
        tags: tags.value.trim(),
        notes: notes.value.trim(),
      })
      backdrop.remove()
    })
    actions.append(save)
    form.append(actions)
    modal.append(form)
  }
  backdrop.append(modal)
  backdrop.addEventListener('mousedown', (event) => { if (event.target === backdrop) backdrop.remove() })
  document.body.append(backdrop)
}

function AssetLibraryEnhancer() {
  useEffect(() => {
    let pageCleanup = null
    let activationTimer = 0

    const setup = () => {
      window.clearTimeout(activationTimer)
      activationTimer = window.setTimeout(async () => {
        const title = document.querySelector('.page-header h1')
        const panel = document.querySelector('.asset-panel')
        if (!title || title.textContent.trim() !== 'Asset Library' || !panel) {
          if (pageCleanup) { pageCleanup(); pageCleanup = null }
          return
        }
        if (document.querySelector('.asset-upgrade-toolbar')) return

        const nativeGrid = panel.querySelector('.asset-grid')
        if (!nativeGrid) return
        nativeGrid.classList.add('asset-grid-native')
        nativeGrid.setAttribute('aria-hidden', 'true')

        let metadata = readJson(META_KEY, {})
        let hidden = new Set(readJson(HIDDEN_KEY, []))
        let remoteAssets = []
        let localAssets = []
        let folderId = ''
        let objectUrls = []
        let disposed = false

        const nativeAssets = [...nativeGrid.querySelectorAll('article')].map((card, index) => ({
          id: `fallback-${index}`,
          name: card.querySelector('strong')?.textContent?.trim() || `Asset ${index + 1}`,
          mimeType: card.querySelector('p')?.textContent?.trim() || 'reference',
          url: '',
          source: 'Reference',
        }))

        try {
          localAssets = await getLocalAssets()
          localAssets = localAssets.map((record) => {
            const objectUrl = URL.createObjectURL(record.blob)
            objectUrls.push(objectUrl)
            return { ...record, local: true, objectUrl, source: 'Local upload' }
          })
        } catch {
          localAssets = []
        }

        if (hasWorkspaceKey()) {
          try {
            const result = await callMarketingApi('list_drive_assets')
            remoteAssets = (result.files || []).map((file) => ({ ...file, source: 'Google Drive' }))
            folderId = result.folderId || ''
          } catch {
            remoteAssets = []
          }
        }
        if (disposed) return

        const toolbar = document.createElement('section')
        toolbar.className = 'asset-upgrade-toolbar panel'
        const searchWrap = document.createElement('div')
        searchWrap.className = 'asset-upgrade-search'
        const search = document.createElement('input')
        search.placeholder = 'Search name, product, project or tags…'
        searchWrap.append(search)
        const category = document.createElement('select')
        const all = document.createElement('option')
        all.value = 'All'
        all.textContent = 'All categories'
        category.append(all)
        ;['Product','Customer / Project','Campaign','Brand','Workshop','Other'].forEach((value) => {
          const option = document.createElement('option')
          option.value = value
          option.textContent = value
          category.append(option)
        })
        const source = document.createElement('select')
        ;[['All','All sources'],['Google Drive','Google Drive'],['Local upload','Local upload'],['Reference','Reference']].forEach(([value,label]) => {
          const option = document.createElement('option')
          option.value = value
          option.textContent = label
          source.append(option)
        })
        const showHidden = document.createElement('label')
        showHidden.className = 'asset-upgrade-toggle'
        const showHiddenInput = document.createElement('input')
        showHiddenInput.type = 'checkbox'
        showHidden.append(showHiddenInput, document.createTextNode('Show hidden'))
        const refresh = makeButton('Refresh', 'button secondary small', () => window.location.reload())
        toolbar.append(searchWrap, category, source, showHidden, refresh)

        const grid = document.createElement('div')
        grid.className = 'asset-upgrade-grid'
        const empty = document.createElement('div')
        empty.className = 'asset-upgrade-empty'
        empty.textContent = 'No assets match this search.'

        panel.insertBefore(toolbar, nativeGrid)
        panel.insertBefore(grid, nativeGrid)
        panel.insertBefore(empty, nativeGrid)

        const statusLine = document.createElement('div')
        statusLine.className = 'asset-upgrade-statusline'
        panel.insertBefore(statusLine, toolbar)

        const combinedAssets = () => {
          const base = remoteAssets.length ? remoteAssets : nativeAssets
          return [...base, ...localAssets]
        }

        const persistMeta = () => writeJson(META_KEY, metadata)
        const persistHidden = () => writeJson(HIDDEN_KEY, [...hidden])

        const render = () => {
          grid.innerHTML = ''
          const term = search.value.trim().toLowerCase()
          const allAssets = combinedAssets()
          const visible = allAssets.filter((asset) => {
            const key = assetKey(asset)
            const meta = metadata[key] || {}
            const cat = meta.category || inferredCategory(asset.name)
            const text = `${meta.displayName || asset.name} ${cat} ${meta.product || inferredProduct(asset.name)} ${meta.tags || ''} ${meta.notes || ''}`.toLowerCase()
            if (!showHiddenInput.checked && hidden.has(key)) return false
            if (category.value !== 'All' && cat !== category.value) return false
            if (source.value !== 'All' && asset.source !== source.value) return false
            if (term && !text.includes(term)) return false
            return true
          })
          statusLine.textContent = `${visible.length} shown · ${allAssets.length} total · ${remoteAssets.length} Drive · ${localAssets.length} local`
          empty.style.display = visible.length ? 'none' : 'block'

          visible.forEach((asset) => {
            const key = assetKey(asset)
            const meta = metadata[key] || {}
            const card = document.createElement('article')
            card.className = `asset-upgrade-card${hidden.has(key) ? ' is-hidden' : ''}`
            const preview = document.createElement('button')
            preview.type = 'button'
            preview.className = 'asset-upgrade-preview'
            preview.setAttribute('aria-label', `Preview ${asset.name}`)
            if (asset.local && asset.objectUrl && String(asset.mimeType).startsWith('image/')) {
              const img = document.createElement('img')
              img.src = asset.objectUrl
              img.alt = ''
              preview.append(img)
            } else if (asset.local && String(asset.mimeType).startsWith('video/')) {
              const badge = document.createElement('span')
              badge.className = 'asset-upgrade-file-badge'
              badge.textContent = 'VIDEO'
              preview.append(badge)
            } else if (asset.id && !String(asset.id).startsWith('fallback-')) {
              const img = document.createElement('img')
              img.src = `https://drive.google.com/thumbnail?id=${encodeURIComponent(asset.id)}&sz=w700`
              img.alt = ''
              img.onerror = () => {
                img.remove()
                const badge = document.createElement('span')
                badge.className = 'asset-upgrade-file-badge'
                badge.textContent = 'DRIVE'
                preview.append(badge)
              }
              preview.append(img)
            } else {
              const badge = document.createElement('span')
              badge.className = 'asset-upgrade-file-badge'
              badge.textContent = 'IMAGE'
              preview.append(badge)
            }
            const sourceBadge = document.createElement('span')
            sourceBadge.className = 'asset-upgrade-source-badge'
            sourceBadge.textContent = asset.source
            preview.append(sourceBadge)
            preview.addEventListener('click', () => openModal(asset, meta, { mode:'preview' }))

            const body = document.createElement('div')
            body.className = 'asset-upgrade-card-body'
            const cat = document.createElement('span')
            cat.className = 'asset-upgrade-category'
            cat.textContent = meta.category || inferredCategory(asset.name)
            const name = document.createElement('strong')
            name.textContent = meta.displayName || asset.name
            const product = document.createElement('p')
            product.textContent = meta.product || inferredProduct(asset.name) || 'No product/project tagged yet'
            const tags = document.createElement('small')
            tags.textContent = meta.tags || 'Add tags to make this asset easier to find.'
            const actions = document.createElement('div')
            actions.className = 'asset-upgrade-card-actions'
            actions.append(
              makeButton('Preview', 'asset-upgrade-link', () => openModal(asset, meta, { mode:'preview' })),
              makeButton('Edit', 'asset-upgrade-link', () => openModal(asset, meta, {
                mode:'edit',
                onSave: (next) => { metadata[key] = next; persistMeta(); render(); toastMessage('Asset details saved.') },
              })),
            )
            const nativeUse = findNativeUseButton(asset.name)
            const use = makeButton(nativeUse ? 'Use' : 'Use', 'asset-upgrade-use', () => {
              if (!nativeUse) {
                toastMessage(asset.local ? 'Asset lokal belum berada di Drive. Upload ke folder Drive dulu sebelum guna untuk publishing.' : 'Connect Google Drive to use this asset in Content Studio.')
                return
              }
              nativeUse.click()
            })
            if (!nativeUse) use.classList.add('is-disabled')
            actions.append(use)
            const menu = document.createElement('div')
            menu.className = 'asset-upgrade-secondary-actions'
            if (hidden.has(key)) {
              menu.append(makeButton('Restore', 'asset-upgrade-link', () => { hidden.delete(key); persistHidden(); render() }))
            } else {
              menu.append(makeButton(asset.local ? 'Delete' : 'Hide', 'asset-upgrade-link danger', async () => {
                if (asset.local) {
                  if (!window.confirm(`Delete local asset “${asset.name}”?`)) return
                  await removeLocalAsset(asset.id)
                  localAssets = localAssets.filter((item) => item.id !== asset.id)
                  delete metadata[key]
                  persistMeta()
                  render()
                  toastMessage('Local asset deleted.')
                } else {
                  hidden.add(key)
                  persistHidden()
                  render()
                  toastMessage('Asset hidden from this library. The original Drive file was not deleted.')
                }
              }))
            }
            body.append(cat, name, product, tags, actions, menu)
            card.append(preview, body)
            grid.append(card)
          })
        }

        search.addEventListener('input', render)
        category.addEventListener('change', render)
        source.addEventListener('change', render)
        showHiddenInput.addEventListener('change', render)

        const picker = document.createElement('input')
        picker.type = 'file'
        picker.accept = 'image/*,video/*'
        picker.multiple = true
        picker.hidden = true
        document.body.append(picker)
        picker.addEventListener('change', async () => {
          const files = [...(picker.files || [])]
          if (!files.length) return
          for (const file of files) {
            if (file.size > 8 * 1024 * 1024) {
              toastMessage(`${file.name} terlalu besar. Maximum 8 MB untuk local staging.`)
              continue
            }
            const id = `local-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
            await saveLocalAsset({ id, name:file.name, mimeType:file.type || 'application/octet-stream', createdAt:new Date().toISOString(), blob:file })
          }
          picker.value = ''
          objectUrls.forEach((url) => URL.revokeObjectURL(url))
          objectUrls = []
          localAssets = (await getLocalAssets()).map((record) => {
            const objectUrl = URL.createObjectURL(record.blob)
            objectUrls.push(objectUrl)
            return { ...record, local:true, objectUrl, source:'Local upload' }
          })
          render()
          toastMessage('Asset added to local staging. Move it to Drive before publishing.')
        })

        const headerButton = [...document.querySelectorAll('.page-header .button')].find((button) => button.textContent.includes('Add asset'))
        const interceptAdd = (event) => {
          event.preventDefault()
          event.stopPropagation()
          event.stopImmediatePropagation()
          picker.click()
        }
        if (headerButton) {
          headerButton.textContent = 'Add asset'
          headerButton.addEventListener('click', interceptAdd, true)
        }

        const helper = document.createElement('div')
        helper.className = 'asset-upgrade-helper'
        const helperCopy = document.createElement('div')
        const helperStrong = document.createElement('strong')
        helperStrong.textContent = 'Upload, organise, preview dan pilih visual dari satu tempat.'
        const helperText = document.createElement('p')
        helperText.textContent = remoteAssets.length
          ? 'Drive assets boleh terus dihantar ke Content Studio. Upload baru disimpan sebagai local staging sehingga dimasukkan ke folder Drive.'
          : 'Sekarang library menggunakan reference/local staging. Connect Google Drive untuk attach visual terus ke content dan publishing.'
        helperCopy.append(helperStrong, helperText)
        helper.append(helperCopy)
        if (folderId) helper.append(makeButton('Open Drive asset folder', 'button secondary small', () => window.open(`https://drive.google.com/drive/folders/${encodeURIComponent(folderId)}`, '_blank', 'noopener')))
        panel.insertBefore(helper, statusLine)

        render()

        pageCleanup = () => {
          disposed = true
          objectUrls.forEach((url) => URL.revokeObjectURL(url))
          toolbar.remove()
          grid.remove()
          empty.remove()
          helper.remove()
          statusLine.remove()
          picker.remove()
          if (headerButton) headerButton.removeEventListener('click', interceptAdd, true)
          nativeGrid.classList.remove('asset-grid-native')
          nativeGrid.removeAttribute('aria-hidden')
        }
      }, 80)
    }

    const observer = new MutationObserver(setup)
    observer.observe(document.getElementById('root') || document.body, { childList:true, subtree:true })
    setup()
    return () => {
      observer.disconnect()
      window.clearTimeout(activationTimer)
      if (pageCleanup) pageCleanup()
      document.querySelector('.asset-upgrade-modal-backdrop')?.remove()
    }
  }, [])

  return null
}

export default AssetLibraryEnhancer
