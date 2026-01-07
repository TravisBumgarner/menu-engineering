import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'
import log from 'electron-log/main'

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
    log.error('Error saving photo:', err)
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
    log.error('Error deleting photo:', err)
    return false
  }
}

export const getAllPhotos = (): { filename: string; data: Buffer }[] => {
  try {
    if (!fs.existsSync(photosBasePath)) {
      return []
    }

    const files = fs.readdirSync(photosBasePath)
    return files
      .filter((file) => {
        const stat = fs.statSync(path.join(photosBasePath, file))
        return stat.isFile()
      })
      .map((filename) => ({
        filename,
        data: fs.readFileSync(path.join(photosBasePath, filename)),
      }))
  } catch (err) {
    log.error('Error getting all photos:', err)
    return []
  }
}

export const deleteAllPhotos = (): boolean => {
  try {
    if (!fs.existsSync(photosBasePath)) {
      return true
    }

    const files = fs.readdirSync(photosBasePath)
    for (const file of files) {
      const filePath = path.join(photosBasePath, file)
      const stat = fs.statSync(filePath)
      if (stat.isFile()) {
        fs.unlinkSync(filePath)
      }
    }
    return true
  } catch (err) {
    log.error('Error deleting all photos:', err)
    return false
  }
}

export const savePhotosFromZipData = (photos: { filename: string; data: Buffer }[]): boolean => {
  try {
    ensurePhotosDir()
    for (const photo of photos) {
      fs.writeFileSync(getPhotoPath(photo.filename), photo.data)
    }
    return true
  } catch (err) {
    log.error('Error saving photos from zip:', err)
    return false
  }
}
