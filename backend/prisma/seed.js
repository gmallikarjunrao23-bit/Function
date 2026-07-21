const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Demo Workspace',
      zendeskUrl: null,
      zendeskEmail: null,
      zendeskToken: null,
    },
  });

  const tickets = [
    { externalId: 'demo-1', subject: 'How do I reset my password?', body: 'I forgot my password and need to reset it. The reset link is not working for me.', status: 'open', priority: 'normal', tags: ['password', 'login'] },
    { externalId: 'demo-2', subject: 'Password reset email not arriving', body: 'I requested a password reset 30 minutes ago but have not received the email. Checked spam folder too.', status: 'open', priority: 'high', tags: ['password', 'email'] },
    { externalId: 'demo-3', subject: 'Account locked after failed attempts', body: 'My account got locked after I tried logging in multiple times with the wrong password. How do I unlock it?', status: 'open', priority: 'high', tags: ['account', 'security'] },
    { externalId: 'demo-4', subject: 'Charged twice this month', body: 'I see two charges on my credit card for this month. Please refund the duplicate charge.', status: 'open', priority: 'urgent', tags: ['billing', 'refund'] },
    { externalId: 'demo-5', subject: 'Wrong plan amount on invoice', body: 'The invoice shows a different amount than what I agreed to on the pricing page. Can you fix this?', status: 'open', priority: 'normal', tags: ['billing', 'pricing'] },
    { externalId: 'demo-6', subject: 'How to export data to CSV?', body: 'I need to export my project data to CSV format. Is there a built-in export feature?', status: 'open', priority: 'normal', tags: ['export', 'data'] },
    { externalId: 'demo-7', subject: 'Export button not working', body: 'When I click the export button, nothing happens. No download starts. Using Chrome latest version.', status: 'open', priority: 'normal', tags: ['export', 'bug'] },
    { externalId: 'demo-8', subject: 'Slack integration webhook 404', body: 'Our Slack integration stopped working. The webhook URL returns a 404 error. Please help.', status: 'open', priority: 'high', tags: ['integration', 'slack'] },
    { externalId: 'demo-9', subject: 'Zapier auth error', body: 'Zapier connection shows authentication error. I reconnected but it still fails. Token might be expired.', status: 'open', priority: 'normal', tags: ['integration', 'zapier'] },
    { externalId: 'demo-10', subject: 'API rate limit too low', body: 'We are hitting the API rate limit frequently. Can you increase our limit or suggest best practices?', status: 'open', priority: 'normal', tags: ['api', 'limits'] },
  ];

  for (const t of tickets) {
    await prisma.ticket.create({
      data: {
        ...t,
        workspaceId: workspace.id,
      },
    });
  }

  console.log('Seed completed: Demo Workspace + 10 tickets created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
