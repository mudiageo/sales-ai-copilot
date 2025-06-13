import { pgTable, serial, integer, text, real, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  email: text('email').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  avatar: text('avatar'),
  title: text('title'),
  department: text('department'),
  phone: text('phone'),
  timezone: text('timezone').default('UTC'),
  language: text('language').default('en'),
  bio: text('bio'),
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
});

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  domain: text('domain'),
  logo: text('logo'),
  industry: text('industry'),
  size: text('size'),
  website: text('website'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  country: text('country'),
  zipCode: text('zip_code'),
  phone: text('phone'),
  settings: text('settings', { mode: 'json' }),
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
});

export const organizationMembers = pgTable('organization_members', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  permissions: text('permissions', { mode: 'json' }),
  invitedBy: uuid('invited_by').references(() => users.id),
  invitedAt: timestamp('invited_at'),
  joinedAt: timestamp('joined_at'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
});

export const subscriptionPlans = pgTable('subscription_plans', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  price: real('price').notNull(),
  currency: text('currency').default('USD'),
  interval: text('interval').notNull(),
  intervalCount: integer('interval_count').default(1),
  trialDays: integer('trial_days').default(0),
  features: text('features', { mode: 'json' }),
  limits: text('limits', { mode: 'json' }),
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  planId: uuid('plan_id').notNull().references(() => subscriptionPlans.id),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeCustomerId: text('stripe_customer_id'),
  status: text('status').notNull(),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  trialStart: timestamp('trial_start'),
  trialEnd: timestamp('trial_end'),
  canceledAt: timestamp('canceled_at'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
});

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id),
  stripePaymentIntentId: text('stripe_payment_intent_id').unique(),
  stripeInvoiceId: text('stripe_invoice_id'),
  amount: real('amount').notNull(),
  currency: text('currency').default('USD'),
  status: text('status').notNull(),
  paymentMethod: text('payment_method'),
  description: text('description'),
  receiptUrl: text('receipt_url'),
  failureReason: text('failure_reason'),
  refundedAmount: real('refunded_amount').default(0),
  metadata: text('metadata', { mode: 'json' }),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
});

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  assignedTo: uuid('assigned_to').references(() => users.id),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  company: text('company'),
  title: text('title'),
  industry: text('industry'),
  website: text('website'),
  linkedinUrl: text('linkedin_url'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  country: text('country'),
  zipCode: text('zip_code'),
  source: text('source'),
  status: text('status').default('new'),
  leadScore: integer('lead_score').default(0),
  estimatedValue: real('estimated_value'),
  probability: integer('probability').default(0),
  tags: text('tags', { mode: 'json' }),
  notes: text('notes'),
  customFields: text('custom_fields', { mode: 'json' }),
  lastContactedAt: timestamp('last_contacted_at'),
  qualifiedAt: timestamp('qualified_at'),
  convertedAt: timestamp('converted_at'),
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
});

export const deals = pgTable('deals', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  leadId: uuid('lead_id').references(() => leads.id),
  assignedTo: uuid('assigned_to').references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  value: real('value').notNull(),
  currency: text('currency').default('USD'),
  stage: text('stage').notNull(),
  probability: integer('probability').default(0),
  expectedCloseDate: timestamp('expected_close_date'),
  actualCloseDate: timestamp('actual_close_date'),
  lostReason: text('lost_reason'),
  competitorInfo: text('competitor_info'),
  tags: text('tags', { mode: 'json' }),
  customFields: text('custom_fields', { mode: 'json' }),
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
});

export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id),
  leadId: uuid('lead_id').references(() => leads.id),
  dealId: uuid('deal_id').references(() => deals.id),
  type: text('type').notNull(),
  subject: text('subject').notNull(),
  description: text('description'),
  outcome: text('outcome'),
  duration: integer('duration'),
  scheduledAt: timestamp('scheduled_at'),
  completedAt: timestamp('completed_at'),
  isCompleted: boolean('is_completed').default(false),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
});

export const aiInsights = pgTable('ai_insights', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id),
  leadId: uuid('lead_id').references(() => leads.id),
  dealId: uuid('deal_id').references(() => deals.id),
  type: text('type').notNull(),
  category: text('category'),
  title: text('title').notNull(),
  description: text('description').notNull(),
  recommendation: text('recommendation'),
  confidence: real('confidence'),
  impact: text('impact'),
  actionTaken: boolean('action_taken').default(false),
  actionTakenAt: timestamp('action_taken_at'),
  dismissedAt: timestamp('dismissed_at'),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
});

export const emailTemplates = pgTable('email_templates', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  name: text('name').notNull(),
  subject: text('subject').notNull(),
  content: text('content').notNull(),
  type: text('type'),
  variables: text('variables', { mode: 'json' }),
  isActive: boolean('is_active').default(true),
  usageCount: integer('usage_count').default(0),
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
});

export const integrations = pgTable('integrations', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  status: text('status').default('inactive'),
  config: text('config', { mode: 'json' }),
  credentials: text('credentials', { mode: 'json' }),
  lastSyncAt: timestamp('last_sync_at'),
  syncStatus: text('sync_status'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
});

export const webhooks = pgTable('webhooks', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  url: text('url').notNull(),
  events: text('events', { mode: 'json' }),
  secret: text('secret'),
  isActive: boolean('is_active').default(true),
  lastTriggeredAt: timestamp('last_triggered_at'),
  failureCount: integer('failure_count').default(0),
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
});

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  keyHash: text('key_hash').notNull(),
  permissions: text('permissions', { mode: 'json' }),
  lastUsedAt: timestamp('last_used_at'),
  expiresAt: timestamp('expires_at'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id),
  action: text('action').notNull(),
  resource: text('resource').notNull(),
  resourceId: uuid('resource_id'),
  oldValues: text('old_values', { mode: 'json' }),
  newValues: text('new_values', { mode: 'json' }),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: timestamp('created_at').default(sql`now()`),
});

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  actionUrl: text('action_url'),
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: timestamp('created_at').default(sql`now()`),
});

export const usageAnalytics = pgTable('usage_analytics', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id),
  feature: text('feature').notNull(),
  action: text('action').notNull(),
  count: integer('count').default(1),
  metadata: text('metadata', { mode: 'json' }),
  date: text('date').notNull(),
  createdAt: timestamp('created_at').default(sql`now()`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type NewOrganizationMember = typeof organizationMembers.$inferInsert;

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type NewSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;

export type AiInsight = typeof aiInsights.$inferSelect;
export type NewAiInsight = typeof aiInsights.$inferInsert;

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type NewEmailTemplate = typeof emailTemplates.$inferInsert;

export type Integration = typeof integrations.$inferSelect;
export type NewIntegration = typeof integrations.$inferInsert;

export type Webhook = typeof webhooks.$inferSelect;
export type NewWebhook = typeof webhooks.$inferInsert;

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export type UsageAnalytic = typeof usageAnalytics.$inferSelect;
export type NewUsageAnalytic = typeof usageAnalytics.$inferInsert;