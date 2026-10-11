const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
const allowedTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    const uniqueSuffix = `${Date.now()}-${require('crypto').randomBytes(8).toString('hex')}`;
    cb(null, `sig-${uniqueSuffix}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname || '').toLowerCase();
  if (allowedTypes.has(file.mimetype) && allowedExtensions.has(extension)) {
    return cb(null, true);
  }
  const error = new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed.');
  error.status = 400;
  return cb(error);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number.parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024,
    files: 1,
  },
});

// MIME type and extension can be spoofed by a client, so verify the image signature too.
const validateSignatureImage = async (req, res, next) => {
  if (!req.file) return next();

  let handle;
  try {
    handle = await fs.promises.open(req.file.path, 'r');
    const header = Buffer.alloc(12);
    const { bytesRead } = await handle.read(header, 0, header.length, 0);
    await handle.close();
    handle = null;

    const bytes = header.subarray(0, bytesRead);
    const isJpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const isPng = bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const isGif = bytes.length >= 6 && ['GIF87a', 'GIF89a'].includes(bytes.toString('ascii', 0, 6));
    const isWebp = bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';

    if (!(isJpeg || isPng || isGif || isWebp)) {
      await fs.promises.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ message: 'The uploaded file is not a supported image.' });
    }
    return next();
  } catch (error) {
    if (handle) await handle.close().catch(() => {});
    await fs.promises.unlink(req.file.path).catch(() => {});
    return next(error);
  }
};

module.exports = upload;
module.exports.validateSignatureImage = validateSignatureImage;
