import { Resume, IResume } from './resume.model';
import { Types } from 'mongoose';

export class ResumeService {
  // Create a new resume
  static async createResume(userId: string, data: Partial<IResume>): Promise<IResume> {
    const resume = await Resume.create({
      ...data,
      userId: new Types.ObjectId(userId),
    });
    return resume;
  }

  // Get all resumes for a user
  static async getUserResumes(userId: string): Promise<IResume[]> {
    const resumes = await Resume.find({ userId: new Types.ObjectId(userId) })
      .sort({ updatedAt: -1 });
    return resumes;
  }

  // Get a single resume by ID
  static async getResumeById(resumeId: string, userId: string): Promise<IResume | null> {
    const resume = await Resume.findOne({
      _id: new Types.ObjectId(resumeId),
      userId: new Types.ObjectId(userId),
    });
    return resume;
  }

  // Update a resume
  static async updateResume(
    resumeId: string,
    userId: string,
    data: Partial<IResume>
  ): Promise<IResume | null> {
    const resume = await Resume.findOneAndUpdate(
      {
        _id: new Types.ObjectId(resumeId),
        userId: new Types.ObjectId(userId),
      },
      { $set: data },
      { new: true }
    );
    return resume;
  }

  // Delete a resume
  static async deleteResume(resumeId: string, userId: string): Promise<boolean> {
    const result = await Resume.deleteOne({
      _id: new Types.ObjectId(resumeId),
      userId: new Types.ObjectId(userId),
    });
    return result.deletedCount > 0;
  }

  // Get public resumes (for viewing other users' resumes)
  static async getPublicResume(userId: string): Promise<IResume | null> {
    const resume = await Resume.findOne({
      userId: new Types.ObjectId(userId),
      isPublic: true,
    }).sort({ updatedAt: -1 });
    return resume;
  }
}
