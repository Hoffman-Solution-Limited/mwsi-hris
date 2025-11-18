import express from 'express';
import { requestFile, approveRequest, rejectRequest, getAllFileRequests, getFileRequestsByStatus, returnFile, getFileRequestsByEmployee } from '../controllers/fileRequest';
const router = express.Router();

router.post('/', requestFile);
router.put('/:requestId/approve', approveRequest);
router.put('/:requestId/reject', rejectRequest);
router.put('/:requestId/return', returnFile);
router.get('/status', getFileRequestsByStatus); 
router.get('/', getAllFileRequests);
router.get('/:employeeId', getFileRequestsByEmployee);


export default router;