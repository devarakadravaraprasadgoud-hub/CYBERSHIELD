import { AttackSimulation } from '../models/AttackSimulation.js';
import { SimulationSession } from '../models/SimulationSession.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * Generate slug from title
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

/**
 * Public/Learner: Get all published simulations with category and difficulty filters
 */
export const getSimulations = async (req, res, next) => {
  try {
    const { category, difficulty, search } = req.query;

    const query = { isPublished: true };
    if (category && category !== 'all') {
      query.category = category;
    }
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const simulations = await AttackSimulation.find(query)
      .select('title slug description category difficulty estimatedDuration icon learningObjectives isPublished order createdAt')
      .sort({ order: 1, createdAt: -1 });

    // If user is authenticated, attach their completion status
    let userSessionsMap = {};
    if (req.user) {
      const userSessions = await SimulationSession.find({
        user: req.user._id,
        simulation: { $in: simulations.map((s) => s._id) }
      });
      userSessions.forEach((sess) => {
        userSessionsMap[sess.simulation.toString()] = {
          isCompleted: sess.isCompleted,
          score: sess.score,
          mode: sess.mode,
          currentStageIndex: sess.currentStageIndex
        };
      });
    }

    const simulationsWithProgress = simulations.map((sim) => {
      const simObj = sim.toObject();
      simObj.userProgress = userSessionsMap[sim._id.toString()] || null;
      return simObj;
    });

    return sendSuccess(res, 'Attack simulations retrieved successfully', simulationsWithProgress);
  } catch (error) {
    next(error);
  }
};

/**
 * Public/Learner: Get single simulation by ID or slug
 */
export const getSimulationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { slug: id };

    const simulation = await AttackSimulation.findOne(query);
    if (!simulation) {
      return sendError(res, 'Simulation scenario not found', 404);
    }

    const simObj = simulation.toObject();

    // Attach user session if authenticated
    if (req.user) {
      const session = await SimulationSession.findOne({
        user: req.user._id,
        simulation: simulation._id
      });
      simObj.userSession = session || null;
    }

    return sendSuccess(res, 'Simulation details retrieved', simObj);
  } catch (error) {
    next(error);
  }
};

/**
 * Learner: Start or retrieve simulation session
 */
export const startOrGetSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { mode = 'attack' } = req.body;

    const simulation = await AttackSimulation.findById(id);
    if (!simulation) {
      return sendError(res, 'Simulation not found', 404);
    }

    let session = await SimulationSession.findOne({
      user: req.user._id,
      simulation: simulation._id
    });

    if (!session) {
      session = await SimulationSession.create({
        user: req.user._id,
        simulation: simulation._id,
        mode,
        currentStageIndex: 0,
        completedStageIds: [],
        decisions: [],
        score: 0,
        isCompleted: false,
        lastAccessedAt: new Date()
      });
    } else {
      session.lastAccessedAt = new Date();
      if (mode && session.mode !== mode) {
        session.mode = mode;
      }
      await session.save();
    }

    return sendSuccess(res, 'Simulation session active', session);
  } catch (error) {
    next(error);
  }
};

/**
 * Learner: Update session progress (stage, mode, decision checkpoint)
 */
export const updateSessionProgress = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { mode, currentStageIndex, completedStageId, decision } = req.body;

    const session = await SimulationSession.findOne({
      _id: sessionId,
      user: req.user._id
    });

    if (!session) {
      return sendError(res, 'Simulation session not found', 404);
    }

    if (mode) session.mode = mode;
    if (typeof currentStageIndex === 'number') {
      session.currentStageIndex = currentStageIndex;
    }

    if (completedStageId && !session.completedStageIds.includes(completedStageId)) {
      session.completedStageIds.push(completedStageId);
    }

    if (decision && decision.selectedOptionId) {
      // Check if already answered this question
      const existingIdx = session.decisions.findIndex((d) => d.question === decision.question);
      if (existingIdx >= 0) {
        session.decisions[existingIdx] = {
          question: decision.question,
          selectedOptionId: decision.selectedOptionId,
          isCorrect: decision.isCorrect,
          explanation: decision.explanation || '',
          answeredAt: new Date()
        };
      } else {
        session.decisions.push({
          question: decision.question,
          selectedOptionId: decision.selectedOptionId,
          isCorrect: decision.isCorrect,
          explanation: decision.explanation || '',
          answeredAt: new Date()
        });
      }
    }

    session.lastAccessedAt = new Date();
    await session.save();

    return sendSuccess(res, 'Session progress saved successfully', session);
  } catch (error) {
    next(error);
  }
};

