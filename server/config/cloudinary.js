import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const useCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn('⚠ Cloudinary keys not set; saving uploaded images to server/uploads instead.');
}

// Local fallback: files are written here and served at /uploads by server.js
export const UPLOAD_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'uploads');

// Pick a file extension from the image's magic bytes so it is served with the right type
function imageExt(buf) {
  const hex = buf.subarray(0, 12).toString('hex');
  if (hex.startsWith('89504e47')) return '.png';
  if (hex.startsWith('ffd8ff')) return '.jpg';
  if (hex.startsWith('47494638')) return '.gif';
  if (hex.startsWith('52494646') && buf.subarray(8, 12).toString() === 'WEBP') return '.webp';
  return '.jpg';
}

async function saveLocally(buffer, folder) {
  const dir = path.join(UPLOAD_DIR, folder);
  await fs.mkdir(dir, { recursive: true });
  const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${imageExt(buffer)}`;
  await fs.writeFile(path.join(dir, name), buffer);
  const base = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${base}/uploads/${folder}/${name}`;
}

// Uploads an in-memory buffer (from multer) and resolves to the image URL.
export function uploadBuffer(buffer, folder = 'uniform-exchange') {
  if (!useCloudinary) return saveLocally(buffer, folder);
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });
}
