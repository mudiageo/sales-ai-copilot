import { eq, and, desc, asc, count, sum, avg, gte, lte, like, inArray } from 'drizzle-orm';
import { db } from './index';
import type { 
  User, NewUser, 
  Organization, NewOrganization,
  Lead, NewLead,
  Deal, NewDeal,
  Subscription, NewSubscription,
  Payment, NewPayment,
  Activity, NewActivity,
  AiInsight, NewAiInsight
} from './schema';
import * as schema from './schema';

// User queries
export const userQueries = {
  async create(data: NewUser): Promise<User> {
    const [user] = await db.insert(schema.users).values(data).returning();
    return user;
  },

  async findById(id: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
  },

  async findByEmail(email: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });
  },

  async update(id: string, data: Partial<NewUser>): Promise<User> {
    const [user] = await db
      .update(schema.users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    return user;
  },

  async delete(id: string): Promise<void> {
    await db.delete(schema.users).where(eq(schema.users.id, id));
  },
};

// Organization queries
export const organizationQueries = {
  async create(data: NewOrganization): Promise<Organization> {
    const [org] = await db.insert(schema.organizations).values(data).returning();
    return org;
  },

  async findById(id: string): Promise<Organization | undefined> {
    return await db.query.organizations.findFirst({
      where: eq(schema.organizations.id, id),
    });
  },

  async findBySlug(slug: string): Promise<Organization | undefined> {
    return await db.query.organizations.findFirst({
      where: eq(schema.organizations.slug, slug),
    });
  },

  async getMembers(organizationId: string) {
    return await db.query.organizationMembers.findMany({
      where: eq(schema.organizationMembers.organizationId, organizationId),
      with: {
        user: true,
      },
    });
  },

  async addMember(organizationId: string, userId: string, role: string) {
    const [member] = await db
      .insert(schema.organizationMembers)
      .values({
        organizationId,
        userId,
        role,
        joinedAt: new Date(),
      })
      .returning();
    return member;
  },
};

// Lead queries
export const leadQueries = {
  async create(data: NewLead): Promise<Lead> {
    const [lead] = await db.insert(schema.leads).values(data).returning();
    return lead;
  },

  async findById(id: string): Promise<Lead | undefined> {
    return await db.query.leads.findFirst({
      where: eq(schema.leads.id, id),
    });
  },

  async findByOrganization(organizationId: string, options?: {
    limit?: number;
    offset?: number;
    status?: string;
    assignedTo?: string;
  }) {
    const conditions = [eq(schema.leads.organizationId, organizationId)];
    
    if (options?.status) {
      conditions.push(eq(schema.leads.status, options.status));
    }
    
    if (options?.assignedTo) {
      conditions.push(eq(schema.leads.assignedTo, options.assignedTo));
    }

    return await db.query.leads.findMany({
      where: and(...conditions),
      limit: options?.limit || 50,
      offset: options?.offset || 0,
      orderBy: desc(schema.leads.createdAt),
    });
  },

  async updateScore(id: string, score: number): Promise<Lead> {
    const [lead] = await db
      .update(schema.leads)
      .set({ leadScore: score, updatedAt: new Date() })
      .where(eq(schema.leads.id, id))
      .returning();
    return lead;
  },

  async getLeadStats(organizationId: string) {
    const [stats] = await db
      .select({
        total: count(),
        avgScore: avg(schema.leads.leadScore),
        qualified: count(schema.leads.status),
      })
      .from(schema.leads)
      .where(eq(schema.leads.organizationId, organizationId));

    return stats;
  },
};

// Deal queries
export const dealQueries = {
  async create(data: NewDeal): Promise<Deal> {
    const [deal] = await db.insert(schema.deals).values(data).returning();
    return deal;
  },

  async findById(id: string): Promise<Deal | undefined> {
    return await db.query.deals.findFirst({
      where: eq(schema.deals.id, id),
    });
  },

  async findByOrganization(organizationId: string, options?: {
    stage?: string;
    assignedTo?: string;
  }) {
    const conditions = [eq(schema.deals.organizationId, organizationId)];
    
    if (options?.stage) {
      conditions.push(eq(schema.deals.stage, options.stage));
    }
    
    if (options?.assignedTo) {
      conditions.push(eq(schema.deals.assignedTo, options.assignedTo));
    }

    return await db.query.deals.findMany({
      where: and(...conditions),
      orderBy: desc(schema.deals.createdAt),
    });
  },

  async getPipelineStats(organizationId: string) {
    const stats = await db
      .select({
        stage: schema.deals.stage,
        count: count(),
        totalValue: sum(schema.deals.value),
        avgProbability: avg(schema.deals.probability),
      })
      .from(schema.deals)
      .where(eq(schema.deals.organizationId, organizationId))
      .groupBy(schema.deals.stage);

    return stats;
  },

  async updateStage(id: string, stage: string): Promise<Deal> {
    const [deal] = await db
      .update(schema.deals)
      .set({ stage, updatedAt: new Date() })
      .where(eq(schema.deals.id, id))
      .returning();
    return deal;
  },
};

// Subscription queries
export const subscriptionQueries = {
  async create(data: NewSubscription): Promise<Subscription> {
    const [subscription] = await db.insert(schema.subscriptions).values(data).returning();
    return subscription;
  },

  async findByOrganization(organizationId: string): Promise<Subscription | undefined> {
    return await db.query.subscriptions.findFirst({
      where: eq(schema.subscriptions.organizationId, organizationId),
      with: {
        plan: true,
      },
    });
  },

  async updateStatus(id: string, status: string): Promise<Subscription> {
    const [subscription] = await db
      .update(schema.subscriptions)
      .set({ status, updatedAt: new Date() })
      .where(eq(schema.subscriptions.id, id))
      .returning();
    return subscription;
  },

  async getActiveSubscriptions() {
    return await db.query.subscriptions.findMany({
      where: eq(schema.subscriptions.status, 'active'),
      with: {
        organization: true,
        plan: true,
      },
    });
  },
};

