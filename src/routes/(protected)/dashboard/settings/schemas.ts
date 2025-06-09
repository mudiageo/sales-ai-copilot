import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  timezone: z.string().min(1, { message: 'Please select a timezone' }),
  language: z.string().min(1, { message: 'Please select a language' }),
  bio: z.string().max(500, { message: 'Bio must be less than 500 characters' }).optional(),
});

export const notificationSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  leadAlerts: z.boolean().default(true),
  dealUpdates: z.boolean().default(true),
  teamUpdates: z.boolean().default(true),
  weeklyReports: z.boolean().default(true),
  monthlyReports: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
});

export const teamSchema = z.object({
  memberEmail: z.string().email({ message: 'Please enter a valid email address' }),
  memberRole: z.enum(['admin', 'manager', 'sales_rep', 'viewer'], {
    required_error: 'Please select a role',
  }),
  permissions: z.array(z.string()).default([]),
});

export const aiConfigSchema = z.object({
  leadScoringEnabled: z.boolean().default(true),
  leadScoringThreshold: z.number().min(0).max(100).default(70),
  coachingEnabled: z.boolean().default(true),
  coachingTone: z.enum(['encouraging', 'direct', 'instructive']).default('encouraging'),
  contentGenerationEnabled: z.boolean().default(true),
  autoPersonalization: z.boolean().default(true),
  sentimentAnalysis: z.boolean().default(true),
  predictiveForecasting: z.boolean().default(true),
});

export const securitySchema = z.object({
  currentPassword: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  newPassword: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  twoFactorEnabled: z.boolean().default(false),
  sessionTimeout: z.number().min(15).max(480).default(60),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ProfileSchema = typeof profileSchema;
export type NotificationSchema = typeof notificationSchema;
export type TeamSchema = typeof teamSchema;
export type AiConfigSchema = typeof aiConfigSchema;
export type SecuritySchema = typeof securitySchema;