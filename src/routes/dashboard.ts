// Dashboard & Analytics Routes
import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { generateUUID } from '../utils/crypto';

type Bindings = { DB: D1Database };
const dashboard = new Hono<{ Bindings: Bindings }>();

// GET /api/dashboard/candidate - Candidate dashboard data
dashboard.get('/candidate', authMiddleware(), async (c) => {
  try {
    const user = c.get('user');
    
    // User profile
    const profile = await c.env.DB.prepare(
      'SELECT id, username, full_name, email, role, specialization, verified_status, created_at FROM users WHERE id = ?'
    ).bind(user.sub).first() as any;
    
    // Submissions summary
    const submissionsSummary = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status IN ('submitted','under_review') THEN 1 ELSE 0 END) as pending_review,
        SUM(CASE WHEN status = 'scored' THEN 1 ELSE 0 END) as completed
      FROM submissions WHERE user_id = ?
    `).bind(user.sub).first() as any;
    
    // Best TBCLM record
    const bestTBCLM = await c.env.DB.prepare(`
      SELECT ta.*, sim.title as simulation_title, sim.specialization
      FROM tbclm_axis ta
      JOIN submissions sub ON ta.submission_id = sub.id
      JOIN simulations sim ON sub.simulation_id = sim.id
      WHERE ta.user_id = ?
      ORDER BY ta.hiretx_index DESC
      LIMIT 1
    `).bind(user.sub).first() as any;
    
    // Latest submissions
    const recentSubmissions = await c.env.DB.prepare(`
      SELECT sub.*, sim.title as simulation_title, sim.specialization, sim.difficulty
      FROM submissions sub
      JOIN simulations sim ON sub.simulation_id = sim.id
      WHERE sub.user_id = ?
      ORDER BY sub.created_at DESC
      LIMIT 5
    `).bind(user.sub).all();
    
    // Available simulations - show all active simulations, sorted by specialization match first
    const availableSimulations = await c.env.DB.prepare(`
      SELECT s.*, 
        (SELECT COUNT(*) FROM submissions sub WHERE sub.user_id = ? AND sub.simulation_id = s.id) as attempt_count
      FROM simulations s
      WHERE s.is_active = 1
      ORDER BY 
        CASE WHEN s.specialization = ? THEN 0 ELSE 1 END,
        s.difficulty ASC, s.created_at DESC
    `).bind(user.sub, profile?.specialization || 'none').all();
    
    // Progress over time
    const progressHistory = await c.env.DB.prepare(`
      SELECT ta.hiretx_index, ta.t_score, ta.b_score, ta.c_score, ta.l_score, ta.m_score,
             ta.calculated_at, sim.title as simulation_title
      FROM tbclm_axis ta
      JOIN submissions sub ON ta.submission_id = sub.id
      JOIN simulations sim ON sub.simulation_id = sim.id
      WHERE ta.user_id = ?
      ORDER BY ta.calculated_at ASC
      LIMIT 10
    `).bind(user.sub).all();
    
    let tbclmData = null;
    if (bestTBCLM) {
      tbclmData = {
        T: bestTBCLM.t_score,
        B: bestTBCLM.b_score,
        C: bestTBCLM.c_score,
        L: bestTBCLM.l_score,
        M: bestTBCLM.m_score,
        hiretx_index: bestTBCLM.hiretx_index,
        readiness_level: bestTBCLM.readiness_level,
        strengths: bestTBCLM.strengths ? JSON.parse(bestTBCLM.strengths) : [],
        weaknesses: bestTBCLM.weaknesses ? JSON.parse(bestTBCLM.weaknesses) : [],
        recommendations: bestTBCLM.recommendations ? JSON.parse(bestTBCLM.recommendations) : []
      };
    }
    
    return c.json({
      success: true,
      data: {
        profile,
        stats: submissionsSummary,
        tbclm: tbclmData,
        recent_submissions: recentSubmissions.results,
        available_simulations: availableSimulations.results,
        progress_history: progressHistory.results
      }
    });
  } catch (err) {
    console.error('Candidate dashboard error:', err);
    return c.json({ success: false, message: 'Failed to load dashboard' }, 500);
  }
});

// GET /api/dashboard/admin - Admin dashboard data
dashboard.get('/admin', authMiddleware('admin'), async (c) => {
  try {
    // Total stats
    const stats = await c.env.DB.prepare(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'candidate') as total_candidates,
        (SELECT COUNT(*) FROM users WHERE role = 'evaluator') as total_evaluators,
        (SELECT COUNT(*) FROM simulations WHERE is_active = 1) as active_simulations,
        (SELECT COUNT(*) FROM submissions) as total_submissions,
        (SELECT COUNT(*) FROM submissions WHERE status IN ('submitted','under_review')) as pending_reviews,
        (SELECT ROUND(AVG(hiretx_index), 2) FROM submissions WHERE hiretx_index IS NOT NULL) as avg_hiretx_index,
        (SELECT COUNT(*) FROM submissions WHERE status = 'scored') as scored_submissions
    `).first() as any;
    
    // Distribution by specialization
    const specDistribution = await c.env.DB.prepare(`
      SELECT sim.specialization, COUNT(*) as count, ROUND(AVG(sub.hiretx_index), 2) as avg_score
      FROM submissions sub
      JOIN simulations sim ON sub.simulation_id = sim.id
      WHERE sub.hiretx_index IS NOT NULL
      GROUP BY sim.specialization
    `).all();
    
    // Readiness level distribution
    const readinessDistribution = await c.env.DB.prepare(`
      SELECT readiness_level, COUNT(*) as count
      FROM submissions
      WHERE readiness_level IS NOT NULL
      GROUP BY readiness_level
      ORDER BY count DESC
    `).all();
    
    // TBCLM averages
    const tbclmAverages = await c.env.DB.prepare(`
      SELECT 
        ROUND(AVG(t_score), 2) as avg_T,
        ROUND(AVG(b_score), 2) as avg_B,
        ROUND(AVG(c_score), 2) as avg_C,
        ROUND(AVG(l_score), 2) as avg_L,
        ROUND(AVG(m_score), 2) as avg_M,
        ROUND(AVG(hiretx_index), 2) as avg_hiretx
      FROM tbclm_axis
    `).first() as any;
    
    // Recent registrations
    const recentUsers = await c.env.DB.prepare(`
      SELECT id, username, email, role, specialization, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 10
    `).all();
    
    // Simulation performance
    const simPerformance = await c.env.DB.prepare(`
      SELECT sim.title, sim.specialization, sim.difficulty,
        COUNT(sub.id) as attempt_count,
        ROUND(AVG(sub.hiretx_index), 2) as avg_score,
        ROUND(AVG(sub.auto_score), 2) as avg_auto_score
      FROM simulations sim
      LEFT JOIN submissions sub ON sim.id = sub.simulation_id
      GROUP BY sim.id
      ORDER BY attempt_count DESC
    `).all();
    
    // Score distribution ranges
    const scoreDistribution = await c.env.DB.prepare(`
      SELECT 
        SUM(CASE WHEN hiretx_index >= 90 THEN 1 ELSE 0 END) as range_90_100,
        SUM(CASE WHEN hiretx_index >= 75 AND hiretx_index < 90 THEN 1 ELSE 0 END) as range_75_89,
        SUM(CASE WHEN hiretx_index >= 60 AND hiretx_index < 75 THEN 1 ELSE 0 END) as range_60_74,
        SUM(CASE WHEN hiretx_index < 60 THEN 1 ELSE 0 END) as range_below_60,
        COUNT(*) as total
      FROM submissions WHERE hiretx_index IS NOT NULL
    `).first() as any;
    
    // Recent activity
    const recentActivity = await c.env.DB.prepare(`
      SELECT al.*, u.username
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 15
    `).all();
    
    return c.json({
      success: true,
      data: {
        stats,
        specialization_distribution: specDistribution.results,
        readiness_distribution: readinessDistribution.results,
        tbclm_averages: tbclmAverages,
        recent_users: recentUsers.results,
        simulation_performance: simPerformance.results,
        score_distribution: scoreDistribution,
        recent_audit: recentActivity.results
      }
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    return c.json({ success: false, message: 'Failed to load admin dashboard' }, 500);
  }
});

