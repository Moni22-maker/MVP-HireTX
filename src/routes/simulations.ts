// Simulations Routes
import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { generateUUID } from '../utils/crypto';
import { scoreTextResponse, calculateTBCLMFromTaskScores, computeFullHireTXResult } from '../services/scoringEngine';

type Bindings = { DB: D1Database };
const simulations = new Hono<{ Bindings: Bindings }>();

// GET /api/simulations - List all active simulations
simulations.get('/', authMiddleware(), async (c) => {
  try {
    const user = c.get('user');
    const { specialization, difficulty, page = '1', limit = '20' } = c.req.query();
    
    let query = `SELECT s.*, u.username as creator_name,
      (SELECT COUNT(*) FROM submissions sub WHERE sub.simulation_id = s.id AND sub.hiretx_index IS NOT NULL) as completion_count,
      (SELECT ROUND(AVG(sub.hiretx_index),1) FROM submissions sub WHERE sub.simulation_id = s.id AND sub.hiretx_index IS NOT NULL) as avg_score
      FROM simulations s JOIN users u ON s.created_by = u.id WHERE s.is_active = 1`;
    const params: any[] = [];
    
    if (specialization) {
      query += ' AND s.specialization = ?';
      params.push(specialization);
    }
    
    if (difficulty) {
      query += ' AND s.difficulty = ?';
      params.push(difficulty);
    }
    
    // Candidates only see their specialization unless none set
    if (user.role === 'candidate' && !specialization) {
      const userData = await c.env.DB.prepare('SELECT specialization FROM users WHERE id = ?').bind(user.sub).first() as any;
      if (userData?.specialization && userData.specialization !== 'none') {
        query += ' AND s.specialization = ?';
        params.push(userData.specialization);
      }
    }
    
    query += ' ORDER BY s.difficulty ASC, s.created_at ASC';
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ${parseInt(limit)} OFFSET ${offset}`;
    
    const results = await c.env.DB.prepare(query).bind(...params).all();
    return c.json({ success: true, data: results.results, total: results.results.length });
  } catch (err) {
    console.error('List simulations error:', err);
    return c.json({ success: false, message: 'Failed to fetch simulations' }, 500);
  }
});

// GET /api/simulations/:id - Get simulation with tasks
simulations.get('/:id', authMiddleware(), async (c) => {
  try {
    const simId = c.req.param('id');
    const sim = await c.env.DB.prepare('SELECT * FROM simulations WHERE id = ? AND is_active = 1').bind(simId).first() as any;
    if (!sim) return c.json({ success: false, message: 'Simulation not found' }, 404);
    
    const tasks = await c.env.DB.prepare(
      'SELECT * FROM tasks WHERE simulation_id = ? ORDER BY sequence_order ASC'
    ).bind(simId).all();
    
    return c.json({ success: true, data: { ...sim, tasks: tasks.results } });
  } catch (err) {
    return c.json({ success: false, message: 'Failed to fetch simulation' }, 500);
  }
});

// POST /api/simulations - Create simulation (admin+)
simulations.post('/', authMiddleware('admin'), async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const { title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, tasks: taskList } = body;
    
    if (!title || !description || !specialization) {
      return c.json({ success: false, message: 'Title, description and specialization are required' }, 400);
    }
    
    const simId = generateUUID();
    await c.env.DB.prepare(`
      INSERT INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(simId, title, description, specialization, difficulty || 'intermediate', time_limit || 3600, passing_score || 60, instructions || '', scenario_background || '', user.sub).run();
    
    if (taskList && Array.isArray(taskList)) {
      for (const task of taskList) {
        const taskId = generateUUID();
        await c.env.DB.prepare(`
          INSERT INTO tasks (id, simulation_id, title, description, task_type, sequence_order, time_limit, max_score, instructions, context_data, options, correct_option, keywords, tbclm_axis, weight)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(taskId, simId, task.title, task.description, task.task_type || 'text_response', task.sequence_order || 1, task.time_limit || null, task.max_score || 100, task.instructions || '', JSON.stringify(task.context_data || {}), task.options ? JSON.stringify(task.options) : null, task.correct_option || null, task.keywords ? JSON.stringify(task.keywords) : null, task.tbclm_axis || 'T', task.weight || 1.0).run();
      }
    }
    
    return c.json({ success: true, message: 'Simulation created successfully', data: { id: simId } }, 201);
  } catch (err) {
    console.error('Create simulation error:', err);
    return c.json({ success: false, message: 'Failed to create simulation' }, 500);
  }
});

// POST /api/simulations/:id/start
simulations.post('/:id/start', authMiddleware(), async (c) => {
  try {
    const user = c.get('user');
    const simId = c.req.param('id');
    
    const sim = await c.env.DB.prepare('SELECT * FROM simulations WHERE id = ? AND is_active = 1').bind(simId).first() as any;
    if (!sim) return c.json({ success: false, message: 'Simulation not found' }, 404);
    
    const attemptCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM submissions WHERE user_id = ? AND simulation_id = ?'
    ).bind(user.sub, simId).first() as any;
    
    if ((attemptCount?.count || 0) >= sim.max_attempts) {
      return c.json({ success: false, message: `Maximum attempts (${sim.max_attempts}) reached` }, 409);
    }
    
    const existing = await c.env.DB.prepare(
      'SELECT id FROM submissions WHERE user_id = ? AND simulation_id = ? AND status = ?'
    ).bind(user.sub, simId, 'in_progress').first();
    
    if (existing) {
      return c.json({ success: true, message: 'Resuming existing attempt', data: { submission_id: (existing as any).id, is_resume: true } });
    }
    
    const subId = generateUUID();
    const attemptNum = (attemptCount?.count || 0) + 1;
    
    await c.env.DB.prepare(`
      INSERT INTO submissions (id, user_id, simulation_id, attempt_number, status, responses, started_at)
      VALUES (?, ?, ?, ?, 'in_progress', '{}', ?)
    `).bind(subId, user.sub, simId, attemptNum, Math.floor(Date.now() / 1000)).run();
    
    await c.env.DB.prepare(
      `INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details, status) VALUES (?, ?, 'START_SIMULATION', 'simulation', ?, ?, 'success')`
    ).bind(generateUUID(), user.sub, simId, JSON.stringify({ attempt: attemptNum, submission_id: subId })).run();
    
    return c.json({ success: true, message: 'Simulation started', data: { submission_id: subId, attempt_number: attemptNum } }, 201);
  } catch (err) {
    console.error('Start simulation error:', err);
    return c.json({ success: false, message: 'Failed to start simulation' }, 500);
  }
});

// POST /api/simulations/:id/submit
simulations.post('/:id/submit', authMiddleware(), async (c) => {
  try {
    const user = c.get('user');
    const simId = c.req.param('id');
    const { submission_id, responses, time_taken } = await c.req.json();
    
    const submission = await c.env.DB.prepare(
      'SELECT * FROM submissions WHERE id = ? AND user_id = ? AND status = ?'
    ).bind(submission_id, user.sub, 'in_progress').first() as any;
    
    if (!submission) return c.json({ success: false, message: 'Active submission not found' }, 404);
    
    const tasks = await c.env.DB.prepare(
      'SELECT * FROM tasks WHERE simulation_id = ? ORDER BY sequence_order'
    ).bind(simId).all();
    
    const rubrics = await c.env.DB.prepare(
      `SELECT r.* FROM rubrics r JOIN tasks t ON r.task_id = t.id WHERE t.simulation_id = ?`
    ).bind(simId).all();
    
    const rubricMap: Record<string, any[]> = {};
    (rubrics.results as any[]).forEach(r => {
      if (!rubricMap[r.task_id]) rubricMap[r.task_id] = [];
      rubricMap[r.task_id].push(r);
    });
    
    const taskScores: { axis: string; score: number; maxScore: number }[] = [];
    let totalAutoScore = 0;
    let taskCount = 0;
    
    for (const task of tasks.results as any[]) {
      const response = responses[task.id];
      if (!response) continue;
      
      let taskScore = 0;
      let scoreMethod = 'auto';
      
      if (task.task_type === 'multiple_choice') {
        taskScore = response === task.correct_option ? task.max_score : Math.round(task.max_score * 0.2);
      } else {
        const taskRubrics = rubricMap[task.id] || [];
        const kw = task.keywords ? JSON.parse(task.keywords) : [];
        if (taskRubrics.length > 0) {
          let rubricTotal = 0;
          let totalWeight = 0;
          for (const rubric of taskRubrics) {
            const posKw = rubric.keywords_positive ? JSON.parse(rubric.keywords_positive) : [];
            const negKw = rubric.keywords_negative ? JSON.parse(rubric.keywords_negative) : [];
            const { score } = scoreTextResponse(response.toString(), posKw, negKw, rubric.max_points);
            rubricTotal += score * rubric.weight;
            totalWeight += rubric.weight;
          }
          taskScore = totalWeight > 0 ? (rubricTotal / totalWeight) * (task.max_score / 10) : 0;
        } else {
          const { score } = scoreTextResponse(response.toString(), kw, [], task.max_score);
          taskScore = score;
        }
        scoreMethod = 'ai_assisted';
      }
      
      await c.env.DB.prepare(`
        INSERT INTO scores (id, submission_id, task_id, user_id, raw_score, max_score, normalized_score, tbclm_axis, scoring_method)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(generateUUID(), submission_id, task.id, user.sub, taskScore, task.max_score, (taskScore / task.max_score) * 100, task.tbclm_axis, scoreMethod).run();
      
      taskScores.push({ axis: task.tbclm_axis, score: taskScore, maxScore: task.max_score });
      totalAutoScore += (taskScore / task.max_score) * 100;
      taskCount++;
    }
    
    const avgAutoScore = taskCount > 0 ? totalAutoScore / taskCount : 0;
    const tbclmScores = calculateTBCLMFromTaskScores(taskScores as any);
    const userData = await c.env.DB.prepare('SELECT specialization FROM users WHERE id = ?').bind(user.sub).first() as any;
    const result = computeFullHireTXResult(tbclmScores, userData?.specialization || 'computer_science');
    
    await c.env.DB.prepare(`
      UPDATE submissions SET
        status = 'submitted', responses = ?, submitted_at = ?, time_taken = ?,
        auto_score = ?, tbclm_breakdown = ?, hiretx_index = ?, readiness_level = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      JSON.stringify(responses), Math.floor(Date.now() / 1000), time_taken || null,
      Math.round(avgAutoScore * 100) / 100, JSON.stringify(tbclmScores),
      result.hireTXIndex, result.readinessLevel, Math.floor(Date.now() / 1000), submission_id
    ).run();
    
    await c.env.DB.prepare(`
      INSERT INTO tbclm_axis (id, user_id, submission_id, t_score, b_score, c_score, l_score, m_score, hiretx_index, readiness_level, strengths, weaknesses, recommendations)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      generateUUID(), user.sub, submission_id,
      tbclmScores.T, tbclmScores.B, tbclmScores.C, tbclmScores.L, tbclmScores.M,
      result.hireTXIndex, result.readinessLevel,
      JSON.stringify(result.strengths), JSON.stringify(result.weaknesses), JSON.stringify(result.recommendations)
    ).run();
    
    await c.env.DB.prepare(
      `INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details, status) VALUES (?, ?, 'SUBMIT_SIMULATION', 'submission', ?, ?, 'success')`
    ).bind(generateUUID(), user.sub, submission_id, JSON.stringify({ hiretx_index: result.hireTXIndex })).run();
    
    return c.json({
      success: true,
      message: 'Simulation submitted successfully',
      data: {
        submission_id,
        auto_score: Math.round(avgAutoScore * 100) / 100,
        hiretx_index: result.hireTXIndex,
        readiness_level: result.readinessLevel,
        tbclm_breakdown: tbclmScores,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        recommendations: result.recommendations,
        axis_details: result.axisDetails
      }
    });
  } catch (err) {
    console.error('Submit simulation error:', err);
    return c.json({ success: false, message: 'Failed to submit simulation' }, 500);
  }
});

export default simulations;
