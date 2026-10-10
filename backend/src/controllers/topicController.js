import { Topic } from '../models/Topic.js';
import { LearningModule } from '../models/LearningModule.js';
import { Quiz } from '../models/Quiz.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';

export const getAllTopics = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category,
      difficultyLevel,
      isPublished
    } = req.query;

    const query = {};

    // Learner or unauthenticated visitors only see published topics
    if (!req.user || req.user.role === 'learner') {
      query.isPublished = true;
    } else if (isPublished !== undefined) {
      query.isPublished = isPublished === 'true';
    }

    if (category) {
      query.category = category;
    }

    if (difficultyLevel) {
      query.difficultyLevel = difficultyLevel;
    }

    if (search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { category: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [total, topics] = await Promise.all([
      Topic.countDocuments(query),
      Topic.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name email role')
        .lean()
    ]);

    // Attach counts for learning modules and quizzes
    const topicsWithCounts = await Promise.all(
      topics.map(async (topic) => {
        const [moduleCount, quizCount] = await Promise.all([
          LearningModule.countDocuments({ topic: topic._id, isPublished: true }),
          Quiz.countDocuments({ topic: topic._id, isPublished: true })
        ]);
        return {
          ...topic,
          moduleCount,
          quizCount
        };
      })
    );

    return sendPaginated(res, 'Topics retrieved successfully', topicsWithCounts, {
      total,
      page: pageNum,
      limit: limitNum
    });
  } catch (error) {
    next(error);
  }
};

export const getTopicById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { slug: id };

    const topic = await Topic.findOne(query).populate('createdBy', 'name email role').lean();
    if (!topic) {
      return sendError(res, 'Topic not found', 404);
    }

    // Check visibility for unpublished topic
    if (!topic.isPublished && (!req.user || req.user.role === 'learner')) {
      return sendError(res, 'Topic is currently unpublished', 403);
    }

    const [modules, quizzes] = await Promise.all([
      LearningModule.find({
        topic: topic._id,
        ...(!req.user || req.user.role === 'learner' ? { isPublished: true } : {})
      })
        .select('title slug shortDescription difficultyLevel estimatedReadingTime order isPublished')
        .sort({ order: 1 }),
      Quiz.find({
        topic: topic._id,
        ...(!req.user || req.user.role === 'learner' ? { isPublished: true } : {})
      })
        .select('title description difficultyLevel timeLimitMinutes passPercentage isPublished')
        .sort({ createdAt: -1 })
    ]);

    return sendSuccess(res, 'Topic retrieved successfully', {
      ...topic,
      modules,
      quizzes
    });
  } catch (error) {
    next(error);
  }
};

export const createTopic = async (req, res, next) => {
  try {
    const { title, description, category, difficultyLevel, thumbnailUrl, iconName, isPublished } = req.body;

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existing = await Topic.findOne({ slug });
    if (existing) {
      return sendError(res, 'A topic with a similar title already exists.', 409);
    }

    const topic = await Topic.create({
      title,
      slug,
      description,
      category,
      difficultyLevel,
      thumbnailUrl,
      iconName,
      isPublished: isPublished !== undefined ? isPublished : true,
      createdBy: req.user._id
    });

    return sendSuccess(res, 'Topic created successfully', topic, 201);
  } catch (error) {
    next(error);
  }
};

export const updateTopic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const topic = await Topic.findById(id);

    if (!topic) {
      return sendError(res, 'Topic not found', 404);
    }

    const { title, description, category, difficultyLevel, thumbnailUrl, iconName, isPublished } = req.body;

    if (title && title !== topic.title) {
      topic.title = title;
      topic.slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    if (description !== undefined) topic.description = description;
    if (category !== undefined) topic.category = category;
    if (difficultyLevel !== undefined) topic.difficultyLevel = difficultyLevel;
    if (thumbnailUrl !== undefined) topic.thumbnailUrl = thumbnailUrl;
    if (iconName !== undefined) topic.iconName = iconName;
    if (isPublished !== undefined) topic.isPublished = isPublished;

    await topic.save();
    return sendSuccess(res, 'Topic updated successfully', topic);
  } catch (error) {
    next(error);
  }
};

export const deleteTopic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const topic = await Topic.findById(id);

    if (!topic) {
      return sendError(res, 'Topic not found', 404);
    }

    // Clean up dependent modules and quizzes
    await Promise.all([
      LearningModule.deleteMany({ topic: id }),
      Quiz.deleteMany({ topic: id }),
      Topic.findByIdAndDelete(id)
    ]);

    return sendSuccess(res, 'Topic and its associated modules and quizzes deleted successfully');
  } catch (error) {
    next(error);
  }
};
