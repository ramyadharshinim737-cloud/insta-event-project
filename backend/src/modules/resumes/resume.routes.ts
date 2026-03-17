import { Router } from 'express';
import { ResumeController } from './resume.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// All resume routes require authentication
router.use(authMiddleware);

// Create a new resume
router.post('/', ResumeController.createResume);

// Get all resumes for authenticated user
router.get('/', ResumeController.getUserResumes);

// Get a single resume by ID
router.get('/:id', ResumeController.getResumeById);

// Update a resume
router.put('/:id', ResumeController.updateResume);

// Delete a resume
router.delete('/:id', ResumeController.deleteResume);

// Get public resume of another user
router.get('/public/:userId', ResumeController.getPublicResume);

export default router;
