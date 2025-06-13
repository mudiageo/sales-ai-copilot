import { db } from './index';
import * as schema from './schema';

export async function seedDatabase() {
  console.log('🌱 Seeding database...');

  // Create subscription plans
  const plans = await db.insert(schema.subscriptionPlans).values([
    {
      name: 'Starter',
      slug: 'starter',
      description: 'Perfect for small teams getting started',
      price: 49,
      interval: 'month',
      trialDays: 14,
      features: [
        'Up to 5 team members',
        'Basic AI lead scoring',
        'Email support',
        'Standard integrations',
        '1,000 leads',
        '5GB storage'
      ],
      limits: {
        users: 5,
        leads: 1000,
        storage: '5GB',
        aiInsights: 100
      },
      sortOrder: 1,
    },
    {
      name: 'Professional',
      slug: 'professional',
      description: 'Advanced features for growing teams',
      price: 99,
      interval: 'month',
      trialDays: 14,
      features: [
        'Up to 25 team members',
        'Advanced AI features',
        'Priority support',
        'Custom integrations',
        '10,000 leads',
        '50GB storage',
        'Advanced analytics',
        'API access'
      ],
      limits: {
        users: 25,
        leads: 10000,
        storage: '50GB',
        aiInsights: 1000
      },
      sortOrder: 2,
    },
    {
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'Custom solutions for large organizations',
      price: 299,
      interval: 'month',
      trialDays: 30,
      features: [
        'Unlimited team members',
        'Custom AI models',
        'Dedicated support',
        'Enterprise integrations',
        'Unlimited leads',
        'Unlimited storage',
        'Custom analytics',
        'SLA guarantee',
        'White-label options'
      ],
      limits: {
        users: -1, // Unlimited
        leads: -1,
        storage: 'unlimited',
        aiInsights: -1
      },
      sortOrder: 3,
    },
  ]).returning();

  console.log(`✅ Created ${plans.length} subscription plans`);

  // Create sample organization
  const [organization] = await db.insert(schema.organizations).values({
    name: 'Acme Corporation',
    slug: 'acme-corp',
    domain: 'acme.com',
    industry: 'Technology',
    size: 'medium',
    website: 'https://acme.com',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    settings: {
      timezone: 'America/Los_Angeles',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
    },
  }).returning();

  console.log(`✅ Created organization: ${organization.name}`);

  // Create sample users
  const users = await db.insert(schema.users).values([
    {
      email: 'admin@acme.com',
      firstName: 'John',
      lastName: 'Doe',
      title: 'Sales Director',
      department: 'Sales',
      phone: '+1-555-0123',
      timezone: 'America/Los_Angeles',
    },
    {
      email: 'sarah@acme.com',
      firstName: 'Sarah',
      lastName: 'Chen',
      title: 'Senior Sales Rep',
      department: 'Sales',
      phone: '+1-555-0124',
      timezone: 'America/Los_Angeles',
    },
    {
      email: 'mike@acme.com',
      firstName: 'Michael',
      lastName: 'Rodriguez',
      title: 'Sales Rep',
      department: 'Sales',
      phone: '+1-555-0125',
      timezone: 'America/Los_Angeles',
    },
  ]).returning();

  console.log(`✅ Created ${users.length} users`);

  // Add users to organization
  await db.insert(schema.organizationMembers).values([
    {
      organizationId: organization.id,
      userId: users[0].id,
      role: 'owner',
      joinedAt: new Date(),
    },
    {
      organizationId: organization.id,
      userId: users[1].id,
      role: 'manager',
      joinedAt: new Date(),
    },
    {
      organizationId: organization.id,
      userId: users[2].id,
      role: 'sales_rep',
      joinedAt: new Date(),
    },
  ]);

  console.log(`✅ Added users to organization`);

  // Create subscription for organization
  const [subscription] = await db.insert(schema.subscriptions).values({
    organizationId: organization.id,
    planId: plans[1].id, // Professional plan
    status: 'active',
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  }).returning();

  console.log(`✅ Created subscription`);

  // Create sample leads
  const leads = await db.insert(schema.leads).values([
    {
      organizationId: organization.id,
      assignedTo: users[1].id,
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@techcorp.com',
      phone: '+1-555-1001',
      company: 'TechCorp Inc.',
      title: 'CTO',
      industry: 'Technology',
      source: 'website',
      status: 'qualified',
      leadScore: 85,
      estimatedValue: 50000,
      probability: 70,
      tags: ['enterprise', 'hot-lead'],
    },
    {
      organizationId: organization.id,
      assignedTo: users[2].id,
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob@innovate.com',
      phone: '+1-555-1002',
      company: 'InnovateX',
      title: 'VP Sales',
      industry: 'Software',
      source: 'referral',
      status: 'contacted',
      leadScore: 72,
      estimatedValue: 25000,
      probability: 45,
      tags: ['mid-market'],
    },
    {
      organizationId: organization.id,
      assignedTo: users[1].id,
      firstName: 'Carol',
      lastName: 'Williams',
      email: 'carol@growthmax.com',
      phone: '+1-555-1003',
      company: 'GrowthMax',
      title: 'CEO',
      industry: 'Marketing',
      source: 'cold_outreach',
      status: 'new',
      leadScore: 91,
      estimatedValue: 75000,
      probability: 80,
      tags: ['enterprise', 'decision-maker'],
    },
  ]).returning();

  console.log(`✅ Created ${leads.length} leads`);

  // Create sample deals
  const deals = await db.insert(schema.deals).values([
    {
      organizationId: organization.id,
      leadId: leads[0].id,
      assignedTo: users[1].id,
      name: 'TechCorp Enterprise Deal',
      description: 'Enterprise sales platform implementation',
      value: 50000,
      stage: 'proposal',
      probability: 70,
      expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
    {
      organizationId: organization.id,
      leadId: leads[2].id,
      assignedTo: users[1].id,
      name: 'GrowthMax Expansion',
      description: 'Sales team expansion project',
      value: 75000,
      stage: 'negotiation',
      probability: 80,
      expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  ]).returning();

  console.log(`✅ Created ${deals.length} deals`);

  // Create sample activities
  await db.insert(schema.activities).values([
    {
      organizationId: organization.id,
      userId: users[1].id,
      leadId: leads[0].id,
      dealId: deals[0].id,
      type: 'call',
      subject: 'Discovery call with Alice Johnson',
      description: 'Discussed current sales process and pain points',
      outcome: 'interested',
      duration: 45,
      isCompleted: true,
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      organizationId: organization.id,
      userId: users[1].id,
      leadId: leads[2].id,
      type: 'email',
      subject: 'Follow-up: Sales platform demo',
      description: 'Sent demo recording and pricing information',
      isCompleted: true,
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      organizationId: organization.id,
      userId: users[2].id,
      leadId: leads[1].id,
      type: 'meeting',
      subject: 'Product demo scheduled',
      description: 'Demo meeting with InnovateX team',
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      isCompleted: false,
    },
  ]);

  console.log(`✅ Created sample activities`);

  // Create AI insights
  await db.insert(schema.aiInsights).values([
    {
      organizationId: organization.id,
      leadId: leads[0].id,
      type: 'next_action',
      category: 'high_priority',
      title: 'High-value lead ready for proposal',
      description: 'TechCorp shows strong buying signals based on recent interactions',
      recommendation: 'Schedule proposal presentation within 48 hours',
      confidence: 0.89,
      impact: 'high',
    },
    {
      organizationId: organization.id,
      dealId: deals[1].id,
      type: 'risk_alert',
      category: 'medium_priority',
      title: 'Deal at risk of stalling',
      description: 'No activity on GrowthMax deal for 5 days',
      recommendation: 'Send follow-up email and schedule check-in call',
      confidence: 0.72,
      impact: 'medium',
    },
    {
      organizationId: organization.id,
      userId: users[2].id,
      type: 'coaching',
      category: 'low_priority',
      title: 'Improve email response rates',
      description: 'Email open rates below team average',
      recommendation: 'Try personalized subject lines and A/B test send times',
      confidence: 0.65,
      impact: 'medium',
    },
  ]);

  console.log(`✅ Created AI insights`);

  // Create sample payments
  await db.insert(schema.payments).values([
    {
      organizationId: organization.id,
      subscriptionId: subscription.id,
      amount: 99,
      status: 'succeeded',
      paymentMethod: 'card',
      description: 'Professional Plan - Monthly',
      paidAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      organizationId: organization.id,
      subscriptionId: subscription.id,
      amount: 99,
      status: 'succeeded',
      paymentMethod: 'card',
      description: 'Professional Plan - Monthly',
      paidAt: new Date(),
    },
  ]);

  console.log(`✅ Created sample payments`);

  console.log('🎉 Database seeded successfully!');
}

// Run seed if this file is executed directly
if (import.meta.main) {
  await seedDatabase();
  process.exit(0);
}