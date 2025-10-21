import express from 'express';
import { createLeaveType, deleteLeaveType, getLeaveTypeById, getLeaveTypes, updateLeaveType } from '../controllers/leaveTypes';

const router = express.Router();

router.get('/', getLeaveTypes);
router.get('/:id', getLeaveTypeById);
router.post('/', createLeaveType);
router.put('/:id', updateLeaveType);
router.delete('/:id', deleteLeaveType);

export default router;
