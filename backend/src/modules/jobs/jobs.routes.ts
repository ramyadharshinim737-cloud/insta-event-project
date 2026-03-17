import { Router } from 'express';
import jobsController from './jobs.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', jobsController.getJobs.bind(jobsController));
router.get('/search', jobsController.searchJobs.bind(jobsController));
router.get('/:jobId', jobsController.getJobById.bind(jobsController));

// Protected routes (require authentication)
router.post('/', authMiddleware, jobsController.createJob.bind(jobsController));
router.put('/:jobId', authMiddleware, jobsController.updateJob.bind(jobsController));
router.delete('/:jobId', authMiddleware, jobsController.deleteJob.bind(jobsController));

// Application routes
router.post('/:jobId/apply', authMiddleware, jobsController.applyForJob.bind(jobsController));
router.get('/applications/my-applications', authMiddleware, jobsController.getUserApplications.bind(jobsController));
router.get('/:jobId/applications', authMiddleware, jobsController.getJobApplications.bind(jobsController));
router.put('/applications/:applicationId/status', authMiddleware, jobsController.updateApplicationStatus.bind(jobsController));

// Saved jobs routes
router.post('/:jobId/save', authMiddleware, jobsController.saveJob.bind(jobsController));
router.delete('/:jobId/save', authMiddleware, jobsController.unsaveJob.bind(jobsController));
router.get('/saved/my-saved-jobs', authMiddleware, jobsController.getSavedJobs.bind(jobsController));

export default router;
