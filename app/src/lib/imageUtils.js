const PLACEHOLDER_IMAGE = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><rect width="640" height="360" fill="#f4f4f5"/><path d="M240 235l55-58 42 39 36-34 67 53H240z" fill="#a1a1aa"/><circle cx="386" cy="126" r="27" fill="#a1a1aa"/><text x="320" y="300" text-anchor="middle" fill="#71717a" font-family="sans-serif" font-size="24">Imagen no disponible</text></svg>',
)}`

export function getImageUrl(imagePath) {
  if (typeof imagePath !== 'string' || !imagePath.trim()) {
    return PLACEHOLDER_IMAGE
  }

  const normalizedPath = imagePath.trim()

  if (/^(https?:)?\/\//i.test(normalizedPath) || normalizedPath.startsWith('data:')) {
    return normalizedPath
  }

  const imageBaseUrl = (import.meta.env.VITE_IMAGE_URL ?? '').replace(/\/+$/, '')

  if (!imageBaseUrl) {
    return PLACEHOLDER_IMAGE
  }

  return `${imageBaseUrl}/${normalizedPath.replace(/^\/+/, '')}`
}

export { PLACEHOLDER_IMAGE }
