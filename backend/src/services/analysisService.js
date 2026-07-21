const { prisma } = require('../utils/db');
const { clusterTickets, generateArticleSuggestion } = require('../utils/ai');

async function analyzeTickets(workspaceId, tickets) {
  if (!tickets?.length) throw new Error('No tickets provided for analysis');

  const savedTickets = [];
  for (const t of tickets) {
    const saved = await prisma.ticket.upsert({
      where: { externalId: t.externalId },
      update: {
        subject: t.subject,
        body: t.body,
        status: t.status,
        priority: t.priority,
        tags: t.tags,
        updatedAt: t.updatedAt,
        workspaceId,
      },
      create: {
        externalId: t.externalId,
        subject: t.subject,
        body: t.body,
        status: t.status,
        priority: t.priority,
        tags: t.tags,
        workspaceId,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      },
    });
    savedTickets.push(saved);
  }

  const clusters = await clusterTickets(savedTickets);
  await prisma.cluster.deleteMany({ where: { workspaceId } });

  const createdClusters = [];
  for (const c of clusters) {
    const cluster = await prisma.cluster.create({
      data: {
        workspaceId,
        name: c.name,
        description: c.description,
        keywords: c.keywords,
        ticketCount: c.ticketIndices.length,
        impactScore: c.impactScore,
      },
    });

    const ticketIds = c.ticketIndices.map(i => savedTickets[i].id);
    await prisma.ticket.updateMany({
      where: { id: { in: ticketIds } },
      data: { clusterId: cluster.id },
    });

    createdClusters.push({ ...cluster, ticketIds });
  }

  const suggestions = [];
  for (const c of createdClusters) {
    if (c.ticketCount >= 2) {
      const sampleTickets = savedTickets.filter(t => c.ticketIds.includes(t.id));
      try {
        const suggestionData = await generateArticleSuggestion(c.name, c.description, sampleTickets);
        const suggestion = await prisma.suggestion.create({
          data: {
            workspaceId,
            clusterId: c.id,
            title: suggestionData.title,
            description: suggestionData.description,
            content: suggestionData.content,
            priority: suggestionData.priority,
            impact: suggestionData.impact,
            status: 'pending',
          },
        });
        suggestions.push(suggestion);
      } catch (err) {
        console.warn(`Failed to generate suggestion for cluster ${c.name}:`, err.message);
      }
    }
  }

  return {
    ticketsAnalyzed: savedTickets.length,
    clustersCreated: createdClusters.length,
    suggestionsGenerated: suggestions.length,
    clusters: createdClusters,
    suggestions,
  };
}

async function getAnalysisResults(workspaceId) {
  const clusters = await prisma.cluster.findMany({
    where: { workspaceId },
    include: {
      _count: { select: { tickets: true, suggestions: true } },
      suggestions: true,
    },
    orderBy: { impactScore: 'desc' },
  });

  const suggestions = await prisma.suggestion.findMany({
    where: { workspaceId },
    include: { cluster: true },
    orderBy: [{ priority: 'asc' }, { impact: 'desc' }],
  });

  const stats = {
    totalTickets: await prisma.ticket.count({ where: { workspaceId } }),
    totalClusters: clusters.length,
    totalSuggestions: suggestions.length,
    avgImpact: clusters.length
      ? clusters.reduce((sum, c) => sum + c.impactScore, 0) / clusters.length
      : 0,
  };

  return { clusters, suggestions, stats };
}

module.exports = { analyzeTickets, getAnalysisResults };
