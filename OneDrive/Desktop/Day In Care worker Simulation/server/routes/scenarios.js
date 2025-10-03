const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

// Get all available scenarios
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, title, description, difficulty, module, estimated_time
       FROM scenarios
       ORDER BY id`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    res.status(500).json({ error: 'Server error fetching scenarios' });
  }
});

// Get scenario details including care plan
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get scenario info
    const scenarioResult = await db.query(
      'SELECT * FROM scenarios WHERE id = $1',
      [id]
    );

    if (scenarioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Scenario not found' });
    }

    // Get care plan
    const carePlanResult = await db.query(
      'SELECT * FROM care_plans WHERE scenario_id = $1',
      [id]
    );

    // Get scenario nodes
    const nodesResult = await db.query(
      'SELECT * FROM scenario_nodes WHERE scenario_id = $1',
      [id]
    );

    // Get all choices for these nodes
    const nodeIds = nodesResult.rows.map(node => node.id);
    let choices = [];

    if (nodeIds.length > 0) {
      const choicesResult = await db.query(
        `SELECT sc.*, sn.node_key as parent_node_key
         FROM scenario_choices sc
         JOIN scenario_nodes sn ON sc.node_id = sn.id
         WHERE sc.node_id = ANY($1)`,
        [nodeIds]
      );
      choices = choicesResult.rows;
    }

    res.json({
      scenario: scenarioResult.rows[0],
      carePlan: carePlanResult.rows[0] || null,
      nodes: nodesResult.rows,
      choices
    });

  } catch (error) {
    console.error('Error fetching scenario details:', error);
    res.status(500).json({ error: 'Server error fetching scenario details' });
  }
});

// Start a new scenario session
router.post('/:id/start', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if scenario exists
    const scenarioCheck = await db.query(
      'SELECT id FROM scenarios WHERE id = $1',
      [id]
    );

    if (scenarioCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Scenario not found' });
    }

    // Create new progress entry
    const result = await db.query(
      `INSERT INTO user_progress (user_id, scenario_id, current_node_key, client_status, wellbeing)
       VALUES ($1, $2, 'start', 50, 50)
       RETURNING id, current_node_key, client_status, wellbeing`,
      [userId, id]
    );

    res.json({
      progressId: result.rows[0].id,
      currentNodeKey: result.rows[0].current_node_key,
      clientStatus: result.rows[0].client_status,
      wellbeing: result.rows[0].wellbeing
    });

  } catch (error) {
    console.error('Error starting scenario:', error);
    res.status(500).json({ error: 'Server error starting scenario' });
  }
});

// Make a decision in a scenario
router.post('/progress/:progressId/decide', authenticateToken, async (req, res) => {
  try {
    const { progressId } = req.params;
    const { choiceId } = req.body;
    const userId = req.user.userId;

    // Verify progress belongs to user
    const progressCheck = await db.query(
      'SELECT * FROM user_progress WHERE id = $1 AND user_id = $2',
      [progressId, userId]
    );

    if (progressCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    const progress = progressCheck.rows[0];

    // Get the choice and related node info
    const choiceResult = await db.query(
      `SELECT sc.*, sn.client_status_impact, sn.wellbeing_impact, sn.is_ending
       FROM scenario_choices sc
       JOIN scenario_nodes sn ON sc.next_node_key = sn.node_key AND sn.scenario_id = $1
       WHERE sc.id = $2`,
      [progress.scenario_id, choiceId]
    );

    if (choiceResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid choice' });
    }

    const choice = choiceResult.rows[0];

    // Record the decision
    await db.query(
      `INSERT INTO user_decisions (progress_id, choice_id)
       VALUES ($1, $2)`,
      [progressId, choiceId]
    );

    // Update progress meters
    const newClientStatus = Math.max(0, Math.min(100, progress.client_status + choice.client_status_impact));
    const newWellbeing = Math.max(0, Math.min(100, progress.wellbeing + choice.wellbeing_impact));

    // Update progress
    await db.query(
      `UPDATE user_progress
       SET current_node_key = $1, client_status = $2, wellbeing = $3, completed_at = $4
       WHERE id = $5`,
      [choice.next_node_key, newClientStatus, newWellbeing,
       choice.is_ending ? new Date() : null, progressId]
    );

    res.json({
      nextNodeKey: choice.next_node_key,
      clientStatus: newClientStatus,
      wellbeing: newWellbeing,
      isEnding: choice.is_ending,
      feedback: choice.feedback_text,
      isBestPractice: choice.is_best_practice,
      isValidAlternative: choice.is_valid_alternative
    });

  } catch (error) {
    console.error('Error recording decision:', error);
    res.status(500).json({ error: 'Server error recording decision' });
  }
});

// Get user's progress for a scenario
router.get('/progress/:progressId', authenticateToken, async (req, res) => {
  try {
    const { progressId } = req.params;
    const userId = req.user.userId;

    const result = await db.query(
      `SELECT up.*, s.title as scenario_title
       FROM user_progress up
       JOIN scenarios s ON up.scenario_id = s.id
       WHERE up.id = $1 AND up.user_id = $2`,
      [progressId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Server error fetching progress' });
  }
});

// Get user's completed scenarios
router.get('/user/completed', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await db.query(
      `SELECT up.id, up.completed_at, s.title, s.module, up.client_status, up.wellbeing
       FROM user_progress up
       JOIN scenarios s ON up.scenario_id = s.id
       WHERE up.user_id = $1 AND up.completed_at IS NOT NULL
       ORDER BY up.completed_at DESC`,
      [userId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching completed scenarios:', error);
    res.status(500).json({ error: 'Server error fetching completed scenarios' });
  }
});

module.exports = router;
