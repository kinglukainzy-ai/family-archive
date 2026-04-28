const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const processImage = async (filePath) => {
  const ext = path.extname(filePath);
  const dir = path.dirname(filePath);
  const basename = path.basename(filePath, ext);
  
  const thumbPath = path.join(dir, `${basename}_thumb.jpg`);
  const originalProcessedPath = path.join(dir, `${basename}_processed.jpg`);

  // Generate thumbnail
  await sharp(filePath)
    .resize(300, 300, { fit: 'cover' })
    .toFormat('jpeg')
    .jpeg({ quality: 85 })
    .toFile(thumbPath);

  // Process original (resize if too large, compress)
  await sharp(filePath)
    .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
    .toFormat('jpeg')
    .jpeg({ quality: 85 })
    .toFile(originalProcessedPath);

  // Optional: delete original upload if you want to save space
  // fs.unlinkSync(filePath);

  return {
    url: originalProcessedPath,
    thumbnailUrl: thumbPath
  };
};

module.exports = { processImage };