// GET /api/dashboard/evaluator - Evaluator dashboard data
dashboard.get('/evaluator', authMiddleware('evaluator'), async (c) => {
  try {
    const user = c.get('user');
    
    // Pending submissions
    const pending = await c.env.DB.prepare(`
      SELECT sub.*, sim.title as simulation_title, sim.specialization, sim.difficulty,
             u.username as candidate_username, u.full_name as candidate_name
      FROM submissions sub
      JOIN simulations sim ON sub.simulation_id = sim.id
      JOIN users u ON sub.user_id = u.id
      WHERE sub.status IN ('submitted', 'under_review')
      ORDER BY sub.submitted_at ASC
    `).all();
    
    // My reviewed submissions
    const reviewed = await c.env.DB.prepare(`
      SELECT sub.*, sim.title as simulation_title, u.username as candidate_username
      FROM submissions sub
      JOIN simulations sim ON sub.simulation_id = sim.id
      JOIN users u ON sub.user_id = u.id
      WHERE sub.evaluator_id = ?
      ORDER BY sub.reviewed_at DESC
      LIMIT 20
    `).bind(user.sub).all();
    
    // Stats
    const stats = await c.env.DB.prepare(`
      SELECT
        (SELECT COUNT(*) FROM submissions WHERE status IN ('submitted','under_review')) as pending_count,
        (SELECT COUNT(*) FROM submissions WHERE evaluator_id = ?) as my_reviews,
        (SELECT ROUND(AVG(evaluator_score), 2) FROM submissions WHERE evaluator_id = ? AND evaluator_score IS NOT NULL) as my_avg_score
    `).bind(user.sub, user.sub).first() as any;
    
    return c.json({
      success: true,
      data: {
        stats: {
          total_reviewed: stats?.my_reviews || 0,
          avg_score: stats?.my_avg_score || null,
          pending_count: stats?.pending_count || 0
        },
        pending_submissions: pending.results,
        reviewed_submissions: reviewed.results
      }
    });
  } catch (err) {
    console.error('Evaluator dashboard error:', err);
    return c.json({ success: false, message: 'Failed to load evaluator dashboard' }, 500);
  }
});

