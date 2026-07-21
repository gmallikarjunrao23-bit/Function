const express = require('express');
const { prisma } = require('../utils/db');
const router = express.Router();

router.get('/:workspaceId', async (req, res) => {
  try {
    const clusters = await prisma.cluster.findMany({
      where: { workspaceId: req.params.workspaceId },
      include: {
        _count: { select: { tickets: true, suggestions: true } },
        suggestions: true,
      },
      orderBy: { impactScore: 'desc' },
    });

    const suggestions = await prisma.suggestion.findMany({
      where: { workspaceId: req.params.workspaceId },
      include: { cluster: true },
      orderBy: [{ priority: 'asc' }, { impact: 'desc' }],
    });

    const stats = {
      totalTickets: await prisma.ticket.count({ where: { workspaceId: req.params.workspaceId } }),
      totalClusters: clusters.length,
      totalSuggestions: suggestions.length,
      avgImpact: clusters.length
        ? clusters.reduce((sum, c) => sum + c.impactScore, 0) / clusters.length
        : 0,
    };

    res.json({ success: true, clusters, suggestions, stats });
  } catch (err) {
    console.error('GET /analysis/:workspaceId error:', err);
    res.status(500).json({ error: 'Failed to fetch analysis results' });
  }
});

router.get('/:workspaceId/clusters', async (req, res) => {
  try {
    const clusters = await prisma.cluster.findMany({
      where: { workspaceId: req.params.workspaceId },
      include: { _count: { select: { tickets: true, suggestions: true } } },
      orderBy: { impactScore: 'desc' },
    });
    res.json({ success: true, clusters });
  } catch (err) {
    console.error('GET /analysis/:workspaceId/clusters error:', err);
    res.status(500).json({ error: 'Failed to fetch clusters' });
  }
});

router.get('/:workspaceId/suggestions', async (req, res) => {
  try {
    const { status, priority } = req.query;
    const where = { workspaceId: req.params.workspaceId };
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const suggestions = await prisma.suggestion.findMany({
      where,
      include: { cluster: true },
      orderBy: [{ priority: 'asc' }, { impact: 'desc' }],
    });
    res.json({ success: true, suggestions });
  } catch (err) {
    console.error('GET /analysis/:workspaceId/suggestions error:', err);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

router.put('/suggestions/:id', async (req, res) => {
  try {
    const validStatuses = ['pending', 'in_progress', 'completed'];
    const { status } = req.body;
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const suggestion = await prisma.suggestion.update({
      where: { id: req.params.id },
      data: { status },
      include: { cluster: true },
    });
    res.json({ success: true, suggestion });
  } catch (err) {
    console.error('PUT /analysis/suggestions/:id error:', err);
    res.status(500).json({ error: 'Failed to update suggestion' });
  }
});

router.get('/:workspaceId/stats', async (req, res) => {
  try {
    const wid = req.params.workspaceId;
    const [totalTickets, totalClusters, totalSuggestions, avgImpact] = await Promise.all([
      prisma.ticket.count({ where: { workspaceId: wid } }),
      prisma.cluster.count({ where: { workspaceId: wid } }),
      prisma.suggestion.count({ where: { workspaceId: wid } }),
      prisma.cluster.aggregate({
        where: { workspaceId: wid },
        _avg: { impactScore: true },
      }),
    ]);

    const statusGroups = await prisma.ticket.groupBy({
      by: ['status'],
      where: { workspaceId: wid },
      _count: { id: true },
    });

    const priorityGroups = await prisma.ticket.groupBy({
      by: ['priority'],
      where: { workspaceId: wid },
      _count: { id: true },
    });

    res.json({
      success: true,
      stats: {
        totalTickets,
        totalClusters,
        totalSuggestions,
        avgImpact: avgImpact._avg.impactScore || 0,
        statusDistribution: statusGroups,
        priorityDistribution: priorityGroups,
      },
    });
  } catch (err) {
    console.error('GET /analysis/:workspaceId/stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
