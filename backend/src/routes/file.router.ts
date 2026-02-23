// src/routes/file.router.ts
import { Router } from 'express';
import { uploadFile } from '../controllers/file.controller.js';
import { upload } from '../lib/storage.js';
import { authenticate } from '../middleware/auth.middleware.js';

const fileRouter = Router();

fileRouter.post('/', authenticate, upload.single('files'), uploadFile);

export default fileRouter;
