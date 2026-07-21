const express = require('express');
const { prisma } = require('../utils/db');
const { ZendeskClient } = require('../utils/zendesk');
const { analyzeTickets } = require('../services/analysisService');
const router = express.Router();

router.post('/analyze/:workspaceId', async (req, res) => {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: req.params.workspaceId },
    });
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

    const tickets = await prisma.ticket.findMany({
      where: { workspaceId: workspace.id },
    });

    if (!tickets.length) {
      return res.status(400).json({ error: 'No tickets found to analyze' });
    }

    const result = await analyzeTickets(workspace.id, tickets);

    res.json({
      success: true,
      message: 'Analyzed ' + result.ticketsAnalyzed + ' tickets, found ' + result.clustersCreated + ' clusters, generated ' + result.suggestionsGenerated + ' suggestions.',
      ticketsAnalyzed: result.ticketsAnalyzed,
      clustersCreated: result.clustersCreated,
      suggestionsGenerated: result.suggestionsGenerated,
      clusters: result.clusters,
      suggestions: result.suggestions,
    });
  } catch (err) {
    console.error('POST /tickets/analyze/:workspaceId error:', err);
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

router.post('/import/:workspaceId', async (req, res) => {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: req.params.workspaceId },
    });
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    if (!workspace.zendeskUrl || !workspace.zendeskEmail || !workspace.zendeskToken) {
      return res.status(400).json({ error: 'Zendesk credentials not configured' });
    }

    const subdomain = workspace.zendeskUrl
      .replace('https://', '')
      .replace('http://', '')
      .split('.zendesk.com')[0];

    const client = new ZendeskClient(subdomain, workspace.zendeskEmail, workspace.zendeskToken);

    const test = await client.testConnection();
    if (!test.success) {
      return res.status(400).json({ error: 'Zendesk connection failed: ' + test.error });
    }

    const maxPages = req.body.maxPages || 5;
    const rawTickets = await client.getAllTickets(maxPages);

    const result = await analyzeTickets(workspace.id, rawTickets);

    res.json({
      success: true,
      message: 'Analyzed ' + result.ticketsAnalyzed + ' tickets, found ' + result.clustersCreated + ' clusters, generated ' + result.suggestionsGenerated + ' suggestions.',
      ticketsAnalyzed: result.ticketsAnalyzed,
      clustersCreated: result.clustersCreated,
      suggestionsGenerated: result.suggestionsGenerated,
      clusters: result.clusters,
      suggestions: result.suggestions,
    });
  } catch (err) {
    console.error('POST /tickets/import/:workspaceId error:', err);
    res.status(500).json({ error: err.message || 'Import failed' });
  }
});

router.get('/workspace/:workspaceId', async (req, res) => {
  try {
    const { status, clusterId, page, limit } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where = { workspaceId: req.params.workspaceId };
    if (status) where.status = status;
    if (clusterId) where.clusterId = clusterId;

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { cluster: true },
      }),
      prisma.ticket.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      tickets,
      pagination: { page: pageNum, limit: limitNum, total, totalPages },
    });
  } catch (err) {
    console.error('GET /tickets/workspace/:workspaceId error:', err);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: { cluster: true, workspace: true },
    });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json({ success: true, ticket });
  } catch (err) {
    console.error('GET /tickets/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

module.exports = router;
