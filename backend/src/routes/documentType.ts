import express from 'express';
import { createDocumentType, deleteDocumentType, getDocumentType, getDocumentTypes, updateDocumentType } from '../controllers/documentType';

const router = express.Router();

router.post('/', createDocumentType);
router.get('/', getDocumentTypes);
router.put('/:id', updateDocumentType);
router.get('/:id', getDocumentType);
router.delete('/:id', deleteDocumentType);

export default router;
