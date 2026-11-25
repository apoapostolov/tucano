// The picture a connector wears in the app. A picked bitmap is shrunk here, in the window, and kept
// in the database as a PNG: a backup, an export and a restore carry it, with no loose files to keep in
// step. An https address is kept as the address, and an SVG is kept as sanitized text.
import { L } from '../../shared/lang'

// A tile is 36 px and a screen can be twice that; this is a mark, never a photograph.
export const ICON_PX = 96
const MAX_FILE_BYTES = 4 * 1024 * 1024
// Keep in step with ICON_MAX_CHARS in src/core/connectors.ts, which refuses anything longer.
const MAX_DATA_CHARS = 32_000
const MAX_URL_CHARS = 2_048
const SVG_UNSAFE = /<script|javascript:|<foreignObject|on\w+\s*=/i

export const isIconData = (value?: string): boolean => !!value && value.startsWith('data:image/')

// A file, ready to store: a 96 px PNG for a bitmap, the SVG itself for an SVG.
export async function iconFromFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error(L('Escolha um arquivo de imagem.', 'Pick an image file.'))
  if (file.size > MAX_FILE_BYTES) throw new Error(L('Essa imagem tem mais de 4 MB. Escolha uma menor.', 'That image is over 4 MB. Pick a smaller one.'))
  const data = file.type === 'image/svg+xml' ? await svgIcon(file) : await shrunkIcon(file)
  if (data.length > MAX_DATA_CHARS) throw new Error(L('A imagem ficou grande demais para um ícone. Escolha uma menor.', 'That image is too big for an icon. Pick a smaller one.'))
  return data
}

// An image address is the second way in. The app allows https images only, and the core checks again.
export function iconFromAddress(value: string): string {
  const url = value.trim()
  if (url.length > MAX_URL_CHARS) throw new Error(L('Esse endereço é longo demais para um ícone.', 'That image address is too long for an icon.'))
  try {
    if (new URL(url).protocol === 'https:') return url
  } catch {
    // the message below names what is allowed
  }
  throw new Error(L('O endereço da imagem precisa começar em https://.', 'The image address must start with https://.'))
}

// Base64 from the main process as the file the picker already knows how to shrink.
export function fileFromBase64(name: string, mime: string, data: string): File {
  const binary = atob(data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new File([bytes], name, { type: mime })
}

// The picture on the clipboard as a file: the app's own clipboard on the desktop, the browser's on a
// server. Null when there is no picture there, which the button says.
export async function imageFromClipboard(): Promise<File | null> {
  const desktop = window.tucano?.image
  if (desktop?.paste) {
    const got = await desktop.paste().catch(() => null)
    return got?.data ? fileFromBase64('clipboard', got.mime, got.data) : null
  }
  try {
    const items = await navigator.clipboard.read()
    for (const item of items) {
      const mime = item.types.find((t) => t.startsWith('image/'))
      if (!mime) continue
      const blob = await item.getType(mime)
      return new File([blob], 'clipboard', { type: mime })
    }
  } catch {
    // no permission, or nothing readable in this browser
  }
  return null
}

// An SVG keeps its edges at any size. Scripts, script addresses, embedded HTML and handlers have no
// business in a picture, so an SVG carrying any of them is refused before it reaches the database.
async function svgIcon(file: File): Promise<string> {
  const text = await file.text()
  if (!/<svg[\s>]/i.test(text)) throw new Error(L('Esse arquivo não parece um SVG.', "That file doesn't look like an SVG."))
  if (SVG_UNSAFE.test(text)) throw new Error(L('Esse SVG tem script ou HTML dentro, e um ícone não pode ter.', 'That SVG carries a script or HTML inside, and an icon cannot.'))
  return `data:image/svg+xml;base64,${utf8Base64(text)}`
}

// A bitmap drawn on a transparent canvas, so a mark with soft edges keeps them.
async function shrunkIcon(file: File): Promise<string> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error(L('Não consegui ler essa imagem. Tente um PNG ou um JPEG.', "I couldn't read that image. Try a PNG or a JPEG."))
  }
  const scale = Math.min(1, ICON_PX / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error(L('Não consegui preparar a imagem.', "I couldn't prepare the image."))
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  return canvas.toDataURL('image/png')
}

// btoa takes one byte per character: the SVG text goes through UTF-8 first, accents and all.
function utf8Base64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}