// Payment queries
export const paymentQueries = {
  async create(data: NewPayment): Promise<Payment> {
    const [payment] = await db.insert(schema.payments).values(data).returning();
    return payment;
  },

  async findByOrganization(organizationId: string, options?: {
    limit?: number;
    status?: string;
  }) {
    const conditions = [eq(schema.payments.organizationId, organizationId)];
    
    if (options?.status) {
      conditions.push(eq(schema.payments.status, options.status));
    }

    return await db.query.payments.findMany({
      where: and(...conditions),
      limit: options?.limit || 50,
      orderBy: desc(schema.payments.createdAt),
    });
  },

  async getRevenue(organizationId: string, startDate: Date, endDate: Date) {
    const [revenue] = await db
      .select({
        total: sum(schema.payments.amount),
        count: count(),
      })
      .from(schema.payments)
      .where(
        and(
          eq(schema.payments.organizationId, organizationId),
          eq(schema.payments.status, 'succeeded'),
          gte(schema.payments.paidAt, startDate),
          lte(schema.payments.paidAt, endDate)
        )
      );

    return revenue;
  },
};

// Activity queries
export const activityQueries = {
  async create(data: NewActivity): Promise<Activity> {
    const [activity] = await db.insert(schema.activities).values(data).returning();
    return activity;
  },

  async findByLead(leadId: string) {
    return await db.query.activities.findMany({
      where: eq(schema.activities.leadId, leadId),
      orderBy: desc(schema.activities.createdAt),
    });
  },

  async findByDeal(dealId: string) {
    return await db.query.activities.findMany({
      where: eq(schema.activities.dealId, dealId),
      orderBy: desc(schema.activities.createdAt),
    });
  },

  async getRecentActivities(organizationId: string, limit = 20) {
    return await db.query.activities.findMany({
      where: eq(schema.activities.organizationId, organizationId),
      limit,
      orderBy: desc(schema.activities.createdAt),
      with: {
        user: true,
        lead: true,
        deal: true,
      },
    });
  },
};

// AI Insights queries
export const aiInsightQueries = {
  async create(data: NewAiInsight): Promise<AiInsight> {
    const [insight] = await db.insert(schema.aiInsights).values(data).returning();
    return insight;
  },

  async findByOrganization(organizationId: string, options?: {
    type?: string;
    category?: string;
    limit?: number;
  }) {
    const conditions = [
      eq(schema.aiInsights.organizationId, organizationId),
      eq(schema.aiInsights.actionTaken, false),
      eq(schema.aiInsights.dismissedAt, null),
    ];
    
    if (options?.type) {
      conditions.push(eq(schema.aiInsights.type, options.type));
    }
    
    if (options?.category) {
      conditions.push(eq(schema.aiInsights.category, options.category));
    }

    return await db.query.aiInsights.findMany({
      where: and(...conditions),
      limit: options?.limit || 20,
      orderBy: desc(schema.aiInsights.createdAt),
    });
  },

  async markAsActioned(id: string): Promise<AiInsight> {
    const [insight] = await db
      .update(schema.aiInsights)
      .set({ actionTaken: true, actionTakenAt: new Date() })
      .where(eq(schema.aiInsights.id, id))
      .returning();
    return insight;
  },

  async dismiss(id: string): Promise<AiInsight> {
    const [insight] = await db
      .update(schema.aiInsights)
      .set({ dismissedAt: new Date() })
      .where(eq(schema.aiInsights.id, id))
      .returning();
    return insight;
  },
};

// Analytics queries
export const analyticsQueries = {
  async getDashboardMetrics(organizationId: string) {
    const [leadStats] = await db
      .select({
        totalLeads: count(),
        newLeads: count(schema.leads.status),
      })
      .from(schema.leads)
      .where(eq(schema.leads.organizationId, organizationId));

    const [dealStats] = await db
      .select({
        totalDeals: count(),
        totalValue: sum(schema.deals.value),
        avgDealSize: avg(schema.deals.value),
      })
      .from(schema.deals)
      .where(eq(schema.deals.organizationId, organizationId));

    const [activityStats] = await db
      .select({
        totalActivities: count(),
        completedActivities: count(schema.activities.isCompleted),
      })
      .from(schema.activities)
      .where(eq(schema.activities.organizationId, organizationId));

    return {
      leads: leadStats,
      deals: dealStats,
      activities: activityStats,
    };
  },

  async getConversionFunnel(organizationId: string) {
    const funnel = await db
      .select({
        status: schema.leads.status,
        count: count(),
      })
      .from(schema.leads)
      .where(eq(schema.leads.organizationId, organizationId))
      .groupBy(schema.leads.status);

    return funnel;
  },

  async getRevenueOverTime(organizationId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const revenue = await db
      .select({
        date: schema.payments.paidAt,
        amount: schema.payments.amount,
      })
      .from(schema.payments)
      .where(
        and(
          eq(schema.payments.organizationId, organizationId),
          eq(schema.payments.status, 'succeeded'),
          gte(schema.payments.paidAt, startDate)
        )
      )
      .orderBy(asc(schema.payments.paidAt));

    return revenue;
  },
};