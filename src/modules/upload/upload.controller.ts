import { Request, Response } from 'express';
import fs from 'fs';
import { uploadToCloudinary } from './upload.service';

export const uploadFile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const file = req.file;
    const folder = req.body.folder;

    if (!file) {
      res.status(400).json({ message: 'File is required' });
      return;
    }

    const result = await uploadToCloudinary(file.path, folder);

    fs.unlink(file.path, (err) => {
      if (err) console.error('Failed to delete file:', err);
    });

    res.status(200).json({
      message: 'File uploaded successfully',
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Upload failed' });
  }
};
