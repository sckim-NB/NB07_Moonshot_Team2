// src/routes/file.router.ts
import { Router } from 'express';
import { uploadFile } from '../controllers/file.controller';
import { upload } from '../lib/storage';
import { authenticate } from '../middleware/auth.middleware';

const fileRouter = Router();

fileRouter.post('/', authenticate, upload.single('files'), uploadFile);

export default fileRouter;
