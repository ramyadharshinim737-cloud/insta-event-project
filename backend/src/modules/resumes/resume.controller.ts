import { Request, Response } from 'express';
import { ResumeService } from './resume.service';

export class ResumeController {
  // Create a new resume
  static async createResume(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const resume = await ResumeService.createResume(userId, req.body);
      res.status(201).json(resume);
    } catch (error: any) {
      console.error('Error creating resume:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get all resumes for the authenticated user
  static async getUserResumes(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const resumes = await ResumeService.getUserResumes(userId);
      res.status(200).json(resumes);
    } catch (error: any) {
      console.error('Error fetching resumes:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get a single resume by ID
  static async getResumeById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { id } = req.params;
      const resume = await ResumeService.getResumeById(id, userId);

      if (!resume) {
        res.status(404).json({ error: 'Resume not found' });
        return;
      }

      res.status(200).json(resume);
    } catch (error: any) {
      console.error('Error fetching resume:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Update a resume
  static async updateResume(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { id } = req.params;
      const resume = await ResumeService.updateResume(id, userId, req.body);

      if (!resume) {
        res.status(404).json({ error: 'Resume not found' });
        return;
      }

      res.status(200).json(resume);
    } catch (error: any) {
      console.error('Error updating resume:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Delete a resume
  static async deleteResume(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { id } = req.params;
      const deleted = await ResumeService.deleteResume(id, userId);

      if (!deleted) {
        res.status(404).json({ error: 'Resume not found' });
        return;
      }

      res.status(200).json({ message: 'Resume deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting resume:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get public resume of another user
  static async getPublicResume(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const resume = await ResumeService.getPublicResume(userId);

      if (!resume) {
        res.status(404).json({ error: 'Public resume not found' });
        return;
      }

      res.status(200).json(resume);
    } catch (error: any) {
      console.error('Error fetching public resume:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
