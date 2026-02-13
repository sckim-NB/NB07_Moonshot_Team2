import { Request, Response, NextFunction } from 'express';

export const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '파일이 업로드되지 않았습니다.' });
    }

    const filePath = `/uploads/profiles/${req.file.filename}`;

    return res.status(200).json({
      message: '파일 업로드 성공',
      url: filePath,
    });
  } catch (error) {
    return next(error);
  }
};
