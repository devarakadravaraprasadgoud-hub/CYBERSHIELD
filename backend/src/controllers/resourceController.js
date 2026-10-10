import { LearningResource } from '../models/LearningResource.js';
import { ResourceProgress } from '../models/ResourceProgress.js';
import { LearningModule } from '../models/LearningModule.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * Get all published resources for a given module
 * If user is authenticated, attach user's individual progress.
 */
export const getModuleResources = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const { type, search } = req.query;

    const moduleDoc = await LearningModule.findById(moduleId);
    if (!moduleDoc) {
      return sendError(res, 'Learning module not found', 404);
    }

    const filter = { module: moduleId };

    // Learners / unauthenticated only see published resources
    if (!req.user || req.user.role === 'learner') {
      filter.isPublished = true;
    }

    if (type && type !== 'all') {
      filter.type = type;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const resources = await LearningResource.find(filter)
      .sort({ order: 1, createdAt: 1 })
      .populate('topic', 'title slug');

    let userProgressMap = {};
    if (req.user) {
      const progressDocs = await ResourceProgress.find({
        user: req.user._id,
        module: moduleId
      });
      progressDocs.forEach((p) => {
        userProgressMap[p.resource.toString()] = {
          isCompleted: p.isCompleted,
          completionPercentage: p.completionPercentage,
          lastPosition: p.lastPosition,
          lastAccessedAt: p.lastAccessedAt
        };
      });
    }

    const enrichedResources = resources.map((r) => {
      const rObj = r.toObject();
      const userProgress = userProgressMap[r._id.toString()] || {
        isCompleted: false,
        completionPercentage: 0,
        lastPosition: 0
      };
      return {
        ...rObj,
        progress: userProgress
      };
    });

    const totalCount = enrichedResources.length;
    const completedCount = enrichedResources.filter((r) => r.progress.isCompleted).length;
    const overallProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return sendSuccess(res, 'Module visual learning resources retrieved', {
      resources: enrichedResources,
      summary: {
        totalResources: totalCount,
        completedCount,
        overallProgress
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single resource details by ID
 */
export const getResourceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resource = await LearningResource.findById(id)
      .populate('module', 'title slug topic')
      .populate('topic', 'title slug');

    if (!resource) {
      return sendError(res, 'Learning resource not found', 404);
    }

    const resObj = resource.toObject();
    if (req.user) {
      const progress = await ResourceProgress.findOne({
        user: req.user._id,
        resource: id
      });
      resObj.progress = progress
        ? {
            isCompleted: progress.isCompleted,
            completionPercentage: progress.completionPercentage,
            lastPosition: progress.lastPosition,
            lastAccessedAt: progress.lastAccessedAt
          }
        : {
            isCompleted: false,
            completionPercentage: 0,
            lastPosition: 0
          };
    }

    return sendSuccess(res, 'Learning resource retrieved', resObj);
  } catch (error) {
    next(error);
  }
};

/**
 * Save / Update student progress on a learning resource
 */
export const saveResourceProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lastPosition = 0, completionPercentage = 100, isCompleted = true, notes = '' } = req.body;

    const resource = await LearningResource.findById(id);
    if (!resource) {
      return sendError(res, 'Learning resource not found', 404);
    }

    const shouldMarkCompleted = Boolean(isCompleted || completionPercentage >= 90);

    const updateFields = {
      module: resource.module,
      lastPosition,
      completionPercentage: Math.min(100, Math.max(0, completionPercentage)),
      isCompleted: shouldMarkCompleted,
      lastAccessedAt: new Date()
    };

    if (notes) {
      updateFields.notes = notes;
    }

    if (shouldMarkCompleted) {
      updateFields.completedAt = new Date();
    }

    const progress = await ResourceProgress.findOneAndUpdate(
      { user: req.user._id, resource: id },
      { $set: updateFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return sendSuccess(res, 'Resource progress recorded successfully', progress);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all progress records for the authenticated student
 */
export const getMyResourceProgress = async (req, res, next) => {
  try {
    const progressList = await ResourceProgress.find({ user: req.user._id })
      .populate('resource', 'title type duration difficulty thumbnailUrl')
      .populate('module', 'title slug topic')
      .sort({ updatedAt: -1 });

    const totalCompleted = progressList.filter((p) => p.isCompleted).length;

    return sendSuccess(res, 'User visual learning progress retrieved', {
      progress: progressList,
      totalTracked: progressList.length,
      totalCompleted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin/Instructor: List all resources with filters & pagination
 */
export const getAllResourcesAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, module: moduleId, search } = req.query;

    const filter = {};
    if (type && type !== 'all') filter.type = type;
    if (moduleId) filter.module = moduleId;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [resources, total] = await Promise.all([
      LearningResource.find(filter)
        .populate('module', 'title')
        .populate('topic', 'title')
        .populate('createdBy', 'name email')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      LearningResource.countDocuments(filter)
    ]);

    return sendSuccess(res, 'Admin resources retrieved', {
      resources,
      pagination: {
        total,
        page: parseInt(page, 10),
        totalPages: Math.ceil(total / parseInt(limit, 10)),
        limit: parseInt(limit, 10)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin/Instructor: Create new visual learning resource
 */
export const createResource = async (req, res, next) => {
  try {
    const moduleDoc = await LearningModule.findById(req.body.module);
    if (!moduleDoc) {
      return sendError(res, 'Associated learning module does not exist', 400);
    }

    const resourceData = {
      ...req.body,
      topic: req.body.topic || moduleDoc.topic,
      createdBy: req.user._id
    };

    const newResource = await LearningResource.create(resourceData);

    return sendSuccess(res, 'Learning resource created successfully', newResource, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin/Instructor: Update existing visual learning resource
 */
export const updateResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resource = await LearningResource.findById(id);

    if (!resource) {
      return sendError(res, 'Learning resource not found', 404);
    }

    // Role check: Instructors can only update resources they created
    if (req.user.role === 'instructor' && resource.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, 'Unauthorized to modify another instructor’s resource', 403);
    }

    const updated = await LearningResource.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    return sendSuccess(res, 'Learning resource updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin/Instructor: Delete visual learning resource
 */
export const deleteResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resource = await LearningResource.findById(id);

    if (!resource) {
      return sendError(res, 'Learning resource not found', 404);
    }

    if (req.user.role === 'instructor' && resource.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, 'Unauthorized to delete another instructor’s resource', 403);
    }

    await Promise.all([
      LearningResource.findByIdAndDelete(id),
      ResourceProgress.deleteMany({ resource: id })
    ]);

    return sendSuccess(res, 'Learning resource and associated telemetry purged');
  } catch (error) {
    next(error);
  }
};
