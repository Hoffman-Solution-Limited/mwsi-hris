import express from 'express';
import { upload } from '../middleware/upload';
import {
  uploadEmployeeDocument,
  getAllEmployeeDocuments,
  getEmployeeDocumentsByEmployeeId,
  getSingleEmployeeDocument,
  updateEmployeeDocument,
  deleteEmployeeDocument
} from '../controllers/employeeDocument';

const router = express.Router();

router.post('/:document_id/upload', upload.single('file'), uploadEmployeeDocument);
router.get('/', getAllEmployeeDocuments);
router.get('/employee/:employee_id', getEmployeeDocumentsByEmployeeId);
router.get('/:id', getSingleEmployeeDocument);
router.put('/:id', updateEmployeeDocument);
router.delete('/:id', deleteEmployeeDocument);

export default router;