// GET /api/dashboard/submission/:id - Full submission detail for evaluation
dashboard.get('/submission/:id', authMiddleware('evaluator'), async (c) => {
  try {
    const subId = c.req.param('id');
    
    const submission = await c.env.DB.prepare(`
      SELECT sub.*, sim.title as simulation_title, sim.scenario_background, sim.instructions,
             sim.specialization, sim.difficulty,
             u.username as candidate_username, u.full_name as candidate_name, u.specialization as candidate_spec
      FROM submissions sub
      JOIN simulations sim ON sub.simulation_id = sim.id
      JOIN users u ON sub.user_id = u.id
      WHERE sub.id = ?
    `).bind(subId).first() as any;
    
    if (!submission) return c.json({ success: false, message: 'Submission not found' }, 404);
    
    const tasks = await c.env.DB.prepare(
      'SELECT * FROM tasks WHERE simulation_id = ? ORDER BY sequence_order'
    ).bind(submission.simulation_id).all();
    
    const scores = await c.env.DB.prepare(
      'SELECT * FROM scores WHERE submission_id = ?'
    ).bind(subId).all();
    
    const rubrics = await c.env.DB.prepare(`
      SELECT r.* FROM rubrics r
      JOIN tasks t ON r.task_id = t.id
      WHERE t.simulation_id = ?
    `).bind(submission.simulation_id).all();
    
    return c.json({
      success: true,
      data: {
        submission: { ...submission, responses: submission.responses ? JSON.parse(submission.responses) : {} },
        simulation: { title: submission.simulation_title, specialization: submission.specialization, difficulty: submission.difficulty, scenario_background: submission.scenario_background, instructions: submission.instructions },
        candidate: { username: submission.candidate_username, full_name: submission.candidate_name, specialization: submission.candidate_spec },
        tasks: tasks.results,
        scores: scores.results,
        rubrics: rubrics.results
      }
    });
  } catch (err) {
    return c.json({ success: false, message: 'Failed to load submission detail' }, 500);
  }
});

