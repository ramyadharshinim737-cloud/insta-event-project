import { Request, Response } from 'express';
import jobsService from './jobs.service';

export class JobsController {
  // Get all jobs
  async getJobs(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = {
        type: req.query.type as string,
        level: req.query.level as string,
        location: req.query.location as string,
        company: req.query.company as string,
      };

      const result = await jobsService.getJobs(page, limit, filters);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error('Get jobs error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch jobs',
      });
    }
  }

  // Get job by ID
  async getJobById(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;

      const job = await jobsService.getJobById(jobId);

      if (!job) {
        res.status(404).json({
          success: false,
          error: 'Job not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        job,
      });
    } catch (error: any) {
      console.error('Get job by ID error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch job',
      });
    }
  }

  // Create job
  async createJob(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const jobData = req.body;

      const job = await jobsService.createJob(jobData, userId);

      res.status(201).json({
        success: true,
        job,
        message: 'Job created successfully',
      });
    } catch (error: any) {
      console.error('Create job error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create job',
      });
    }
  }

  // Update job
  async updateJob(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { jobId } = req.params;
      const updates = req.body;

      const job = await jobsService.updateJob(jobId, userId, updates);

      res.status(200).json({
        success: true,
        job,
        message: 'Job updated successfully',
      });
    } catch (error: any) {
      console.error('Update job error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update job',
      });
    }
  }

  // Delete job
  async deleteJob(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { jobId } = req.params;

      const deleted = await jobsService.deleteJob(jobId, userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Job not found or unauthorized',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Job deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete job error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete job',
      });
    }
  }

  // Apply for job
  async applyForJob(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { jobId } = req.params;
      const { coverLetter, resume } = req.body;

      const application = await jobsService.applyForJob(jobId, userId, {
        coverLetter,
        resume,
      });

      res.status(201).json({
        success: true,
        application,
        message: 'Application submitted successfully',
      });
    } catch (error: any) {
      console.error('Apply for job error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to submit application',
      });
    }
  }

  // Get user's applications
  async getUserApplications(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await jobsService.getUserApplications(userId, page, limit);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error('Get user applications error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch applications',
      });
    }
  }

  // Get applications for a job
  async getJobApplications(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { jobId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await jobsService.getJobApplications(jobId, userId, page, limit);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error('Get job applications error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch job applications',
      });
    }
  }

  // Update application status
  async updateApplicationStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { applicationId } = req.params;
      const { status } = req.body;

      const application = await jobsService.updateApplicationStatus(
        applicationId,
        userId,
        status
      );

      res.status(200).json({
        success: true,
        application,
        message: 'Application status updated successfully',
      });
    } catch (error: any) {
      console.error('Update application status error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update application status',
      });
    }
  }

  // Search jobs
  async searchJobs(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query) {
        res.status(400).json({
          success: false,
          error: 'Search query is required',
        });
        return;
      }

      const result = await jobsService.searchJobs(query, page, limit);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error('Search jobs error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to search jobs',
      });
    }
  }

  // Save job
  async saveJob(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { jobId } = req.params;

      const savedJob = await jobsService.saveJob(jobId, userId);

      res.status(200).json({
        success: true,
        savedJob,
        message: 'Job saved successfully',
      });
    } catch (error: any) {
      console.error('Save job error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to save job',
      });
    }
  }

  // Unsave job
  async unsaveJob(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { jobId } = req.params;

      await jobsService.unsaveJob(jobId, userId);

      res.status(200).json({
        success: true,
        message: 'Job removed from saved',
      });
    } catch (error: any) {
      console.error('Unsave job error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to unsave job',
      });
    }
  }

  // Get saved jobs
  async getSavedJobs(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await jobsService.getSavedJobs(userId, page, limit);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error('Get saved jobs error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch saved jobs',
      });
    }
  }
}

export default new JobsController();
