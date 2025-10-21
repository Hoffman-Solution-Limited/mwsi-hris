import express from 'express';
import {
  applyForLeave,
  getLeaves,
  getLeaveById,
  updateLeave,
  deleteLeave,
  managerApproveLeave,
  managerRejectLeave,
  getPendingApprovalsForManager,
  hrApproveLeave,
  hrRejectLeave,
  getPendingApprovalsForHR,
  getLeaveBalance,
  getUsedLeaveDays,
  getAllLeaveBalance
} from '../controllers/leaves';

const router = express.Router();

router.get('/', getLeaves);
router.get('/balances', getAllLeaveBalance);
router.get('/balance/:employee_id', getLeaveBalance);
router.get('/used/:employee_id/:leave_type_id', getUsedLeaveDays);
router.get('/manager/:managerId/pending', getPendingApprovalsForManager);
router.get('/hr/pending', getPendingApprovalsForHR);
router.patch('/:id/manager/approve', managerApproveLeave);
router.patch('/:id/manager/reject', managerRejectLeave);
router.patch('/:id/hr/approve', hrApproveLeave);
router.patch('/:id/hr/reject', hrRejectLeave);
router.post('/', applyForLeave);
router.put('/:id', updateLeave);
router.delete('/:id', deleteLeave);
router.get('/:id', getLeaveById);


export default router;
