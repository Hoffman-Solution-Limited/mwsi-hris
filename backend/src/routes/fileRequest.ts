import express from 'express';
import { requestFile, approveRequest, rejectRequest, getAllFileRequests } from '../controllers/fileRequest';
const router = express.Router();

router.post('/', requestFile);
router.put('/:requestId/approve', approveRequest);
router.put('/:requestId/reject', rejectRequest);
router.get('/', getAllFileRequests);

export default router;
