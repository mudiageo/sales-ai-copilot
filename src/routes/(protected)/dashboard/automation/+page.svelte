<script lang="ts">
  import { onMount } from 'svelte';
  import { DndContext, DragOverlay, closestCenter } from '@dnd-kit-svelte/core';
  import { SortableContext, verticalListSortingStrategy } from '@dnd-kit-svelte/sortable';
  import { useSortable } from '@dnd-kit-svelte/sortable';
  import { CSS } from '@dnd-kit-svelte/utilities';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Textarea } from '$lib/components/ui/textarea';
  import * as Select from '$lib/components/ui/select';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as Tabs from '$lib/components/ui/tabs';
  import * as Card from '$lib/components/ui/card';
  import * as Table from '$lib/components/ui/table';
  import { Badge } from '$lib/components/ui/badge';
  import { Progress } from '$lib/components/ui/progress';
  import { Label } from '$lib/components/ui/label';
  import { Switch } from '$lib/components/ui/switch';
  import { Separator } from '$lib/components/ui/separator';
  import { toast } from 'svelte-sonner';
  
  // Icons
  import Plus from "@lucide/svelte/icons/plus";
  import Play from "@lucide/svelte/icons/play";
  import Pause from "@lucide/svelte/icons/pause";
  import Settings from "@lucide/svelte/icons/settings";
  import Copy from "@lucide/svelte/icons/copy";
  import Edit from "@lucide/svelte/icons/edit";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import Mail from "@lucide/svelte/icons/mail";
  import MessageSquare from "@lucide/svelte/icons/message-square";
  import Phone from "@lucide/svelte/icons/phone";
  import Calendar from "@lucide/svelte/icons/calendar";
  import TrendingUp from "@lucide/svelte/icons/trending-up";
  import Users from "@lucide/svelte/icons/users";
  import Target from "@lucide/svelte/icons/target";
  import DollarSign from "@lucide/svelte/icons/dollar-sign";
  import BarChart from "@lucide/svelte/icons/bar-chart";
  import Zap from "@lucide/svelte/icons/zap";
  import Clock from "@lucide/svelte/icons/clock";
  import Eye from "@lucide/svelte/icons/eye";
  import MousePointer from "@lucide/svelte/icons/mouse-pointer";
  import Reply from "@lucide/svelte/icons/reply";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import Filter from "@lucide/svelte/icons/filter";
  import Download from "@lucide/svelte/icons/download";
  import GripVertical from "@lucide/svelte/icons/grip-vertical";
  import Split from "@lucide/svelte/icons/split";
  import TestTube from "@lucide/svelte/icons/test-tube";

  // Types
  interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    content: string;
    category: string;
    openRate?: number;
    clickRate?: number;
    isABTest?: boolean;
    variants?: EmailTemplate[];
  }

  interface SequenceStep {
    id: string;
    type: 'email' | 'linkedin' | 'sms' | 'wait' | 'condition' | 'ab_test';
    delay: number;
    delayUnit: 'minutes' | 'hours' | 'days';
    template?: EmailTemplate;
    content?: string;
    subject?: string;
    condition?: string;
    abTestConfig?: {
      variantA: EmailTemplate;
      variantB: EmailTemplate;
      splitRatio: number;
      testMetric: 'open_rate' | 'click_rate' | 'reply_rate';
    };
  }

  interface Campaign {
    id: string;
    name: string;
    status: 'draft' | 'active' | 'paused' | 'completed';
    type: 'sequence' | 'trigger';
    steps: SequenceStep[];
    triggers: string[];
    stats: {
      sent: number;
      opened: number;
      clicked: number;
      replied: number;
      revenue: number;
      unsubscribed: number;
      bounced: number;
    };
    abTests?: {
      id: string;
      name: string;
      status: 'running' | 'completed';
      winner?: 'A' | 'B';
      confidence: number;
    }[];
    createdAt: string;
    lastModified: string;
  }

  interface Trigger {
    id: string;
    name: string;
    type: 'lead_score' | 'website_activity' | 'email_engagement' | 'meeting_noshow' | 'form_submission' | 'page_visit';
    condition: string;
    value: string | number;
    campaignId: string;
    isActive: boolean;
    triggerCount: number;
    lastTriggered?: string;
  }

  interface Integration {
    id: string;
    name: string;
    type: 'email' | 'crm' | 'sms' | 'social';
    status: 'connected' | 'disconnected' | 'error';
    lastSync?: string;
    config?: any;
  }

  // State
  let activeTab = $state('campaigns');
  let campaigns = $state<Campaign[]>([]);
  let templates = $state<EmailTemplate[]>([]);
  let triggers = $state<Trigger[]>([]);
  let integrations = $state<Integration[]>([]);
  let selectedCampaign = $state<Campaign | null>(null);
  let showCampaignDialog = $state(false);
  let showTemplateDialog = $state(false);
  let showTriggerDialog = $state(false);
  let showABTestDialog = $state(false);
  let showIntegrationDialog = $state(false);
  let isGeneratingContent = $state(false);
  let draggedStep = $state<SequenceStep | null>(null);

  // Form states
  let campaignForm = $state({
    name: '',
    type: 'sequence' as 'sequence' | 'trigger',
    description: ''
  });

  let templateForm = $state({
    name: '',
    subject: '',
    content: '',
    category: 'follow-up'
  });

  let triggerForm = $state({
    name: '',
    type: 'lead_score' as Trigger['type'],
    condition: 'greater_than',
    value: '',
    campaignId: ''
  });

  let abTestForm = $state({
    name: '',
    stepId: '',
    variantASubject: '',
    variantAContent: '',
    variantBSubject: '',
    variantBContent: '',
    splitRatio: 50,
    testMetric: 'open_rate' as 'open_rate' | 'click_rate' | 'reply_rate'
  });

  // Mock data
  onMount(() => {
    loadMockData();
  });

  function loadMockData() {
    // Mock campaigns with enhanced data
    campaigns = [
      {
        id: 'camp-1',
        name: 'New Lead Nurture Sequence',
        status: 'active',
        type: 'sequence',
        steps: [
          {
            id: 'step-1',
            type: 'email',
            delay: 0,
            delayUnit: 'minutes',
            subject: 'Welcome to AI Sales Copilot!',
            content: 'Thank you for your interest in our platform...'
          },
          {
            id: 'step-2',
            type: 'wait',
            delay: 2,
            delayUnit: 'days'
          },
          {
            id: 'step-3',
            type: 'ab_test',
            delay: 0,
            delayUnit: 'minutes',
            abTestConfig: {
              variantA: {
                id: 'var-a',
                name: 'Variant A',
                subject: 'How AI Can Transform Your Sales Process',
                content: 'Did you know that companies using AI in sales...',
                category: 'nurture'
              },
              variantB: {
                id: 'var-b',
                name: 'Variant B',
                subject: 'Boost Your Sales with AI Technology',
                content: 'Transform your sales team with cutting-edge AI...',
                category: 'nurture'
              },
              splitRatio: 50,
              testMetric: 'open_rate'
            }
          },
          {
            id: 'step-4',
            type: 'condition',
            delay: 3,
            delayUnit: 'days',
            condition: 'email_opened'
          },
          {
            id: 'step-5',
            type: 'linkedin',
            delay: 1,
            delayUnit: 'days',
            content: 'Hi {{firstName}}, I wanted to follow up on our email...'
          }
        ],
        triggers: ['lead_score_increase'],
        stats: {
          sent: 1247,
          opened: 623,
          clicked: 187,
          replied: 94,
          revenue: 125000,
          unsubscribed: 12,
          bounced: 8
        },
        abTests: [
          {
            id: 'ab-1',
            name: 'Subject Line Test',
            status: 'running',
            confidence: 85
          }
        ],
        createdAt: '2024-01-15',
        lastModified: '2024-01-20'
      },
      {
        id: 'camp-2',
        name: 'Demo No-Show Recovery',
        status: 'active',
        type: 'trigger',
        steps: [
          {
            id: 'step-1',
            type: 'email',
            delay: 1,
            delayUnit: 'hours',
            subject: 'We missed you at our demo',
            content: 'Hi {{firstName}}, we noticed you missed our scheduled demo...'
          },
          {
            id: 'step-2',
            type: 'wait',
            delay: 1,
            delayUnit: 'days'
          },
          {
            id: 'step-3',
            type: 'sms',
            delay: 0,
            delayUnit: 'minutes',
            content: 'Hi {{firstName}}, quick follow-up on our missed demo. Can we reschedule?'
          },
          {
            id: 'step-4',
            type: 'linkedin',
            delay: 2,
            delayUnit: 'days',
            content: 'Hi {{firstName}}, I wanted to follow up on our missed demo...'
          }
        ],
        triggers: ['meeting_noshow'],
        stats: {
          sent: 89,
          opened: 67,
          clicked: 23,
          replied: 12,
          revenue: 45000,
          unsubscribed: 2,
          bounced: 1
        },
        createdAt: '2024-01-20',
        lastModified: '2024-01-22'
      },
      {
        id: 'camp-3',
        name: 'High-Value Lead Engagement',
        status: 'paused',
        type: 'trigger',
        steps: [
          {
            id: 'step-1',
            type: 'email',
            delay: 0,
            delayUnit: 'minutes',
            subject: 'Exclusive invitation for {{companyName}}',
            content: 'Based on your profile, we have an exclusive offer...'
          },
          {
            id: 'step-2',
            type: 'wait',
            delay: 3,
            delayUnit: 'days'
          },
          {
            id: 'step-3',
            type: 'email',
            delay: 0,
            delayUnit: 'minutes',
            subject: 'Custom solution for {{companyName}}',
            content: 'I wanted to share how we helped similar companies...'
          }
        ],
        triggers: ['lead_score_high', 'pricing_page_visit'],
        stats: {
          sent: 156,
          opened: 124,
          clicked: 67,
          replied: 34,
          revenue: 89000,
          unsubscribed: 3,
          bounced: 2
        },
        createdAt: '2024-01-10',
        lastModified: '2024-01-18'
      }
    ];

    // Enhanced templates with A/B testing
    templates = [
      {
        id: 'temp-1',
        name: 'Welcome Email',
        subject: 'Welcome to {{companyName}}!',
        content: 'Hi {{firstName}},\n\nThank you for your interest in {{companyName}}...',
        category: 'welcome',
        openRate: 65,
        clickRate: 12
      },
      {
        id: 'temp-2',
        name: 'Follow-up After Demo',
        subject: 'Thanks for the demo, {{firstName}}',
        content: 'Hi {{firstName}},\n\nIt was great speaking with you today...',
        category: 'follow-up',
        openRate: 72,
        clickRate: 18,
        isABTest: true,
        variants: [
          {
            id: 'temp-2a',
            name: 'Variant A - Direct',
            subject: 'Next steps for {{companyName}}',
            content: 'Hi {{firstName}},\n\nLet\'s move forward with your implementation...',
            category: 'follow-up'
          },
          {
            id: 'temp-2b',
            name: 'Variant B - Soft',
            subject: 'How did we do in the demo?',
            content: 'Hi {{firstName}},\n\nI hope you found our demo valuable...',
            category: 'follow-up'
          }
        ]
      },
      {
        id: 'temp-3',
        name: 'Pricing Information',
        subject: 'Pricing details for {{companyName}}',
        content: 'Hi {{firstName}},\n\nAs requested, here are our pricing details...',
        category: 'pricing',
        openRate: 58,
        clickRate: 25
      },
      {
        id: 'temp-4',
        name: 'Case Study Share',
        subject: 'How {{similarCompany}} increased sales by 40%',
        content: 'Hi {{firstName}},\n\nI thought you\'d be interested in this case study...',
        category: 'nurture',
        openRate: 61,
        clickRate: 22
      }
    ];

    // Enhanced triggers
    triggers = [
      {
        id: 'trig-1',
        name: 'High Lead Score',
        type: 'lead_score',
        condition: 'greater_than',
        value: 80,
        campaignId: 'camp-1',
        isActive: true,
        triggerCount: 45,
        lastTriggered: '2024-01-22T10:30:00Z'
      },
      {
        id: 'trig-2',
        name: 'Pricing Page Visit',
        type: 'website_activity',
        condition: 'visited_page',
        value: '/pricing',
        campaignId: 'camp-3',
        isActive: true,
        triggerCount: 23,
        lastTriggered: '2024-01-22T14:15:00Z'
      },
      {
        id: 'trig-3',
        name: 'Email Not Opened',
        type: 'email_engagement',
        condition: 'not_opened',
        value: '3_days',
        campaignId: 'camp-2',
        isActive: true,
        triggerCount: 12,
        lastTriggered: '2024-01-21T16:45:00Z'
      },
      {
        id: 'trig-4',
        name: 'Demo Request Form',
        type: 'form_submission',
        condition: 'form_submitted',
        value: 'demo_request',
        campaignId: 'camp-1',
        isActive: true,
        triggerCount: 67,
        lastTriggered: '2024-01-22T11:20:00Z'
      },
      {
        id: 'trig-5',
        name: 'Features Page Multiple Visits',
        type: 'page_visit',
        condition: 'visited_count',
        value: 3,
        campaignId: 'camp-3',
        isActive: false,
        triggerCount: 8,
        lastTriggered: '2024-01-20T09:30:00Z'
      }
    ];

    // Integration status
    integrations = [
      {
        id: 'int-1',
        name: 'Gmail',
        type: 'email',
        status: 'connected',
        lastSync: '2024-01-22T12:00:00Z'
      },
      {
        id: 'int-2',
        name: 'Salesforce',
        type: 'crm',
        status: 'connected',
        lastSync: '2024-01-22T11:45:00Z'
      },
      {
        id: 'int-3',
        name: 'HubSpot',
        type: 'crm',
        status: 'disconnected'
      },
      {
        id: 'int-4',
        name: 'LinkedIn Sales Navigator',
        type: 'social',
        status: 'error',
        lastSync: '2024-01-21T08:30:00Z'
      },
      {
        id: 'int-5',
        name: 'Twilio SMS',
        type: 'sms',
        status: 'connected',
        lastSync: '2024-01-22T10:15:00Z'
      },
      {
        id: 'int-6',
        name: 'Outlook',
        type: 'email',
        status: 'disconnected'
      }
    ];
  }

  // Campaign management
  function createCampaign() {
    const newCampaign: Campaign = {
      id: `camp-${Date.now()}`,
      name: campaignForm.name,
      status: 'draft',
      type: campaignForm.type,
      steps: [],
      triggers: [],
      stats: {
        sent: 0,
        opened: 0,
        clicked: 0,
        replied: 0,
        revenue: 0,
        unsubscribed: 0,
        bounced: 0
      },
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    campaigns = [...campaigns, newCampaign];
    selectedCampaign = newCampaign;
    showCampaignDialog = false;
    campaignForm = { name: '', type: 'sequence', description: '' };
    toast.success('Campaign created successfully');
  }

  function toggleCampaignStatus(campaignId: string) {
    campaigns = campaigns.map(campaign => {
      if (campaign.id === campaignId) {
        const newStatus = campaign.status === 'active' ? 'paused' : 'active';
        return { ...campaign, status: newStatus, lastModified: new Date().toISOString() };
      }
      return campaign;
    });
    toast.success('Campaign status updated');
  }

  function duplicateCampaign(campaign: Campaign) {
    const newCampaign: Campaign = {
      ...campaign,
      id: `camp-${Date.now()}`,
      name: `${campaign.name} (Copy)`,
      status: 'draft',
      stats: {
        sent: 0,
        opened: 0,
        clicked: 0,
        replied: 0,
        revenue: 0,
        unsubscribed: 0,
        bounced: 0
      },
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    campaigns = [...campaigns, newCampaign];
    toast.success('Campaign duplicated successfully');
  }

  // Enhanced sequence builder
  function addStep(type: SequenceStep['type']) {
    if (!selectedCampaign) return;

    const newStep: SequenceStep = {
      id: `step-${Date.now()}`,
      type,
      delay: type === 'wait' ? 1 : 0,
      delayUnit: 'days'
    };

    if (type === 'email') {
      newStep.subject = '';
      newStep.content = '';
    } else if (type === 'ab_test') {
      newStep.abTestConfig = {
        variantA: {
          id: `var-a-${Date.now()}`,
          name: 'Variant A',
          subject: '',
          content: '',
          category: 'test'
        },
        variantB: {
          id: `var-b-${Date.now()}`,
          name: 'Variant B',
          subject: '',
          content: '',
          category: 'test'
        },
        splitRatio: 50,
        testMetric: 'open_rate'
      };
    }

    selectedCampaign.steps = [...selectedCampaign.steps, newStep];
    selectedCampaign.lastModified = new Date().toISOString();
    updateCampaign(selectedCampaign);
  }

  function removeStep(stepId: string) {
    if (!selectedCampaign) return;

    selectedCampaign.steps = selectedCampaign.steps.filter(step => step.id !== stepId);
    selectedCampaign.lastModified = new Date().toISOString();
    updateCampaign(selectedCampaign);
  }

  function updateStep(stepId: string, updates: Partial<SequenceStep>) {
    if (!selectedCampaign) return;

    selectedCampaign.steps = selectedCampaign.steps.map(step =>
      step.id === stepId ? { ...step, ...updates } : step
    );
    selectedCampaign.lastModified = new Date().toISOString();
    updateCampaign(selectedCampaign);
  }

  function updateCampaign(campaign: Campaign) {
    campaigns = campaigns.map(c => c.id === campaign.id ? campaign : c);
  }

  // Template management with AI
  function createTemplate() {
    const newTemplate: EmailTemplate = {
      id: `temp-${Date.now()}`,
      ...templateForm
    };

    templates = [...templates, newTemplate];
    showTemplateDialog = false;
    templateForm = { name: '', subject: '', content: '', category: 'follow-up' };
    toast.success('Template created successfully');
  }

  async function generateAIContent(prompt: string, type: 'subject' | 'content') {
    isGeneratingContent = true;
    
    try {
      // Simulate AI content generation with more realistic responses
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (type === 'subject') {
        const subjects = [
          'Quick question about {{companyName}}\'s growth goals',
          'Following up on our conversation, {{firstName}}',
          'Thought you might find this interesting, {{firstName}}',
          'Next steps for {{companyName}}\'s success',
          'Custom solution designed for {{companyName}}',
          '{{firstName}}, here\'s what we discussed',
          'Exclusive opportunity for {{companyName}}',
          'How {{similarCompany}} achieved 40% growth'
        ];
        templateForm.subject = subjects[Math.floor(Math.random() * subjects.length)];
      } else {
        const contents = [
          `Hi {{firstName}},

I hope this email finds you well. I wanted to follow up on our recent conversation about {{companyName}}'s sales process.

Based on what you shared, I believe our AI Sales Copilot could help you:
• Increase lead conversion by 35%
• Reduce sales cycle time by 30%
• Improve team productivity significantly

I'd love to show you a quick demo of how companies like {{similarCompany}} have achieved remarkable results.

Would you be available for a 15-minute call this week?

Best regards,
{{senderName}}`,

          `Hi {{firstName}},

I came across {{companyName}} and was impressed by your recent growth in the {{industry}} sector.

Many companies in your space are facing similar challenges:
- Managing increasing lead volume
- Maintaining personalized outreach at scale
- Tracking ROI on sales activities

Our AI Sales Copilot has helped companies like yours overcome these exact challenges. {{similarCompany}} saw a 40% increase in qualified leads within 90 days.

I'd be happy to share their case study and discuss how this could apply to {{companyName}}.

Are you free for a brief call this week?

Best,
{{senderName}}`,

          `Hi {{firstName}},

Thank you for taking the time to learn about our AI Sales Copilot during our demo.

I wanted to follow up with the specific ROI projections we discussed for {{companyName}}:

📈 Projected Results (90 days):
• 35% increase in lead conversion
• 25% reduction in sales cycle
• 40% improvement in team productivity
• ${{projectedRevenue}} additional revenue

Next steps:
1. Review the custom proposal I've attached
2. Schedule implementation planning call
3. Begin 30-day pilot program

I'm excited about the potential impact this could have on {{companyName}}'s growth.

When would be a good time to discuss the proposal?

Best regards,
{{senderName}}`
        ];
        templateForm.content = contents[Math.floor(Math.random() * contents.length)];
      }
      
      toast.success(`AI ${type} generated successfully`);
    } catch (error) {
      toast.error('Failed to generate content');
    } finally {
      isGeneratingContent = false;
    }
  }

  // A/B Testing functionality
  function createABTest() {
    if (!selectedCampaign) return;

    const stepToTest = selectedCampaign.steps.find(step => step.id === abTestForm.stepId);
    if (!stepToTest) return;

    const abTestStep: SequenceStep = {
      ...stepToTest,
      id: `step-ab-${Date.now()}`,
      type: 'ab_test',
      abTestConfig: {
        variantA: {
          id: `var-a-${Date.now()}`,
          name: 'Variant A',
          subject: abTestForm.variantASubject,
          content: abTestForm.variantAContent,
          category: 'test'
        },
        variantB: {
          id: `var-b-${Date.now()}`,
          name: 'Variant B',
          subject: abTestForm.variantBSubject,
          content: abTestForm.variantBContent,
          category: 'test'
        },
        splitRatio: abTestForm.splitRatio,
        testMetric: abTestForm.testMetric
      }
    };

    // Replace the original step with A/B test
    selectedCampaign.steps = selectedCampaign.steps.map(step =>
      step.id === abTestForm.stepId ? abTestStep : step
    );

    // Add A/B test to campaign
    if (!selectedCampaign.abTests) selectedCampaign.abTests = [];
    selectedCampaign.abTests.push({
      id: `ab-${Date.now()}`,
      name: abTestForm.name,
      status: 'running',
      confidence: 0
    });

    selectedCampaign.lastModified = new Date().toISOString();
    updateCampaign(selectedCampaign);
    showABTestDialog = false;
    abTestForm = {
      name: '',
      stepId: '',
      variantASubject: '',
      variantAContent: '',
      variantBSubject: '',
      variantBContent: '',
      splitRatio: 50,
      testMetric: 'open_rate'
    };
    toast.success('A/B test created successfully');
  }

  // Trigger management
  function createTrigger() {
    const newTrigger: Trigger = {
      id: `trig-${Date.now()}`,
      ...triggerForm,
      isActive: true,
      triggerCount: 0
    };

    triggers = [...triggers, newTrigger];
    showTriggerDialog = false;
    triggerForm = { name: '', type: 'lead_score', condition: 'greater_than', value: '', campaignId: '' };
    toast.success('Trigger created successfully');
  }

  function toggleTrigger(triggerId: string) {
    triggers = triggers.map(trigger =>
      trigger.id === triggerId ? { ...trigger, isActive: !trigger.isActive } : trigger
    );
    toast.success('Trigger updated');
  }

  // Analytics calculations
  let campaignAnalytics = $derived.by(() => {
    const totalSent = campaigns.reduce((sum, c) => sum + c.stats.sent, 0);
    const totalOpened = campaigns.reduce((sum, c) => sum + c.stats.opened, 0);
    const totalClicked = campaigns.reduce((sum, c) => sum + c.stats.clicked, 0);
    const totalReplied = campaigns.reduce((sum, c) => sum + c.stats.replied, 0);
    const totalRevenue = campaigns.reduce((sum, c) => sum + c.stats.revenue, 0);
    const totalUnsubscribed = campaigns.reduce((sum, c) => sum + c.stats.unsubscribed, 0);
    const totalBounced = campaigns.reduce((sum, c) => sum + c.stats.bounced, 0);

    return {
      totalSent,
      openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
      clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
      replyRate: totalSent > 0 ? (totalReplied / totalSent) * 100 : 0,
      unsubscribeRate: totalSent > 0 ? (totalUnsubscribed / totalSent) * 100 : 0,
      bounceRate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0,
      totalRevenue,
      roi: totalRevenue > 0 ? ((totalRevenue - 15000) / 15000) * 100 : 0, // Assuming $15k cost
      avgRevenuePerEmail: totalSent > 0 ? totalRevenue / totalSent : 0
    };
  });

  // Drag and drop with enhanced functionality
  function handleDragStart(event: any) {
    const stepId = event.active.id;
    draggedStep = selectedCampaign?.steps.find(step => step.id === stepId) || null;
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    
    if (active.id !== over.id && selectedCampaign) {
      const oldIndex = selectedCampaign.steps.findIndex(step => step.id === active.id);
      const newIndex = selectedCampaign.steps.findIndex(step => step.id === over.id);
      
      const newSteps = [...selectedCampaign.steps];
      const [removed] = newSteps.splice(oldIndex, 1);
      newSteps.splice(newIndex, 0, removed);
      
      selectedCampaign.steps = newSteps;
      selectedCampaign.lastModified = new Date().toISOString();
      updateCampaign(selectedCampaign);
      toast.success('Step order updated');
    }
    
    draggedStep = null;
  }

  // Integration management
  function connectIntegration(integrationId: string) {
    integrations = integrations.map(integration =>
      integration.id === integrationId
        ? { ...integration, status: 'connected', lastSync: new Date().toISOString() }
        : integration
    );
    toast.success('Integration connected successfully');
  }

  function disconnectIntegration(integrationId: string) {
    integrations = integrations.map(integration =>
      integration.id === integrationId
        ? { ...integration, status: 'disconnected', lastSync: undefined }
        : integration
    );
    toast.success('Integration disconnected');
  }

  // Utility functions
  function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  function formatPercentage(value: number) {
    return `${value.toFixed(1)}%`;
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  }

  function getIntegrationStatusColor(status: string) {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'disconnected': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  }

  function getStepIcon(type: string) {
    switch (type) {
      case 'email': return Mail;
      case 'linkedin': return MessageSquare;
      case 'sms': return Phone;
      case 'wait': return Clock;
      case 'condition': return Filter;
      case 'ab_test': return TestTube;
      default: return Mail;
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function formatDateTime(dateString: string) {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Export functionality
  function exportCampaignData() {
    const data = {
      campaigns: campaigns.map(c => ({
        ...c,
        performance: {
          openRate: c.stats.sent > 0 ? (c.stats.opened / c.stats.sent) * 100 : 0,
          clickRate: c.stats.opened > 0 ? (c.stats.clicked / c.stats.opened) * 100 : 0,
          replyRate: c.stats.sent > 0 ? (c.stats.replied / c.stats.sent) * 100 : 0
        }
      })),
      analytics: campaignAnalytics,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `automation-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Campaign data exported successfully');
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold">Marketing Automation</h1>
      <p class="text-muted-foreground">Create and manage automated follow-up campaigns with AI-powered insights</p>
    </div>
    <div class="flex items-center gap-4">
      <Button variant="outline" onclick={exportCampaignData}>
        <Download class="h-4 w-4 mr-2" />
        Export Data
      </Button>
      <Button variant="outline" onclick={() => showTemplateDialog = true}>
        <Plus class="h-4 w-4 mr-2" />
        New Template
      </Button>
      <Button onclick={() => showCampaignDialog = true}>
        <Plus class="h-4 w-4 mr-2" />
        New Campaign
      </Button>
    </div>
  </div>

  <!-- Enhanced Analytics Overview -->
  <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
    <Card.Root class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Total Sent</p>
          <p class="text-2xl font-bold">{campaignAnalytics.totalSent.toLocaleString()}</p>
        </div>
        <Mail class="h-8 w-8 text-muted-foreground" />
      </div>
    </Card.Root>

    <Card.Root class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Open Rate</p>
          <p class="text-2xl font-bold">{formatPercentage(campaignAnalytics.openRate)}</p>
        </div>
        <Eye class="h-8 w-8 text-muted-foreground" />
      </div>
    </Card.Root>

    <Card.Root class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Click Rate</p>
          <p class="text-2xl font-bold">{formatPercentage(campaignAnalytics.clickRate)}</p>
        </div>
        <MousePointer class="h-8 w-8 text-muted-foreground" />
      </div>
    </Card.Root>

    <Card.Root class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Reply Rate</p>
          <p class="text-2xl font-bold">{formatPercentage(campaignAnalytics.replyRate)}</p>
        </div>
        <Reply class="h-8 w-8 text-muted-foreground" />
      </div>
    </Card.Root>

    <Card.Root class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Revenue</p>
          <p class="text-2xl font-bold">{formatCurrency(campaignAnalytics.totalRevenue)}</p>
        </div>
        <DollarSign class="h-8 w-8 text-muted-foreground" />
      </div>
    </Card.Root>

    <Card.Root class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">ROI</p>
          <p class="text-2xl font-bold">{formatPercentage(campaignAnalytics.roi)}</p>
        </div>
        <TrendingUp class="h-8 w-8 text-muted-foreground" />
      </div>
    </Card.Root>

    <Card.Root class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Unsubscribe</p>
          <p class="text-2xl font-bold">{formatPercentage(campaignAnalytics.unsubscribeRate)}</p>
        </div>
        <Users class="h-8 w-8 text-muted-foreground" />
      </div>
    </Card.Root>

    <Card.Root class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Avg Revenue</p>
          <p class="text-2xl font-bold">${campaignAnalytics.avgRevenuePerEmail.toFixed(2)}</p>
        </div>
        <Target class="h-8 w-8 text-muted-foreground" />
      </div>
    </Card.Root>
  </div>

  <!-- Main Content -->
  <Tabs.Root bind:value={activeTab} class="space-y-6">
    <Tabs.List class="grid w-full grid-cols-5">
      <Tabs.Trigger value="campaigns">Campaigns</Tabs.Trigger>
      <Tabs.Trigger value="templates">Templates</Tabs.Trigger>
      <Tabs.Trigger value="triggers">Triggers</Tabs.Trigger>
      <Tabs.Trigger value="analytics">Analytics</Tabs.Trigger>
      <Tabs.Trigger value="integrations">Integrations</Tabs.Trigger>
    </Tabs.List>

    <!-- Enhanced Campaigns Tab -->
    <Tabs.Content value="campaigns" class="space-y-6">
      {#if selectedCampaign}
        <!-- Enhanced Campaign Builder -->
        <Card.Root class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold">{selectedCampaign.name}</h2>
              <p class="text-muted-foreground">
                {selectedCampaign.type === 'sequence' ? 'Email Sequence' : 'Trigger-based'} Campaign
              </p>
            </div>
            <div class="flex items-center gap-4">
              <Badge class={getStatusColor(selectedCampaign.status)}>
                {selectedCampaign.status}
              </Badge>
              <Button variant="outline" onclick={() => showABTestDialog = true}>
                <TestTube class="h-4 w-4 mr-2" />
                Add A/B Test
              </Button>
              <Button variant="outline" onclick={() => selectedCampaign = null}>
                Back to Campaigns
              </Button>
            </div>
          </div>

          <!-- Campaign Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="text-center">
              <p class="text-2xl font-bold">{selectedCampaign.stats.sent}</p>
              <p class="text-sm text-muted-foreground">Sent</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold">
                {selectedCampaign.stats.sent > 0 
                  ? formatPercentage((selectedCampaign.stats.opened / selectedCampaign.stats.sent) * 100)
                  : '0%'}
              </p>
              <p class="text-sm text-muted-foreground">Open Rate</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold">
                {selectedCampaign.stats.opened > 0 
                  ? formatPercentage((selectedCampaign.stats.clicked / selectedCampaign.stats.opened) * 100)
                  : '0%'}
              </p>
              <p class="text-sm text-muted-foreground">Click Rate</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold">{formatCurrency(selectedCampaign.stats.revenue)}</p>
              <p class="text-sm text-muted-foreground">Revenue</p>
            </div>
          </div>

          <!-- A/B Tests -->
          {#if selectedCampaign.abTests && selectedCampaign.abTests.length > 0}
            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-4">Active A/B Tests</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {#each selectedCampaign.abTests as test}
                  <Card.Root class="p-4">
                    <div class="flex items-center justify-between mb-2">
                      <h4 class="font-medium">{test.name}</h4>
                      <Badge variant={test.status === 'running' ? 'default' : 'secondary'}>
                        {test.status}
                      </Badge>
                    </div>
                    <div class="flex items-center gap-4">
                      <div class="text-sm">
                        <span class="text-muted-foreground">Confidence:</span>
                        <span class="font-medium">{test.confidence}%</span>
                      </div>
                      {#if test.winner}
                        <div class="text-sm">
                          <span class="text-muted-foreground">Winner:</span>
                          <span class="font-medium">Variant {test.winner}</span>
                        </div>
                      {/if}
                    </div>
                  </Card.Root>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Enhanced Sequence Steps -->
          <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
          >
            <div class="space-y-4">
              <SortableContext
                items={selectedCampaign.steps}
                strategy={verticalListSortingStrategy}
              >
                {#each selectedCampaign.steps as step, index (step.id)}
                  {@render SortableStep({ step, index, isLast: index === selectedCampaign.steps.length - 1 })}
                {/each}
              </SortableContext>

              <!-- Add Step Buttons -->
              <div class="flex items-center gap-2 p-4 border-2 border-dashed rounded-lg">
                <span class="text-sm text-muted-foreground mr-4">Add step:</span>
                <Button variant="outline" size="sm" onclick={() => addStep('email')}>
                  <Mail class="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" size="sm" onclick={() => addStep('linkedin')}>
                  <MessageSquare class="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
                <Button variant="outline" size="sm" onclick={() => addStep('sms')}>
                  <Phone class="h-4 w-4 mr-2" />
                  SMS
                </Button>
                <Button variant="outline" size="sm" onclick={() => addStep('wait')}>
                  <Clock class="h-4 w-4 mr-2" />
                  Wait
                </Button>
                <Button variant="outline" size="sm" onclick={() => addStep('condition')}>
                  <Filter class="h-4 w-4 mr-2" />
                  Condition
                </Button>
                <Button variant="outline" size="sm" onclick={() => addStep('ab_test')}>
                  <TestTube class="h-4 w-4 mr-2" />
                  A/B Test
                </Button>
              </div>
            </div>

            <DragOverlay>
              {#if draggedStep}
                <div class="p-4 border rounded-lg bg-card shadow-lg">
                  <span class="font-medium capitalize">{draggedStep.type.replace('_', ' ')}</span>
                </div>
              {/if}
            </DragOverlay>
          </DndContext>
        </Card.Root>
      {:else}
        <!-- Enhanced Campaigns List -->
        <Card.Root>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head>Campaign</Table.Head>
                <Table.Head>Type</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head>Performance</Table.Head>
                <Table.Head>Revenue</Table.Head>
                <Table.Head>Last Modified</Table.Head>
                <Table.Head>Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each campaigns as campaign}
                <Table.Row>
                  <Table.Cell>
                    <div>
                      <p class="font-medium">{campaign.name}</p>
                      <p class="text-sm text-muted-foreground">
                        {campaign.steps.length} steps
                        {#if campaign.abTests && campaign.abTests.length > 0}
                          • {campaign.abTests.length} A/B test{campaign.abTests.length > 1 ? 's' : ''}
                        {/if}
                      </p>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant="outline">{campaign.type}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge class={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div class="space-y-1">
                      <div class="text-sm">
                        <span class="text-muted-foreground">Sent:</span> {campaign.stats.sent.toLocaleString()}
                      </div>
                      <div class="text-sm">
                        <span class="text-muted-foreground">Open:</span>
                        {campaign.stats.sent > 0 
                          ? formatPercentage((campaign.stats.opened / campaign.stats.sent) * 100)
                          : '0%'}
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>{formatCurrency(campaign.stats.revenue)}</Table.Cell>
                  <Table.Cell>{formatDate(campaign.lastModified)}</Table.Cell>
                  <Table.Cell>
                    <div class="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onclick={() => selectedCampaign = campaign}
                      >
                        <Edit class="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onclick={() => toggleCampaignStatus(campaign.id)}
                      >
                        {#if campaign.status === 'active'}
                          <Pause class="h-4 w-4" />
                        {:else}
                          <Play class="h-4 w-4" />
                        {/if}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onclick={() => duplicateCampaign(campaign)}
                      >
                        <Copy class="h-4 w-4" />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </Card.Root>
      {/if}
    </Tabs.Content>

    <!-- Enhanced Templates Tab -->
    <Tabs.Content value="templates" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each templates as template}
          <Card.Root class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="font-semibold">{template.name}</h3>
                <Badge variant="outline" class="mt-2">{template.category}</Badge>
                {#if template.isABTest}
                  <Badge variant="secondary" class="mt-2 ml-2">
                    <TestTube class="h-3 w-3 mr-1" />
                    A/B Test
                  </Badge>
                {/if}
              </div>
              <Button variant="ghost" size="icon">
                <Edit class="h-4 w-4" />
              </Button>
            </div>

            <div class="space-y-2 mb-4">
              <p class="text-sm font-medium">Subject:</p>
              <p class="text-sm text-muted-foreground">{template.subject}</p>
            </div>

            <div class="space-y-2 mb-4">
              <p class="text-sm font-medium">Preview:</p>
              <p class="text-sm text-muted-foreground line-clamp-3">
                {template.content.substring(0, 100)}...
              </p>
            </div>

            {#if template.openRate}
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-muted-foreground">Open Rate:</span>
                  <span class="font-medium">{template.openRate}%</span>
                </div>
                <div>
                  <span class="text-muted-foreground">Click Rate:</span>
                  <span class="font-medium">{template.clickRate}%</span>
                </div>
              </div>
            {/if}

            {#if template.variants && template.variants.length > 0}
              <Separator class="my-4" />
              <div>
                <p class="text-sm font-medium mb-2">Variants:</p>
                <div class="space-y-2">
                  {#each template.variants as variant}
                    <div class="text-xs p-2 bg-muted rounded">
                      <p class="font-medium">{variant.name}</p>
                      <p class="text-muted-foreground">{variant.subject}</p>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </Card.Root>
        {/each}
      </div>
    </Tabs.Content>

    <!-- Enhanced Triggers Tab -->
    <Tabs.Content value="triggers" class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">Automation Triggers</h2>
        <Button onclick={() => showTriggerDialog = true}>
          <Plus class="h-4 w-4 mr-2" />
          New Trigger
        </Button>
      </div>

      <Card.Root>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head>Trigger Name</Table.Head>
              <Table.Head>Type</Table.Head>
              <Table.Head>Condition</Table.Head>
              <Table.Head>Campaign</Table.Head>
              <Table.Head>Triggered</Table.Head>
              <Table.Head>Last Triggered</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head>Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each triggers as trigger}
              <Table.Row>
                <Table.Cell>
                  <div class="flex items-center gap-2">
                    <Zap class="h-4 w-4 text-primary" />
                    {trigger.name}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Badge variant="outline">{trigger.type.replace('_', ' ')}</Badge>
                </Table.Cell>
                <Table.Cell>
                  <span class="text-sm">{trigger.condition} {trigger.value}</span>
                </Table.Cell>
                <Table.Cell>
                  {campaigns.find(c => c.id === trigger.campaignId)?.name || 'Unknown'}
                </Table.Cell>
                <Table.Cell>
                  <span class="font-medium">{trigger.triggerCount}</span>
                </Table.Cell>
                <Table.Cell>
                  {trigger.lastTriggered ? formatDateTime(trigger.lastTriggered) : 'Never'}
                </Table.Cell>
                <Table.Cell>
                  <Switch
                    checked={trigger.isActive}
                    onCheckedChange={() => toggleTrigger(trigger.id)}
                  />
                </Table.Cell>
                <Table.Cell>
                  <Button variant="ghost" size="icon">
                    <Edit class="h-4 w-4" />
                  </Button>
                </Table.Cell>
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
      </Card.Root>
    </Tabs.Content>

    <!-- Enhanced Analytics Tab -->
    <Tabs.Content value="analytics" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Performance Chart Placeholder -->
        <Card.Root class="p-6">
          <h3 class="text-lg font-semibold mb-4">Campaign Performance Trends</h3>
          <div class="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
            <div class="text-center">
              <BarChart class="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p class="text-muted-foreground">Performance trends chart</p>
              <p class="text-sm text-muted-foreground">Open rates, click rates, and revenue over time</p>
            </div>
          </div>
        </Card.Root>

        <!-- Revenue Attribution -->
        <Card.Root class="p-6">
          <h3 class="text-lg font-semibold mb-4">Revenue Attribution</h3>
          <div class="space-y-4">
            {#each campaigns.filter(c => c.stats.revenue > 0) as campaign}
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">{campaign.name}</p>
                  <p class="text-sm text-muted-foreground">
                    {campaign.stats.sent} sent • {formatPercentage((campaign.stats.opened / campaign.stats.sent) * 100)} open rate
                  </p>
                </div>
                <div class="text-right">
                  <p class="font-bold">{formatCurrency(campaign.stats.revenue)}</p>
                  <p class="text-sm text-muted-foreground">
                    {campaign.stats.replied} replies
                  </p>
                </div>
              </div>
            {/each}
          </div>
        </Card.Root>

        <!-- A/B Test Results -->
        <Card.Root class="p-6">
          <h3 class="text-lg font-semibold mb-4">A/B Test Results</h3>
          <div class="space-y-4">
            <div class="p-4 border rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium">Subject Line Test - Welcome Series</span>
                <Badge variant="outline">Completed</Badge>
              </div>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-muted-foreground">Variant A</p>
                  <p>"Welcome to AI Sales Copilot!"</p>
                  <p class="text-primary">Open rate: 24.5%</p>
                </div>
                <div>
                  <p class="text-muted-foreground">Variant B (Winner)</p>
                  <p>"Your AI sales journey starts now"</p>
                  <p class="text-primary">Open rate: 31.2%</p>
                </div>
              </div>
              <div class="mt-2 text-sm text-muted-foreground">
                Confidence: 95% • Improvement: +27.3%
              </div>
            </div>

            <div class="p-4 border rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium">CTA Button Test - Demo Follow-up</span>
                <Badge variant="default">Running</Badge>
              </div>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-muted-foreground">Variant A</p>
                  <p>"Schedule Your Demo"</p>
                  <p class="text-primary">Click rate: 12.8%</p>
                </div>
                <div>
                  <p class="text-muted-foreground">Variant B</p>
                  <p>"See It In Action"</p>
                  <p class="text-primary">Click rate: 15.2%</p>
                </div>
              </div>
              <div class="mt-2 text-sm text-muted-foreground">
                Confidence: 78% • Need 50 more conversions for significance
              </div>
            </div>
          </div>
        </Card.Root>

        <!-- Channel Performance -->
        <Card.Root class="p-6">
          <h3 class="text-lg font-semibold mb-4">Channel Performance</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div class="flex items-center gap-3">
                <Mail class="h-5 w-5 text-primary" />
                <div>
                  <p class="font-medium">Email</p>
                  <p class="text-sm text-muted-foreground">Primary channel</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-bold">78.5%</p>
                <p class="text-sm text-muted-foreground">Response rate</p>
              </div>
            </div>

            <div class="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div class="flex items-center gap-3">
                <MessageSquare class="h-5 w-5 text-primary" />
                <div>
                  <p class="font-medium">LinkedIn</p>
                  <p class="text-sm text-muted-foreground">Professional outreach</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-bold">45.2%</p>
                <p class="text-sm text-muted-foreground">Response rate</p>
              </div>
            </div>

            <div class="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div class="flex items-center gap-3">
                <Phone class="h-5 w-5 text-primary" />
                <div>
                  <p class="font-medium">SMS</p>
                  <p class="text-sm text-muted-foreground">Urgent follow-ups</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-bold">89.1%</p>
                <p class="text-sm text-muted-foreground">Response rate</p>
              </div>
            </div>
          </div>
        </Card.Root>
      </div>
    </Tabs.Content>

    <!-- Enhanced Integrations Tab -->
    <Tabs.Content value="integrations" class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">Integration Status</h2>
        <Button variant="outline" onclick={() => showIntegrationDialog = true}>
          <Plus class="h-4 w-4 mr-2" />
          Add Integration
        </Button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each integrations as integration}
          <Card.Root class="p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                {#if integration.type === 'email'}
                  <Mail class="h-8 w-8 text-primary" />
                {:else if integration.type === 'crm'}
                  <Users class="h-8 w-8 text-primary" />
                {:else if integration.type === 'sms'}
                  <Phone class="h-8 w-8 text-primary" />
                {:else if integration.type === 'social'}
                  <MessageSquare class="h-8 w-8 text-primary" />
                {/if}
                <div>
                  <h3 class="font-semibold">{integration.name}</h3>
                  <p class="text-sm text-muted-foreground capitalize">{integration.type}</p>
                </div>
              </div>
              <Badge class={getIntegrationStatusColor(integration.status)}>
                {integration.status}
              </Badge>
            </div>

            {#if integration.lastSync}
              <p class="text-sm text-muted-foreground mb-4">
                Last sync: {formatDateTime(integration.lastSync)}
              </p>
            {/if}

            <div class="flex gap-2">
              {#if integration.status === 'connected'}
                <Button variant="outline" size="sm" onclick={() => disconnectIntegration(integration.id)}>
                  Disconnect
                </Button>
              {:else}
                <Button size="sm" onclick={() => connectIntegration(integration.id)}>
                  Connect
                </Button>
              {/if}
              <Button variant="ghost" size="sm">
                <Settings class="h-4 w-4" />
              </Button>
            </div>
          </Card.Root>
        {/each}
      </div>

      <!-- Integration Health -->
      <Card.Root class="p-6">
        <h3 class="text-lg font-semibold mb-4">Integration Health</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span>Email Delivery Rate</span>
            <div class="flex items-center gap-2">
              <Progress value={97.5} class="w-24" />
              <span class="text-sm font-medium">97.5%</span>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span>CRM Sync Success</span>
            <div class="flex items-center gap-2">
              <Progress value={99.2} class="w-24" />
              <span class="text-sm font-medium">99.2%</span>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span>API Response Time</span>
            <div class="flex items-center gap-2">
              <Progress value={85} class="w-24" />
              <span class="text-sm font-medium">245ms avg</span>
            </div>
          </div>
        </div>
      </Card.Root>
    </Tabs.Content>
  </Tabs.Root>

  <!-- Create Campaign Dialog -->
  <Dialog.Root bind:open={showCampaignDialog}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Create New Campaign</Dialog.Title>
        <Dialog.Description>
          Set up a new automated follow-up campaign with AI-powered optimization
        </Dialog.Description>
      </Dialog.Header>

      <div class="space-y-4">
        <div>
          <Label for="campaign-name">Campaign Name</Label>
          <Input
            id="campaign-name"
            placeholder="Enter campaign name..."
            bind:value={campaignForm.name}
          />
        </div>

        <div>
          <Label for="campaign-type">Campaign Type</Label>
          <Select.Root bind:value={campaignForm.type}>
            <Select.Trigger id="campaign-type">
              {campaignForm.type === 'sequence' ? 'Email Sequence' : 'Trigger-based'}
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="sequence">Email Sequence</Select.Item>
              <Select.Item value="trigger">Trigger-based</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>

        <div>
          <Label for="campaign-description">Description (Optional)</Label>
          <Textarea
            id="campaign-description"
            placeholder="Describe your campaign..."
            bind:value={campaignForm.description}
          />
        </div>
      </div>

      <Dialog.Footer>
        <Button variant="outline" onclick={() => showCampaignDialog = false}>
          Cancel
        </Button>
        <Button onclick={createCampaign} disabled={!campaignForm.name}>
          Create Campaign
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>

  <!-- Enhanced Template Dialog -->
  <Dialog.Root bind:open={showTemplateDialog}>
    <Dialog.Content class="max-w-2xl">
      <Dialog.Header>
        <Dialog.Title>Create Email Template</Dialog.Title>
        <Dialog.Description>
          Create a reusable email template with AI assistance and personalization
        </Dialog.Description>
      </Dialog.Header>

      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label for="template-name">Template Name</Label>
            <Input
              id="template-name"
              placeholder="Enter template name..."
              bind:value={templateForm.name}
            />
          </div>
          <div>
            <Label for="template-category">Category</Label>
            <Select.Root bind:value={templateForm.category}>
              <Select.Trigger id="template-category">
                {templateForm.category}
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="welcome">Welcome</Select.Item>
                <Select.Item value="follow-up">Follow-up</Select.Item>
                <Select.Item value="pricing">Pricing</Select.Item>
                <Select.Item value="demo">Demo</Select.Item>
                <Select.Item value="nurture">Nurture</Select.Item>
                <Select.Item value="re-engagement">Re-engagement</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <Label for="template-subject">Subject Line</Label>
            <Button
              variant="outline"
              size="sm"
              onclick={() => generateAIContent('Generate a compelling subject line', 'subject')}
              disabled={isGeneratingContent}
            >
              <Sparkles class="h-4 w-4 mr-2" />
              {isGeneratingContent ? 'Generating...' : 'AI Generate'}
            </Button>
          </div>
          <Input
            id="template-subject"
            placeholder="Enter subject line..."
            bind:value={templateForm.subject}
          />
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <Label for="template-content">Email Content</Label>
            <Button
              variant="outline"
              size="sm"
              onclick={() => generateAIContent('Generate professional email content', 'content')}
              disabled={isGeneratingContent}
            >
              <Sparkles class="h-4 w-4 mr-2" />
              {isGeneratingContent ? 'Generating...' : 'AI Generate'}
            </Button>
          </div>
          <Textarea
            id="template-content"
            placeholder="Enter email content..."
            bind:value={templateForm.content}
            rows={8}
          />
        </div>

        <div class="p-4 bg-muted/50 rounded-lg">
          <p class="text-sm font-medium mb-2">Available Personalization Tokens:</p>
          <div class="flex flex-wrap gap-2">
            {#each ['{{firstName}}', '{{lastName}}', '{{companyName}}', '{{title}}', '{{senderName}}', '{{industry}}', '{{similarCompany}}', '{{projectedRevenue}}'] as token}
              <Badge 
                variant="outline" 
                class="cursor-pointer hover:bg-primary hover:text-primary-foreground" 
                onclick={() => templateForm.content += token}
              >
                {token}
              </Badge>
            {/each}
          </div>
        </div>
      </div>

      <Dialog.Footer>
        <Button variant="outline" onclick={() => showTemplateDialog = false}>
          Cancel
        </Button>
        <Button onclick={createTemplate} disabled={!templateForm.name || !templateForm.subject}>
          Create Template
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>

  <!-- Enhanced A/B Test Dialog -->
  <Dialog.Root bind:open={showABTestDialog}>
    <Dialog.Content class="max-w-3xl">
      <Dialog.Header>
        <Dialog.Title>Create A/B Test</Dialog.Title>
        <Dialog.Description>
          Test different versions of your email to optimize performance
        </Dialog.Description>
      </Dialog.Header>

      <div class="space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label for="ab-test-name">Test Name</Label>
            <Input
              id="ab-test-name"
              placeholder="Enter test name..."
              bind:value={abTestForm.name}
            />
          </div>
          <div>
            <Label for="ab-test-step">Email Step to Test</Label>
            <Select.Root bind:value={abTestForm.stepId}>
              <Select.Trigger id="ab-test-step">
                {abTestForm.stepId ? `Step ${selectedCampaign?.steps.findIndex(s => s.id === abTestForm.stepId) + 1}` : "Select step"}
              </Select.Trigger>
              <Select.Content>
                {#each selectedCampaign?.steps.filter(s => s.type === 'email') || [] as step, index}
                  <Select.Item value={step.id}>Step {index + 1} - {step.subject || 'Email'}</Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <!-- Variant A -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Variant A (Control)</h3>
            <div>
              <Label for="variant-a-subject">Subject Line</Label>
              <Input
                id="variant-a-subject"
                placeholder="Subject for variant A..."
                bind:value={abTestForm.variantASubject}
              />
            </div>
            <div>
              <Label for="variant-a-content">Email Content</Label>
              <Textarea
                id="variant-a-content"
                placeholder="Content for variant A..."
                bind:value={abTestForm.variantAContent}
                rows={6}
              />
            </div>
          </div>

          <!-- Variant B -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Variant B (Test)</h3>
            <div>
              <Label for="variant-b-subject">Subject Line</Label>
              <Input
                id="variant-b-subject"
                placeholder="Subject for variant B..."
                bind:value={abTestForm.variantBSubject}
              />
            </div>
            <div>
              <Label for="variant-b-content">Email Content</Label>
              <Textarea
                id="variant-b-content"
                placeholder="Content for variant B..."
                bind:value={abTestForm.variantBContent}
                rows={6}
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label for="split-ratio">Traffic Split (%)</Label>
            <div class="flex items-center gap-4">
              <Input
                id="split-ratio"
                type="range"
                min="10"
                max="90"
                step="10"
                bind:value={abTestForm.splitRatio}
                class="flex-1"
              />
              <span class="text-sm font-medium w-16">
                {abTestForm.splitRatio}% / {100 - abTestForm.splitRatio}%
              </span>
            </div>
          </div>
          <div>
            <Label for="test-metric">Primary Metric</Label>
            <Select.Root bind:value={abTestForm.testMetric}>
              <Select.Trigger id="test-metric">
                {abTestForm.testMetric.replace('_', ' ')}
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="open_rate">Open Rate</Select.Item>
                <Select.Item value="click_rate">Click Rate</Select.Item>
                <Select.Item value="reply_rate">Reply Rate</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>
        </div>
      </div>

      <Dialog.Footer>
        <Button variant="outline" onclick={() => showABTestDialog = false}>
          Cancel
        </Button>
        <Button onclick={createABTest} disabled={!abTestForm.name || !abTestForm.stepId}>
          Create A/B Test
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>

  <!-- Enhanced Trigger Dialog -->
  <Dialog.Root bind:open={showTriggerDialog}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Create Automation Trigger</Dialog.Title>
        <Dialog.Description>
          Set up conditions that automatically start campaigns based on user behavior
        </Dialog.Description>
      </Dialog.Header>

      <div class="space-y-4">
        <div>
          <Label for="trigger-name">Trigger Name</Label>
          <Input
            id="trigger-name"
            placeholder="Enter trigger name..."
            bind:value={triggerForm.name}
          />
        </div>

        <div>
          <Label for="trigger-type">Trigger Type</Label>
          <Select.Root bind:value={triggerForm.type}>
            <Select.Trigger id="trigger-type">
              {triggerForm.type.replace('_', ' ')}
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="lead_score">Lead Score Change</Select.Item>
              <Select.Item value="website_activity">Website Activity</Select.Item>
              <Select.Item value="email_engagement">Email Engagement</Select.Item>
              <Select.Item value="meeting_noshow">Meeting No-show</Select.Item>
              <Select.Item value="form_submission">Form Submission</Select.Item>
              <Select.Item value="page_visit">Page Visit</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label for="trigger-condition">Condition</Label>
            <Select.Root bind:value={triggerForm.condition}>
              <Select.Trigger id="trigger-condition">
                {triggerForm.condition.replace('_', ' ')}
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="greater_than">Greater than</Select.Item>
                <Select.Item value="less_than">Less than</Select.Item>
                <Select.Item value="equals">Equals</Select.Item>
                <Select.Item value="contains">Contains</Select.Item>
                <Select.Item value="visited_page">Visited page</Select.Item>
                <Select.Item value="form_submitted">Form submitted</Select.Item>
                <Select.Item value="not_opened">Not opened</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>
          <div>
            <Label for="trigger-value">Value</Label>
            <Input
              id="trigger-value"
              placeholder="Enter value..."
              bind:value={triggerForm.value}
            />
          </div>
        </div>

        <div>
          <Label for="trigger-campaign">Target Campaign</Label>
          <Select.Root bind:value={triggerForm.campaignId}>
            <Select.Trigger id="trigger-campaign">
              {campaigns.find(c => c.id === triggerForm.campaignId)?.name || 'Select campaign'}
            </Select.Trigger>
            <Select.Content>
              {#each campaigns as campaign}
                <Select.Item value={campaign.id}>{campaign.name}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>
      </div>

      <Dialog.Footer>
        <Button variant="outline" onclick={() => showTriggerDialog = false}>
          Cancel
        </Button>
        <Button onclick={createTrigger} disabled={!triggerForm.name || !triggerForm.campaignId}>
          Create Trigger
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
</div>

{#snippet SortableStep({ step, index, isLast })}
  {@const { transform, transition, node, isDragging, attributes, listeners } = useSortable({
    id: () => step.id,
  })}

  <div
    bind:this={node.current}
    class="flex items-start gap-4 p-4 border rounded-lg bg-card"
    style="transition: {transition.current}; transform: {CSS.Transform.toString(transform.current)}"
    class:opacity-50={isDragging.current}
  >
    <!-- Drag Handle -->
    <div class="flex flex-col items-center">
      <button
        {...attributes.current}
        {...listeners.current}
        class="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing"
      >
        <GripVertical class="h-4 w-4 text-muted-foreground" />
      </button>
      <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-2">
        {#if step.type === 'email'}
          <Mail class="h-4 w-4 text-primary" />
        {:else if step.type === 'linkedin'}
          <MessageSquare class="h-4 w-4 text-primary" />
        {:else if step.type === 'sms'}
          <Phone class="h-4 w-4 text-primary" />
        {:else if step.type === 'wait'}
          <Clock class="h-4 w-4 text-primary" />
        {:else if step.type === 'condition'}
          <Filter class="h-4 w-4 text-primary" />
        {:else if step.type === 'ab_test'}
          <TestTube class="h-4 w-4 text-primary" />
        {/if}
      </div>
      {#if !isLast}
        <div class="w-0.5 h-8 bg-border mt-2"></div>
      {/if}
    </div>

    <div class="flex-1">
      {#if step.type === 'wait'}
        <div class="flex items-center gap-4">
          <span class="font-medium">Wait</span>
          <Input
            type="number"
            value={step.delay}
            onInput={(e) => updateStep(step.id, { delay: parseInt(e.target.value) })}
            class="w-20"
          />
          <Select.Root
            bind:value={step.delayUnit}
            onValueChange={(value) => updateStep(step.id, { delayUnit: value })}
          >
            <Select.Trigger class="w-32">
              {step.delayUnit}
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="minutes">Minutes</Select.Item>
              <Select.Item value="hours">Hours</Select.Item>
              <Select.Item value="days">Days</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
      {:else if step.type === 'condition'}
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="font-medium">Conditional Logic</span>
            <Badge variant="outline">If/Then</Badge>
          </div>
          <div>
            <Label>Condition</Label>
            <Select.Root
              bind:value={step.condition}
              onValueChange={(value) => updateStep(step.id, { condition: value })}
            >
              <Select.Trigger>
                {step.condition || 'Select condition'}
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="email_opened">Email opened</Select.Item>
                <Select.Item value="email_clicked">Email clicked</Select.Item>
                <Select.Item value="email_replied">Email replied</Select.Item>
                <Select.Item value="link_clicked">Link clicked</Select.Item>
                <Select.Item value="form_submitted">Form submitted</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>
        </div>
      {:else if step.type === 'ab_test'}
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="font-medium">A/B Test</span>
            <div class="flex items-center gap-2">
              <Badge variant="outline">
                <Split class="h-3 w-3 mr-1" />
                {step.abTestConfig?.splitRatio || 50}% split
              </Badge>
              <Badge variant="secondary">
                {step.abTestConfig?.testMetric?.replace('_', ' ') || 'open rate'}
              </Badge>
            </div>
          </div>
          
          {#if step.abTestConfig}
            <div class="grid grid-cols-2 gap-4">
              <div class="p-3 border rounded-lg">
                <p class="text-sm font-medium mb-2">Variant A</p>
                <p class="text-sm text-muted-foreground">{step.abTestConfig.variantA.subject}</p>
              </div>
              <div class="p-3 border rounded-lg">
                <p class="text-sm font-medium mb-2">Variant B</p>
                <p class="text-sm text-muted-foreground">{step.abTestConfig.variantB.subject}</p>
              </div>
            </div>
          {/if}
        </div>
      {:else}
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="font-medium capitalize">{step.type} Message</span>
            <div class="flex items-center gap-2">
              {#if step.delay > 0}
                <Badge variant="outline">
                  +{step.delay} {step.delayUnit}
                </Badge>
              {/if}
            </div>
          </div>

          {#if step.type === 'email'}
            <div class="space-y-2">
              <Input
                placeholder="Email subject..."
                value={step.subject || ''}
                onInput={(e) => updateStep(step.id, { subject: e.target.value })}
              />
              <Textarea
                placeholder="Email content..."
                value={step.content || ''}
                onInput={(e) => updateStep(step.id, { content: e.target.value })}
                rows={4}
              />
            </div>
          {:else}
            <Textarea
              placeholder={`${step.type} message...`}
              value={step.content || ''}
              onInput={(e) => updateStep(step.id, { content: e.target.value })}
              rows={3}
            />
          {/if}
        </div>
      {/if}
    </div>

    <Button
      variant="ghost"
      size="icon"
      onclick={() => removeStep(step.id)}
    >
      <Trash2 class="h-4 w-4" />
    </Button>
  </div>
{/snippet}