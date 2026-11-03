import { createHmac, timingSafeEqual } from 'node:crypto'
export type PhotoReceipt = { session: string; path: string; sha: string; signature: string }
export function detectPhotoExtension(bytes: Uint8Array): 'jpg' | 'png' | 'webp' | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg'
  if (bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte)) return 'png'
  if (bytes.length >= 12 && Buffer.from(bytes.subarray(0, 4)).toString() === 'RIFF' && Buffer.from(bytes.subarray(8, 12)).toString() === 'WEBP') return 'webp'
  return null
}
export function signPhotoReceipt(receipt: Omit<PhotoReceipt, 'signature'>, secret: string): PhotoReceipt {
  return { ...receipt, signature: createHmac('sha256', secret).update(JSON.stringify([receipt.session, receipt.path, receipt.sha])).digest('hex') }
}
export function validPhotoReceipt(value: PhotoReceipt, session: string, secret: string): boolean {
  if (!value || value.session !== session || !/^public\/images\/products\/admin\/[a-z0-9-]+\.(jpg|png|webp)$/.test(value.path) || !/^[a-f0-9]{40}$/.test(value.sha) || !/^[a-f0-9]{64}$/.test(value.signature)) return false
  const signed = signPhotoReceipt({ session: value.session, path: value.path, sha: value.sha }, secret)
  return timingSafeEqual(Buffer.from(value.signature, 'hex'), Buffer.from(signed.signature, 'hex'))
}
