const axios = require('axios');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callDeepSeek(prompt, maxRetries = 3) {
  const url = process.env.DEEPSEEK_API_URL;
  if (!url) throw new Error('DEEPSEEK_API_URL not configured');

  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get(url, {
        params: { q: prompt },
        timeout: 30000,
      });
      if (response.data?.status === 200 && response.data?.response) {
        return response.data.response;
      }
      lastError = new Error('Invalid response structure');
    } catch (err) {
      lastError = err;
      console.warn(`DeepSeek attempt ${attempt} failed:`, err.message);
      if (attempt < maxRetries) {
        await sleep(Math.pow(2, attempt) * 1000);
      }
    }
  }
  throw new Error(`DeepSeek failed after ${maxRetries} attempts: ${lastError.message}`);
}

function stripJsonMarkdown(text) {
  if (!text) return text;
  return text.replace(/^```json\\s*/, '').replace(/```\\s*$/, '').trim();
}

function validateClusters(clusters, ticketCount) {
  if (!Array.isArray(clusters)) throw new Error('Clusters must be an array');
  const seenIndices = new Set();
  for (const c of clusters) {
    if (!c.name || !c.description || !Array.isArray(c.keywords) || !Array.isArray(c.ticketIndices)) {
      throw new Error('Invalid cluster structure');
    }
    if (c.ticketIndices.length < 2) throw new Error('Cluster must have at least 2 tickets');
    if (c.ticketIndices.some(i => i < 0 || i >= ticketCount)) {
      throw new Error('Ticket index out of bounds');
    }
    for (const i of c.ticketIndices) {
      if (seenIndices.has(i)) throw new Error(`Ticket ${i} in multiple clusters`);
      seenIndices.add(i);
    }
    if (typeof c.impactScore !== 'number' || c.impactScore < 1 || c.impactScore > 10) {
      throw new Error('Invalid impact score');
    }
  }
  return clusters;
}

async function clusterTickets(tickets) {
  if (!tickets?.length) throw new Error('No tickets to cluster');
  const formatted = tickets.map((t, i) => {
    const body = (t.body || '').substring(0, 500);
    return `[${i}] Subject: ${t.subject || ''}\\nBody: ${body}`;
  }).join('\\n\\n');

  const prompt = `Analyze these ${tickets.length} support tickets and group them into clusters by similar root cause.

Tickets:
${formatted}

Return ONLY a JSON array. No markdown. No explanation.
[
  {
    "name": "2-4 word cluster name",
    "description": "Detailed pattern description",
    "keywords": ["keyword1","keyword2","keyword3"],
    "ticketIndices": [0,1,2],
    "impactScore": 8.5
  }
]
Rules: each ticket in exactly one cluster, impact 1-10, min 2 tickets per cluster, max 10 clusters.`;

  const raw = await callDeepSeek(prompt);
  const cleaned = stripJsonMarkdown(raw);
  const clusters = JSON.parse(cleaned);
  validateClusters(clusters, tickets.length);
  return clusters;
}

async function generateArticleSuggestion(clusterName, description, sampleTickets) {
  const samples = sampleTickets.slice(0, 3).map((t, i) => {
    const body = (t.body || '').substring(0, 300);
    return `${i + 1}. Subject: ${t.subject || ''}\\nBody: ${body}`;
  }).join('\\n\\n');

  const prompt = `Create a help article suggestion for cluster "${clusterName}".

Description: ${description}
Sample tickets:
${samples}

Return ONLY JSON:
{
  "title": "Searchable article title",
  "description": "2-3 sentence summary",
  "content": "Detailed article outline with sections",
  "priority": "high|medium|low",
  "impact": 85
}
Priority: high if >10 tickets, medium 5-10, low <5. Impact = estimated deflection %.`;

  const raw = await callDeepSeek(prompt);
  const cleaned = stripJsonMarkdown(raw);
  const suggestion = JSON.parse(cleaned);
  if (!suggestion.title || !suggestion.description || !suggestion.content || !suggestion.priority || typeof suggestion.impact !== 'number') {
    throw new Error('Invalid suggestion structure');
  }
  return suggestion;
}

async function generateDigestSummary(clusters, suggestions, totalTickets) {
  const clusterList = clusters.map(c => `- ${c.name}: ${c.ticketCount} tickets, impact ${c.impactScore}`).join('\\n');
  const prompt = `Weekly digest for support team.
Total: ${totalTickets} tickets, ${clusters.length} clusters, ${suggestions.length} suggestions.
Clusters:
${clusterList}

Return ONLY JSON:
{
  "summary": "2-3 paragraphs",
  "topClusters": [{"name":"...","ticketCount":15,"impactScore":9.2}],
  "actionItems": ["...","..."]
}`;

  try {
    const raw = await callDeepSeek(prompt);
    const cleaned = stripJsonMarkdown(raw);
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn('Digest generation failed, using fallback:', err.message);
    return {
      summary: `This week we analyzed ${totalTickets} tickets and identified ${clusters.length} key clusters. Focus on the highest impact areas to reduce ticket volume.`,
      topClusters: clusters.slice(0, 3).map(c => ({ name: c.name, ticketCount: c.ticketCount, impactScore: c.impactScore })),
      actionItems: ['Review top clusters', 'Publish high-priority articles', 'Monitor deflection metrics'],
    };
  }
}

module.exports = { callDeepSeek, clusterTickets, generateArticleSuggestion, generateDigestSummary };