// POST /api/dashboard/submission/:id/score - Evaluator scores a submission
dashboard.post('/submission/:id/score', authMiddleware('evaluator'), async (c) => {
  try {
    const user = c.get('user');
    const subId = c.req.param('id');
    const { task_scores, evaluator_score, evaluator_notes, override_tbclm } = await c.req.json();
    
    const submission = await c.env.DB.prepare(
      'SELECT * FROM submissions WHERE id = ? AND status IN (?, ?)'
    ).bind(subId, 'submitted', 'under_review').first() as any;
    
    if (!submission) return c.json({ success: false, message: 'Submission not available for scoring' }, 404);
    
    // Update individual task scores if provided
    if (task_scores && Array.isArray(task_scores)) {
      for (const ts of task_scores) {
        await c.env.DB.prepare(`
          UPDATE scores SET raw_score = ?, normalized_score = ?, scoring_method = 'manual', scorer_notes = ?
          WHERE submission_id = ? AND task_id = ?
        `).bind(ts.score, (ts.score / ts.max_score) * 100, ts.notes || null, subId, ts.task_id).run();
      }
    }
    
    // Calculate final score
    const finalScore = evaluator_score !== undefined ? evaluator_score 
      : submission.auto_score;
    
    await c.env.DB.prepare(`
      UPDATE submissions SET
        status = 'scored',
        evaluator_score = ?,
        final_score = ?,
        evaluator_id = ?,
        evaluator_notes = ?,
        reviewed_at = ?,
        updated_at = ?
      WHERE id = ?
    `).bind(
      evaluator_score || null,
      finalScore,
      user.sub,
      evaluator_notes || null,
      Math.floor(Date.now() / 1000),
      Math.floor(Date.now() / 1000),
      subId
    ).run();
    
    await c.env.DB.prepare(
      `INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details, status) VALUES (?, ?, 'EVALUATE_SUBMISSION', 'submission', ?, ?, 'success')`
    ).bind(generateUUID(), user.sub, subId, JSON.stringify({ evaluator_score, final_score: finalScore })).run();
    
    return c.json({ success: true, message: 'Submission scored successfully', data: { submission_id: subId, final_score: finalScore } });
  } catch (err) {
    console.error('Score submission error:', err);
    return c.json({ success: false, message: 'Failed to score submission' }, 500);
  }
});

// GET /api/dashboard/analytics - Advanced analytics (admin+)
dashboard.get('/analytics', authMiddleware('admin'), async (c) => {
  try {
    const { period = '30' } = c.req.query();
    const daysAgo = Math.floor(Date.now() / 1000) - (parseInt(period) * 86400);
    
    // Skill gap detection - lowest average axis per specialization
    const skillGaps = await c.env.DB.prepare(`
      SELECT sim.specialization,
        ROUND(AVG(ta.t_score), 2) as avg_T,
        ROUND(AVG(ta.b_score), 2) as avg_B,
        ROUND(AVG(ta.c_score), 2) as avg_C,
        ROUND(AVG(ta.l_score), 2) as avg_L,
        ROUND(AVG(ta.m_score), 2) as avg_M,
        COUNT(*) as sample_size
      FROM tbclm_axis ta
      JOIN submissions sub ON ta.submission_id = sub.id
      JOIN simulations sim ON sub.simulation_id = sim.id
      GROUP BY sim.specialization
    `).all();
    
    // Trending simulations
    const trendingSimulations = await c.env.DB.prepare(`
      SELECT sim.title, sim.specialization, COUNT(sub.id) as submissions_count,
             ROUND(AVG(sub.hiretx_index), 2) as avg_score
      FROM simulations sim
      JOIN submissions sub ON sim.id = sub.simulation_id
      WHERE sub.created_at > ?
      GROUP BY sim.id
      ORDER BY submissions_count DESC
    `).bind(daysAgo).all();
    
    // Readiness trends over time
    const readinessTrends = await c.env.DB.prepare(`
      SELECT 
        DATE(submitted_at, 'unixepoch') as date,
        ROUND(AVG(hiretx_index), 2) as avg_score,
        COUNT(*) as count
      FROM submissions
      WHERE submitted_at > ? AND hiretx_index IS NOT NULL
      GROUP BY DATE(submitted_at, 'unixepoch')
      ORDER BY date ASC
    `).bind(daysAgo).all();
    
    // Top performers
    const topPerformers = await c.env.DB.prepare(`
      SELECT u.username, u.specialization,
             MAX(sub.hiretx_index) as best_score,
             COUNT(sub.id) as attempt_count,
             sub.readiness_level
      FROM users u
      JOIN submissions sub ON u.id = sub.user_id
      WHERE sub.hiretx_index IS NOT NULL
      GROUP BY u.id
      ORDER BY best_score DESC
      LIMIT 10
    `).all();
    
    return c.json({
      success: true,
      data: {
        skill_gaps: skillGaps.results,
        trending_simulations: trendingSimulations.results,
        readiness_trends: readinessTrends.results,
        top_performers: topPerformers.results
      }
    });
  } catch (err) {
    console.error('Analytics error:', err);
    return c.json({ success: false, message: 'Failed to load analytics' }, 500);
  }
});