/**
 * Learner: Complete simulation session
 */
export const completeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { score } = req.body;

    const session = await SimulationSession.findOne({
      _id: sessionId,
      user: req.user._id
    });

    if (!session) {
      return sendError(res, 'Simulation session not found', 404);
    }

    // Calculate score from decisions if not specified
    let finalScore = score !== undefined ? score : 100;
    if (session.decisions.length > 0 && score === undefined) {
      const correct = session.decisions.filter((d) => d.isCorrect).length;
      finalScore = Math.round((correct / session.decisions.length) * 100);
    }

    session.isCompleted = true;
    session.score = finalScore;
    session.completedAt = new Date();
    session.lastAccessedAt = new Date();
    await session.save();

    return sendSuccess(res, 'Simulation marked as completed', session);
  } catch (error) {
    next(error);
  }
};

/**
 * Learner: Get all personal simulation progress records
 */
export const getMySimulationProgress = async (req, res, next) => {
  try {
    const sessions = await SimulationSession.find({ user: req.user._id })
      .populate('simulation', 'title category difficulty estimatedDuration icon')
      .sort({ updatedAt: -1 });

    const totalSimulations = await AttackSimulation.countDocuments({ isPublished: true });
    const completedCount = sessions.filter((s) => s.isCompleted).length;

    return sendSuccess(res, 'Learner simulation telemetry retrieved', {
      sessions,
      totalSimulations,
      completedCount,
      masteryPercentage: totalSimulations > 0 ? Math.round((completedCount / totalSimulations) * 100) : 0
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get all simulations (including drafts)
 */
export const getAllSimulationsAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, category, search } = req.query;

    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [simulations, total] = await Promise.all([
      AttackSimulation.find(filter)
        .populate('createdBy', 'name email')
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      AttackSimulation.countDocuments(filter)
    ]);

    return sendSuccess(res, 'Admin simulations retrieved', {
      simulations,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Create new simulation scenario
 */
export const createSimulation = async (req, res, next) => {
  try {
    const slug = slugify(req.body.title);

    const existing = await AttackSimulation.findOne({ slug });
    if (existing) {
      return sendError(res, 'A simulation with this title or slug already exists', 400);
    }

    const simulation = await AttackSimulation.create({
      ...req.body,
      slug,
      createdBy: req.user._id
    });

    return sendSuccess(res, 'Simulation scenario authored successfully', simulation, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update existing simulation
 */
export const updateSimulation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const simulation = await AttackSimulation.findById(id);
    if (!simulation) {
      return sendError(res, 'Simulation scenario not found', 404);
    }

    if (req.body.title && req.body.title !== simulation.title) {
      req.body.slug = slugify(req.body.title);
    }

    const updated = await AttackSimulation.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    return sendSuccess(res, 'Simulation scenario updated', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Delete simulation scenario and wipe sessions
 */
export const deleteSimulation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const simulation = await AttackSimulation.findById(id);
    if (!simulation) {
      return sendError(res, 'Simulation scenario not found', 404);
    }

    await Promise.all([
      AttackSimulation.findByIdAndDelete(id),
      SimulationSession.deleteMany({ simulation: id })
    ]);

    return sendSuccess(res, 'Simulation scenario and associated telemetry deleted');
  } catch (error) {
    next(error);
  }
};
