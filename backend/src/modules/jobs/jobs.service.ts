import Job, { IJob } from './job.model';
import JobApplication, { IJobApplication } from './job-application.model';
import SavedJob, { ISavedJob } from './saved-job.model';
import mongoose from 'mongoose';

export class JobsService {
  // Get all active jobs with pagination
  async getJobs(
    page: number = 1,
    limit: number = 20,
    filters?: {
      type?: string;
      level?: string;
      location?: string;
      company?: string;
    }
  ): Promise<{ jobs: IJob[]; total: number; page: number; totalPages: number }> {
    const query: any = { status: 'active' };

    // Apply filters
    if (filters?.type) query.type = filters.type;
    if (filters?.level) query.level = filters.level;
    if (filters?.location) query.location = { $regex: filters.location, $options: 'i' };
    if (filters?.company) query.company = { $regex: filters.company, $options: 'i' };

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('postedBy', 'name email')
        .sort({ postedDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(query),
    ]);

    return {
      jobs: jobs as unknown as IJob[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get job by ID
  async getJobById(jobId: string): Promise<IJob | null> {
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      throw new Error('Invalid job ID');
    }

    const job = await Job.findById(jobId)
      .populate('postedBy', 'name email')
      .populate('applicants', 'name email')
      .lean();

    return job as IJob | null;
  }

  // Create a new job
  async createJob(jobData: Partial<IJob>, userId: string): Promise<IJob> {
    const job = new Job({
      ...jobData,
      postedBy: userId,
      postedDate: new Date(),
      status: 'active',
    });

    await job.save();
    return job;
  }

  // Update job
  async updateJob(jobId: string, userId: string, updates: Partial<IJob>): Promise<IJob | null> {
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      throw new Error('Invalid job ID');
    }

    const job = await Job.findOne({ _id: jobId, postedBy: userId });

    if (!job) {
      throw new Error('Job not found or unauthorized');
    }

    Object.assign(job, updates);
    await job.save();

    return job;
  }

  // Delete job
  async deleteJob(jobId: string, userId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      throw new Error('Invalid job ID');
    }

    const result = await Job.deleteOne({ _id: jobId, postedBy: userId });
    return result.deletedCount > 0;
  }

  // Apply for a job
  async applyForJob(
    jobId: string,
    userId: string,
    applicationData?: { coverLetter?: string; resume?: string }
  ): Promise<IJobApplication> {
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      throw new Error('Invalid job ID');
    }

    // Check if job exists and is active
    const job = await Job.findOne({ _id: jobId, status: 'active' });
    if (!job) {
      throw new Error('Job not found or not active');
    }

    // Check if user already applied
    const existingApplication = await JobApplication.findOne({
      job: jobId,
      applicant: userId,
    });

    if (existingApplication) {
      throw new Error('You have already applied for this job');
    }

    // Create application
    const application = new JobApplication({
      job: jobId,
      applicant: userId,
      coverLetter: applicationData?.coverLetter,
      resume: applicationData?.resume,
      status: 'pending',
    });

    await application.save();

    // Add applicant to job's applicants array
    await Job.findByIdAndUpdate(jobId, {
      $addToSet: { applicants: userId },
    });

    return application;
  }

  // Get user's applications
  async getUserApplications(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ applications: IJobApplication[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      JobApplication.find({ applicant: userId })
        .populate('job')
        .sort({ appliedDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      JobApplication.countDocuments({ applicant: userId }),
    ]);

    return {
      applications: applications as unknown as IJobApplication[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get applications for a job (for job poster)
  async getJobApplications(
    jobId: string,
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ applications: IJobApplication[]; total: number; page: number; totalPages: number }> {
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      throw new Error('Invalid job ID');
    }

    // Verify user owns the job
    const job = await Job.findOne({ _id: jobId, postedBy: userId });
    if (!job) {
      throw new Error('Job not found or unauthorized');
    }

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      JobApplication.find({ job: jobId })
        .populate('applicant', 'name email')
        .sort({ appliedDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      JobApplication.countDocuments({ job: jobId }),
    ]);

    return {
      applications: applications as unknown as IJobApplication[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Update application status
  async updateApplicationStatus(
    applicationId: string,
    userId: string,
    status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted'
  ): Promise<IJobApplication | null> {
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      throw new Error('Invalid application ID');
    }

    const application = await JobApplication.findById(applicationId).populate('job');

    if (!application) {
      throw new Error('Application not found');
    }

    // Verify user owns the job
    const job = application.job as any;
    if (job.postedBy.toString() !== userId) {
      throw new Error('Unauthorized');
    }

    application.status = status;
    await application.save();

    return application;
  }

  // Search jobs
  async searchJobs(
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ jobs: IJob[]; total: number; page: number; totalPages: number }> {
    const searchQuery = {
      status: 'active',
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { company: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
      ],
    };

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find(searchQuery)
        .populate('postedBy', 'name email')
        .sort({ postedDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(searchQuery),
    ]);

    return {
      jobs: jobs as unknown as IJob[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Save job
  async saveJob(jobId: string, userId: string): Promise<ISavedJob> {
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      throw new Error('Invalid job ID');
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    // Check if already saved
    const existingSave = await SavedJob.findOne({ user: userId, job: jobId });
    if (existingSave) {
      return existingSave;
    }

    const savedJob = await SavedJob.create({
      user: userId,
      job: jobId,
    });

    return savedJob;
  }

  // Unsave job
  async unsaveJob(jobId: string, userId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      throw new Error('Invalid job ID');
    }

    const result = await SavedJob.findOneAndDelete({ user: userId, job: jobId });
    if (!result) {
      throw new Error('Saved job not found');
    }
  }

  // Get saved jobs
  async getSavedJobs(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ savedJobs: any[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [savedJobs, total] = await Promise.all([
      SavedJob.find({ user: userId })
        .populate('job')
        .sort({ savedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SavedJob.countDocuments({ user: userId }),
    ]);

    return {
      savedJobs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export default new JobsService();
