import express from 'express';
import { getAllFileMovements, getFileMovements } from '../controllers/fileMovement';
const router = express.Router();

router.get('/', getAllFileMovements);
router.get('/:employeeId', getFileMovements);

export default router;
