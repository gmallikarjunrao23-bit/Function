'use client';

import { useState, useEffect } from 'react';
import { Settings, Globe, Mail, Key, Trash2, CheckCircle2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { workspaceAPI } from '@/lib/api';

export default function SettingsPage() {
  const [workspace, setWorkspace] = useState(null);
  const [form, setForm] = useState({ name: '', zendeskUrl: '', zendeskEmail: '', zendeskToken: '' });
  const [original, setOriginal] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const res = await workspaceAPI.list();
        const ws = res.workspaces?.[0];
        if (ws) {
          setWorkspace(ws);
          const data = {
            name: ws.name || '',
            zendeskUrl: ws.zendeskUrl || '',
            zendeskEmail: ws.zendeskEmail || '',
            zendeskToken: ws.zendeskToken || '',
          };
          setForm(data);
          setOriginal(data);
        }
      } catch (err) {
        console.error('Failed to load workspace', err);
      }
    }
    init();
  }, []);

  async function handleSave() {
    if (!workspace) return;
    try {
      setSaving(true);
      await workspaceAPI.update(workspace.id, {
        name: form.name,
        zendeskUrl: form.zendeskUrl || null,
        zendeskEmail: form.zendeskEmail || null,
        zendeskToken: form.zendeskToken || null,
      });
      setOriginal({ ...form });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!workspace) return;
    if (!confirm('Are you sure you want to delete this workspace? This cannot be undone.')) return;
    try {
      await workspaceAPI.delete(workspace.id);
      window.location.reload();
    } catch (err) {
      console.error('Failed to delete', err);
    }
  }

  const hasChanges = JSON.stringify(form) !== JSON.stringify(original);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
          <p className="text-[#64748B] mt-1">Manage your workspace and integrations</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <Settings size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Workspace</h3>
              <p className="text-sm text-[#64748B]">Basic workspace information</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">Workspace Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <Globe size={20} className="text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Zendesk Integration</h3>
              <p className="text-sm text-[#64748B]">Connect your Zendesk account to import tickets</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">Subdomain</label>
              <div className="relative">
                <input
                  type="text"
                  value={form.zendeskUrl}
                  onChange={(e) => setForm({ ...form, zendeskUrl: e.target.value })}
                  placeholder="yourcompany"
                  className="input-field pr-28"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] text-sm">
                  .zendesk.com
                </span>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#94A3B8] mb-2">
                <Mail size={14} />
                Email
              </label>
              <input
                type="email"
                value={form.zendeskEmail}
                onChange={(e) => setForm({ ...form, zendeskEmail: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#94A3B8] mb-2">
                <Key size={14} />
                API Token
              </label>
              <input
                type="password"
                value={form.zendeskToken}
                onChange={(e) => setForm({ ...form, zendeskToken: e.target.value })}
                className="input-field"
              />
              <p className="text-xs text-[#64748B] mt-2">
                You can generate an API token from your Zendesk Admin settings.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition text-sm font-medium"
          >
            <Trash2 size={16} />
            Delete Workspace
          </button>
          <div className="flex items-center gap-3">
            {saved && (
              <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
                <CheckCircle2 size={16} />
                Saved
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
