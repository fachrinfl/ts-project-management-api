import fs from 'fs';
import multer from 'multer';
import path from 'path';

const uploadDir = path.join(__dirname, '../../tmp');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.originalname.replace(/\s/g, '')}`;
    cb(null, filename);
  },
});

export const upload = multer({ storage });
