const axios = require('axios');

class ZendeskClient {
  constructor(subdomain, email, token) {
    this.baseURL = `https://${subdomain}.zendesk.com/api/v2`;
    this.auth = { username: `${email}/token`, password: token };
  }

  async getTickets(page = 1, perPage = 100, status = 'all') {
    const statusFilter = status !== 'all' ? `&status=${status}` : '';
    const response = await axios.get(
      `${this.baseURL}/tickets.json?page=${page}&per_page=${perPage}${statusFilter}`,
      { auth: this.auth, timeout: 30000 }
    );
    const tickets = (response.data.tickets || []).map(t => ({
      externalId: String(t.id),
      subject: t.subject || 'No subject',
      body: (t.description || '').substring(0, 5000),
      status: t.status || 'open',
      priority: t.priority || 'normal',
      tags: t.tags || [],
      createdAt: t.created_at ? new Date(t.created_at) : new Date(),
      updatedAt: t.updated_at ? new Date(t.updated_at) : new Date(),
    }));
    return { tickets, nextPage: response.data.next_page };
  }

  async getAllTickets(maxPages = 10) {
    const all = [];
    let page = 1;
    let nextPage = true;
    while (nextPage && page <= maxPages) {
      const result = await this.getTickets(page);
      all.push(...result.tickets);
      nextPage = result.nextPage;
      page++;
    }
    return all;
  }

  async testConnection() {
    try {
      await axios.get(`${this.baseURL}/tickets.json?per_page=1`, {
        auth: this.auth,
        timeout: 30000,
      });
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

module.exports = { ZendeskClient };
