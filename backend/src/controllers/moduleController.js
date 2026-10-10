import { LearningModule } from '../models/LearningModule.js';
import { Topic } from '../models/Topic.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';
import { recordModuleViewed, recordModuleCompleted } from '../services/progressService.js';
import { Progress } from '../models/Progress.js';

export const getAllModules = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      topic,
      difficultyLevel,
      search = '',
      isPublished,
      instructor
    } = req.query;

    const query = {};

    if (!req.user || req.user.role === 'learner') {
      query.isPublished = true;
    } else if (isPublished !== undefined) {
      query.isPublished = isPublished === 'true';
    }

    if (topic) {
      query.topic = topic;
    }

    if (difficultyLevel) {
      query.difficultyLevel = difficultyLevel;
    }

    if (instructor) {
      query.createdBy = instructor;
    } else if (req.user && req.user.role === 'instructor' && req.query.myOnly === 'true') {
      query.createdBy = req.user._id;
    }

    if (search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { shortDescription: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [total, modules] = await Promise.all([
      LearningModule.countDocuments(query),
      LearningModule.find(query)
        .populate('topic', 'title slug category iconName')
        .populate('createdBy', 'name email role')
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean()
    ]);

    // If authenticated learner, attach completion flag
    let completedModuleIds = new Set();
    if (req.user && req.user.role === 'learner') {
      const progress = await Progress.findOne({ user: req.user._id });
      if (progress) {
        completedModuleIds = new Set(progress.completedModules.map((m) => m.module.toString()));
      }
    }

    const result = modules.map((m) => ({
      ...m,
      isCompleted: completedModuleIds.has(m._id.toString())
    }));

    return sendPaginated(res, 'Modules retrieved successfully', result, {
      total,
      page: pageNum,
      limit: limitNum
    });
  } catch (error) {
    next(error);
  }
};

export const getModuleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { slug: id };

    const moduleDoc = await LearningModule.findOne(query)
      .populate('topic', 'title slug category iconName')
      .populate('createdBy', 'name email role')
      .lean();

    if (!moduleDoc) {
      return sendError(res, 'Learning module not found', 404);
    }

    if (!moduleDoc.isPublished && (!req.user || req.user.role === 'learner')) {
      return sendError(res, 'This module is not currently published', 403);
    }

    let isCompleted = false;
    if (req.user) {
      if (req.user.role === 'learner') {
        await recordModuleViewed(req.user._id, moduleDoc._id);
        const progress = await Progress.findOne({ user: req.user._id });
        if (progress) {
          isCompleted = progress.completedModules.some((m) => m.module.toString() === moduleDoc._id.toString());
        }
      }
    }

    return sendSuccess(res, 'Module retrieved successfully', {
      ...moduleDoc,
      isCompleted
    });
  } catch (error) {
    next(error);
  }
};

export const completeModule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const moduleDoc = await LearningModule.findById(id);

    if (!moduleDoc) {
      return sendError(res, 'Learning module not found', 404);
    }

    const updatedProgress = await recordModuleCompleted(req.user._id, moduleDoc._id);

    return sendSuccess(res, 'Module completed successfully! Progress recorded.', {
      moduleId: moduleDoc._id,
      completedAt: new Date(),
      totalCompleted: updatedProgress.completedModules.length
    });
  } catch (error) {
    next(error);
  }
};

export const createModule = async (req, res, next) => {
  try {
    const {
      title,
      topic,
      shortDescription,
      learningObjectives,
      contentSections,
      estimatedReadingTime,
      difficultyLevel,
      order,
      isPublished
    } = req.body;

    const topicExists = await Topic.findById(topic);
    if (!topicExists) {
      return sendError(res, 'Topic not found', 404);
    }

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existing = await LearningModule.findOne({ slug });
    if (existing) {
      return sendError(res, 'A module with a similar title already exists.', 409);
    }

    const newModule = await LearningModule.create({
      title,
      slug,
      topic,
      shortDescription,
      learningObjectives,
      contentSections,
      estimatedReadingTime,
      difficultyLevel,
      order,
      isPublished: isPublished !== undefined ? isPublished : true,
      createdBy: req.user._id
    });

    return sendSuccess(res, 'Learning module created successfully', newModule, 201);
  } catch (error) {
    next(error);
  }
};

export const updateModule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const moduleDoc = await LearningModule.findById(id);

    if (!moduleDoc) {
      return sendError(res, 'Learning module not found', 404);
    }

    // Role verification: Admin can update any; Instructor can only update their own
    if (req.user.role === 'instructor' && moduleDoc.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, 'Forbidden. You can only update modules you created.', 403);
    }

    const {
      title,
      topic,
      shortDescription,
      learningObjectives,
      contentSections,
      estimatedReadingTime,
      difficultyLevel,
      order,
      isPublished
    } = req.body;

    if (title && title !== moduleDoc.title) {
      moduleDoc.title = title;
      moduleDoc.slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    if (topic !== undefined) moduleDoc.topic = topic;
    if (shortDescription !== undefined) moduleDoc.shortDescription = shortDescription;
    if (learningObjectives !== undefined) moduleDoc.learningObjectives = learningObjectives;
    if (contentSections !== undefined) moduleDoc.contentSections = contentSections;
    if (estimatedReadingTime !== undefined) moduleDoc.estimatedReadingTime = estimatedReadingTime;
    if (difficultyLevel !== undefined) moduleDoc.difficultyLevel = difficultyLevel;
    if (order !== undefined) moduleDoc.order = order;
    if (isPublished !== undefined) moduleDoc.isPublished = isPublished;

    await moduleDoc.save();
    return sendSuccess(res, 'Learning module updated successfully', moduleDoc);
  } catch (error) {
    next(error);
  }
};

export const deleteModule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const moduleDoc = await LearningModule.findById(id);

    if (!moduleDoc) {
      return sendError(res, 'Learning module not found', 404);
    }

    if (req.user.role === 'instructor' && moduleDoc.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, 'Forbidden. You can only delete modules you created.', 403);
    }

    await LearningModule.findByIdAndDelete(id);
    return sendSuccess(res, 'Learning module deleted successfully');
  } catch (error) {
    next(error);
  }
};
