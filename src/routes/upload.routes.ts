// import React from 'react';
import { Router } from 'express';
const router = Router();
// import { upload } from '../controllers/auth.controller';
import { importExcelCustomers } from '../controllers/auth.controller';
import multer from 'multer';
// Set up multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('file'); /
// import multer from 'multer';
// import { importExcelCustomers } from '../controllers/upload.controller';
// import { requireAuth } from '../middlewares/auth.middleware';


router.post('/import/customers', upload, importExcelCustomers);


