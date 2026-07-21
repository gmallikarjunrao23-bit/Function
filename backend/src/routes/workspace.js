const express = require('express');
const { prisma } = require('../utils/db');
const router = express.Router();

function stripToken(workspace) {
  const { zendeskToken, ...rest } = workspace;
  return rest;
}

router.post('/', async (req, res) => {
  try {
    const { name, zendeskUrl, zendeskEmail, zendeskToken } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Workspace name is required' });
    }
    const workspace = await prisma.workspace.create({
      data: {
        name: name.trim(),
        zendeskUrl: zendeskUrl || null,
        zendeskEmail: zendeskEmail || null,
        zendeskToken: zendeskToken || null,
      },
    });
    res.status(201).json({ success: true, workspace: stripToken(workspace) });
  } catch (err) {
    console.error('POST /workspaces error:', err);
    res.status(500).json({ error: 'Failed to create workspace' });
  }
});

router.get('/', async (req, res) => {
  try {
    const workspaces = await prisma.workspace.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { tickets: true, clusters: true, suggestions: true } },
      },
    });
    res.json({ success: true, workspaces: workspaces.map(stripToken) });
  } catch (err) {
    console.error('GET /workspaces error:', err);
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: req.params.id },
      include: {
        _count: { select: { tickets: true, clusters: true, suggestions: true } },
      },
    });
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    res.json({ success: true, workspace: stripToken(workspace) });
  } catch (err) {
    console.error('GET /workspaces/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch workspace' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, zendeskUrl, zendeskEmail, zendeskToken } = req.body;
    const data = {};
    if (name !== undefined) data.name = name.trim();
    if (zendeskUrl !== undefined) data.zendeskUrl = zendeskUrl || null;
    if (zendeskEmail !== undefined) data.zendeskEmail = zendeskEmail || null;
    if (zendeskToken !== undefined) data.zendeskToken = zendeskToken || null;

    const workspace = await prisma.workspace.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ success: true, workspace: stripToken(workspace) });
  } catch (err) {
    console.error('PUT /workspaces/:id error:', err);
    res.status(500).json({ error: 'Failed to update workspace' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.workspace.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Workspace deleted' });
  } catch (err) {
    console.error('DELETE /workspaces/:id error:', err);
    res.status(500).json({ error: 'Failed to delete workspace' });
  }
});

module.exports = router;
