import express from 'express';
import { createEmployee, deleteEmployee, getAllEmployees, getSingleEmployee, updateEmployee } from '../controllers/employee';

const router = express.Router();

router.get('/',getAllEmployees)
router.get('/:id',getSingleEmployee)
router.post('/',createEmployee)
router.put('/:id',updateEmployee)
router.delete('/:id',deleteEmployee)

export default router;