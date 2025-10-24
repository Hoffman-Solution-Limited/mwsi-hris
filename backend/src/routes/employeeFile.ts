import express from 'express';
import { createEmployeeFile, getAllEmployeeFiles, getFileByEmployee, updateEmployeeFile } from '../controllers/employeeFile';
const router = express.Router();

router.post('/', createEmployeeFile);
router.get('/:employeeId', getFileByEmployee);
router.put('/:id', updateEmployeeFile);
router.get('/', getAllEmployeeFiles);

export default router;