// GET /api/dashboard/report/:userId - Generate report data
dashboard.get('/report/:userId', authMiddleware(), async (c) => {
  try {
    const user = c.get('user');
    const targetUserId = c.req.param('userId');
    
    // Users can only get their own report unless admin/evaluator
    if (user.role === 'candidate' && user.sub !== targetUserId) {
      return c.json({ success: false, message: 'Access denied' }, 403);
    }
    
    const profile = await c.env.DB.prepare(
      'SELECT id, username, full_name, email, specialization, created_at FROM users WHERE id = ?'
    ).bind(targetUserId).first() as any;
    
    if (!profile) return c.json({ success: false, message: 'User not found' }, 404);
    
    const bestResult = await c.env.DB.prepare(`
      SELECT ta.*, sub.submitted_at, sim.title as simulation_title
      FROM tbclm_axis ta
      JOIN submissions sub ON ta.submission_id = sub.id
      JOIN simulations sim ON sub.simulation_id = sim.id
      WHERE ta.user_id = ?
      ORDER BY ta.hiretx_index DESC
      LIMIT 1
    `).bind(targetUserId).first() as any;
    
    const allSubmissions = await c.env.DB.prepare(`
      SELECT sub.hiretx_index, sub.readiness_level, sub.submitted_at, sim.title, sim.specialization
      FROM submissions sub
      JOIN simulations sim ON sub.simulation_id = sim.id
      WHERE sub.user_id = ? AND sub.hiretx_index IS NOT NULL
      ORDER BY sub.submitted_at DESC
    `).bind(targetUserId).all();
    
    // Log report generation
    await c.env.DB.prepare(
      `INSERT INTO reports (id, user_id, report_type, generated_at) VALUES (?, ?, 'individual', ?)`
    ).bind(generateUUID(), targetUserId, Math.floor(Date.now() / 1000)).run();
    
    return c.json({
      success: true,
      data: {
        profile,
        best_result: bestResult ? {
          t_score: bestResult.t_score,
          b_score: bestResult.b_score,
          c_score: bestResult.c_score,
          l_score: bestResult.l_score,
          m_score: bestResult.m_score,
          hiretx_index: bestResult.hiretx_index,
          readiness_level: bestResult.readiness_level,
          strengths: bestResult.strengths ? JSON.parse(bestResult.strengths) : [],
          weaknesses: bestResult.weaknesses ? JSON.parse(bestResult.weaknesses) : [],
          recommendations: bestResult.recommendations ? JSON.parse(bestResult.recommendations) : [],
          simulation_title: bestResult.simulation_title,
          date: bestResult.submitted_at
        } : null,
        submission_history: allSubmissions.results,
        generated_at: Math.floor(Date.now() / 1000)
      }
    });
  } catch (err) {
    console.error('Report error:', err);
    return c.json({ success: false, message: 'Failed to generate report' }, 500);
  }
});

// GET /api/dashboard/users - Admin user management
dashboard.get('/users', authMiddleware('admin'), async (c) => {
  try {
    const { role, page = '1', limit = '20', search } = c.req.query();
    let query = 'SELECT id, username, email, role, specialization, full_name, verified_status, created_at, last_login, is_active FROM users WHERE 1=1';
    const params: any[] = [];
    
    if (role) { query += ' AND role = ?'; params.push(role); }
    if (search) { query += ' AND (username LIKE ? OR email LIKE ? OR full_name LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    
    query += ' ORDER BY created_at DESC';
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ${parseInt(limit)} OFFSET ${offset}`;
    
    const users = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({ success: true, data: users.results });
  } catch (err) {
    return c.json({ success: false, message: 'Failed to fetch users' }, 500);
  }
});

// PUT /api/dashboard/users/:id/role - Update user role
dashboard.put('/users/:id/role', authMiddleware('admin'), async (c) => {
  try {
    const user = c.get('user');
    const targetId = c.req.param('id');
    const { role } = await c.req.json();
    
    const validRoles = ['candidate', 'evaluator', 'admin', 'super_admin'];
    if (!validRoles.includes(role)) return c.json({ success: false, message: 'Invalid role' }, 400);
    
    await c.env.DB.prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?')
      .bind(role, Math.floor(Date.now() / 1000), targetId).run();
    
    await c.env.DB.prepare(
      `INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details, status) VALUES (?, ?, 'UPDATE_USER_ROLE', 'user', ?, ?, 'success')`
    ).bind(generateUUID(), user.sub, targetId, JSON.stringify({ new_role: role })).run();
    
    return c.json({ success: true, message: 'User role updated successfully' });
  } catch (err) {
    return c.json({ success: false, message: 'Failed to update user role' }, 500);
  }
});

export default dashboard;
