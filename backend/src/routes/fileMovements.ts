import express from 'express';
import { getFileMovements, returnFileToRegistry } from '../controllers/fileMovement';
const router = express.Router();

router.get('/:employeeId', getFileMovements);
router.post('/:fileId/return', returnFileToRegistry);

export default router;
