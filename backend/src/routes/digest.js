const express = require('express');
const { prisma } = require('../utils/db');
const { generateDigestSummary } = require('../utils/ai');
const router = express.Router();

router.post('/:workspaceId', async (req, res) => {
  try {
    const wid = req.params.workspaceId;
    const clusters = await prisma.cluster.findMany({
      where: { workspaceId: wid },
      orderBy: { impactScore: 'desc' },
    });
    const suggestions = await prisma.suggestion.findMany({
      where: { workspaceId: wid },
    });
    const totalTickets = await prisma.ticket.count({ where: { workspaceId: wid } });

    const digestData = await generateDigestSummary(clusters, suggestions, totalTickets);

    const digest = await prisma.digest.create({
      data: {
        workspaceId: wid,
        period: 'weekly',
        summary: digestData.summary,
        topClusters: digestData.topClusters,
        newSuggestions: suggestions.length,
        ticketsAnalyzed: totalTickets,
      },
    });

    res.json({ success: true, digest: { ...digest, actionItems: digestData.actionItems } });
  } catch (err) {
    console.error('POST /digests/:workspaceId error:', err);
    res.status(500).json({ error: 'Failed to generate digest' });
  }
});

router.get('/:workspaceId', async (req, res) => {
  try {
    const digests = await prisma.digest.findMany({
      where: { workspaceId: req.params.workspaceId },
      orderBy: { sentAt: 'desc' },
      take: 10,
    });
    res.json({ success: true, digests });
  } catch (err) {
    console.error('GET /digests/:workspaceId error:', err);
    res.status(500).json({ error: 'Failed to fetch digests' });
  }
});

module.exports = router;
