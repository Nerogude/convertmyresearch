const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get team performance (manager/admin only)
router.get('/team-performance', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { organizationId } = req.user;

    // Get all learners in organization
    const learnersResult = await db.query(
      `SELECT id, first_name, last_name, email, created_at, last_login
       FROM users
       WHERE organization_id = $1 AND role = 'learner'
       ORDER BY last_name, first_name`,
      [organizationId]
    );

    const learners = learnersResult.rows;

    // Get performance data for each learner
    const performanceData = await Promise.all(
      learners.map(async (learner) => {
        // Count completed scenarios
        const completedResult = await db.query(
          `SELECT COUNT(*) as completed_count
           FROM user_progress
           WHERE user_id = $1 AND completed_at IS NOT NULL`,
          [learner.id]
        );

        // Get decision quality stats
        const decisionsResult = await db.query(
          `SELECT
             COUNT(*) FILTER (WHERE sc.is_best_practice = true) as best_practice_count,
             COUNT(*) FILTER (WHERE sc.is_valid_alternative = true) as valid_alternative_count,
             COUNT(*) FILTER (WHERE sc.is_best_practice = false AND sc.is_valid_alternative = false) as suboptimal_count,
             COUNT(*) as total_decisions
           FROM user_decisions ud
           JOIN user_progress up ON ud.progress_id = up.id
           JOIN scenario_choices sc ON ud.choice_id = sc.id
           WHERE up.user_id = $1`,
          [learner.id]
        );

        // Get average final scores
        const scoresResult = await db.query(
          `SELECT
             AVG(client_status) as avg_client_status,
             AVG(wellbeing) as avg_wellbeing
           FROM user_progress
           WHERE user_id = $1 AND completed_at IS NOT NULL`,
          [learner.id]
        );

        const decisions = decisionsResult.rows[0];
        const scores = scoresResult.rows[0];

        return {
          userId: learner.id,
          name: `${learner.first_name} ${learner.last_name}`,
          email: learner.email,
          lastLogin: learner.last_login,
          scenariosCompleted: parseInt(completedResult.rows[0].completed_count),
          totalDecisions: parseInt(decisions.total_decisions),
          bestPracticeDecisions: parseInt(decisions.best_practice_count),
          validAlternativeDecisions: parseInt(decisions.valid_alternative_count),
          suboptimalDecisions: parseInt(decisions.suboptimal_count),
          avgClientStatus: scores.avg_client_status ? parseFloat(scores.avg_client_status).toFixed(1) : null,
          avgWellbeing: scores.avg_wellbeing ? parseFloat(scores.avg_wellbeing).toFixed(1) : null
        };
      })
    );

    res.json(performanceData);

  } catch (error) {
    console.error('Error fetching team performance:', error);
    res.status(500).json({ error: 'Server error fetching team performance' });
  }
});

// Get individual learner detailed report (manager/admin only)
router.get('/learner/:learnerId', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { learnerId } = req.params;
    const { organizationId } = req.user;

    // Verify learner belongs to same organization
    const learnerCheck = await db.query(
      `SELECT id, first_name, last_name, email
       FROM users
       WHERE id = $1 AND organization_id = $2 AND role = 'learner'`,
      [learnerId, organizationId]
    );

    if (learnerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Learner not found' });
    }

    const learner = learnerCheck.rows[0];

    // Get completed scenarios with details
    const scenariosResult = await db.query(
      `SELECT
         s.title,
         s.module,
         up.started_at,
         up.completed_at,
         up.client_status,
         up.wellbeing,
         (SELECT COUNT(*) FROM user_decisions ud
          JOIN scenario_choices sc ON ud.choice_id = sc.id
          WHERE ud.progress_id = up.id AND sc.is_best_practice = true) as best_practice_count,
         (SELECT COUNT(*) FROM user_decisions ud
          JOIN scenario_choices sc ON ud.choice_id = sc.id
          WHERE ud.progress_id = up.id AND sc.is_valid_alternative = true) as valid_alternative_count,
         (SELECT COUNT(*) FROM user_decisions ud WHERE ud.progress_id = up.id) as total_decisions
       FROM user_progress up
       JOIN scenarios s ON up.scenario_id = s.id
       WHERE up.user_id = $1 AND up.completed_at IS NOT NULL
       ORDER BY up.completed_at DESC`,
      [learnerId]
    );

    res.json({
      learner: {
        id: learner.id,
        name: `${learner.first_name} ${learner.last_name}`,
        email: learner.email
      },
      scenarios: scenariosResult.rows
    });

  } catch (error) {
    console.error('Error fetching learner report:', error);
    res.status(500).json({ error: 'Server error fetching learner report' });
  }
});

// Get organization overview stats (admin only)
router.get('/organization-overview', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { organizationId } = req.user;

    // Total users
    const usersResult = await db.query(
      `SELECT
         COUNT(*) FILTER (WHERE role = 'learner') as learner_count,
         COUNT(*) FILTER (WHERE role = 'manager') as manager_count
       FROM users WHERE organization_id = $1`,
      [organizationId]
    );

    // Total scenarios completed
    const completedResult = await db.query(
      `SELECT COUNT(*) as total_completed
       FROM user_progress up
       JOIN users u ON up.user_id = u.id
       WHERE u.organization_id = $1 AND up.completed_at IS NOT NULL`,
      [organizationId]
    );

    // Most completed scenario
    const popularResult = await db.query(
      `SELECT s.title, COUNT(*) as completion_count
       FROM user_progress up
       JOIN scenarios s ON up.scenario_id = s.id
       JOIN users u ON up.user_id = u.id
       WHERE u.organization_id = $1 AND up.completed_at IS NOT NULL
       GROUP BY s.id, s.title
       ORDER BY completion_count DESC
       LIMIT 1`,
      [organizationId]
    );

    res.json({
      learnerCount: parseInt(usersResult.rows[0].learner_count),
      managerCount: parseInt(usersResult.rows[0].manager_count),
      totalScenariosCompleted: parseInt(completedResult.rows[0].total_completed),
      mostPopularScenario: popularResult.rows[0] || null
    });

  } catch (error) {
    console.error('Error fetching organization overview:', error);
    res.status(500).json({ error: 'Server error fetching overview' });
  }
});

module.exports = router;
