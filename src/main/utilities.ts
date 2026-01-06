import { app } from 'electron'
import fs from 'node:fs'
import path from 'node:path'

const photosBasePath = app.isPackaged
  ? path.join(app.getPath('userData'), 'photos')
  : path.join(process.cwd(), 'photos')

const ensurePhotosDir = () => {
  if (!fs.existsSync(photosBasePath)) {
    fs.mkdirSync(photosBasePath, { recursive: true })
  }
}

export const initializePhotoDirectory = () => {
  ensurePhotosDir()
}

export const getPhotoPath = (photoFileName: string) => {
  return path.join(photosBasePath, photoFileName)
}

export const getPhotoBytes = (photoFileName: string): Uint8Array | null => {
  const photoPath = getPhotoPath(photoFileName)
  return fs.existsSync(photoPath) ? fs.readFileSync(photoPath) : null
}

export const savePhotoBytes = (photoFileName: string, bytes: Uint8Array): boolean => {
  try {
    ensurePhotosDir()
    fs.writeFileSync(getPhotoPath(photoFileName), Buffer.from(bytes))
    return true
  } catch (err) {
    console.error('Error saving photo:', err)
    return false
  }
}

export const deletePhoto = (photoFileName: string): boolean => {
  try {
    const photoPath = getPhotoPath(photoFileName)
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath)
    }
    return true
  } catch (err) {
    console.error('Error deleting photo:', err)
    return false
  }
}