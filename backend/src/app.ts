// Express app initialization
import express, { Express } from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import eventRoutes from "./modules/events/event.routes";
import postRoutes from "./modules/posts/post.routes";
import storyRoutes from "./modules/posts/story.routes";
import notificationRoutes from "./modules/notifications/notification.routes";
import chatRoutes from "./modules/chat/chat.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import networkRoutes from "./modules/network/network.routes";
import jobsRoutes from "./modules/jobs/jobs.routes";
import resumeRoutes from "./modules/resumes/resume.routes";

const app: Express = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/network", networkRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/resumes", resumeRoutes);

export default app;
