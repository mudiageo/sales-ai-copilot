<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import * as Select from '$lib/components/ui/select';
  import * as Card from '$lib/components/ui/card';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as Tabs from '$lib/components/ui/tabs';
  import { Badge } from '$lib/components/ui/badge';
  import { Progress } from '$lib/components/ui/progress';
  import { Label } from '$lib/components/ui/label';
  import { Textarea } from '$lib/components/ui/textarea';
  import * as Switch from '$lib/components/ui/switch';
  import * as AlertDialog from '$lib/components/ui/alert-dialog';
  import { toast } from 'svelte-sonner';
  
  import Plus from "@lucide/svelte/icons/plus";
  import Settings from "@lucide/svelte/icons/settings";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import RefreshCw from "@lucide/svelte/icons/refresh-cw";
  import CheckCircle from "@lucide/svelte/icons/check-circle";
  import AlertCircle from "@lucide/svelte/icons/alert-circle";
  import XCircle from "@lucide/svelte/icons/x-circle";
  import Eye from "@lucide/svelte/icons/eye";
  import EyeOff from "@lucide/svelte/icons/eye-off";
  import Copy from "@lucide/svelte/icons/copy";
  import ExternalLink from "@lucide/svelte/icons/external-link";
  import Zap from "@lucide/svelte/icons/zap";
  import Database from "@lucide/svelte/icons/database";
  import Mail from "@lucide/svelte/icons/mail";
  import MessageSquare from "@lucide/svelte/icons/message-square";
  import Users from "@lucide/svelte/icons/users";
  import Globe from "@lucide/svelte/icons/globe";
  import Key from "@lucide/svelte/icons/key";
  import Activity from "@lucide/svelte/icons/activity";
  import Code from "@lucide/svelte/icons/code";

  // State
  let activeTab = $state('crm');
  let showAddIntegrationDialog = $state(false);
  let showApiKeyDialog = $state(false);
  let showWebhookDialog = $state(false);
  let showDataMappingDialog = $state(false);
  let selectedIntegration = $state<any>(null);
  let selectedApiKey = $state<any>(null);
  let isRefreshing = $state(false);

  // Form states
  let newIntegrationType = $state('');
  let newApiKeyName = $state('');
  let newApiKeyValue = $state('');
  let newApiKeyDescription = $state('');
  let showApiKeyValue = $state(false);
  let webhookUrl = $state('');
  let webhookEvents = $state<string[]>([]);
  let webhookSecret = $state('');

  // Integration data
  const crmIntegrations = [
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Sync leads, contacts, and opportunities',
      logo: 'https://www.svgrepo.com/show/303161/salesforce-2-logo.svg',
      status: 'connected',
      lastSync: '2 minutes ago',
      syncEnabled: true,
      features: ['Leads', 'Contacts', 'Opportunities', 'Activities'],
      config: {
        instanceUrl: 'https://company.salesforce.com',
        apiVersion: 'v58.0',
        syncFrequency: '15min'
      }
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Comprehensive CRM and marketing automation',
      logo: 'https://www.svgrepo.com/show/303265/hubspot-logo.svg',
      status: 'connected',
      lastSync: '5 minutes ago',
      syncEnabled: true,
      features: ['Contacts', 'Companies', 'Deals', 'Tasks'],
      config: {
        portalId: '12345678',
        apiVersion: 'v3',
        syncFrequency: '30min'
      }
    },
    {
      id: 'pipedrive',
      name: 'Pipedrive',
      description: 'Sales pipeline management',
      logo: 'https://www.svgrepo.com/show/354225/pipedrive.svg',
      status: 'error',
      lastSync: '2 hours ago',
      syncEnabled: false,
      features: ['Deals', 'Persons', 'Organizations', 'Activities'],
      config: {
        companyDomain: 'company.pipedrive.com',
        apiVersion: 'v1',
        syncFrequency: '1hour'
      }
    },
    {
      id: 'zoho',
      name: 'Zoho CRM',
      description: 'Complete customer relationship management',
      logo: 'https://www.svgrepo.com/show/354665/zoho.svg',
      status: 'disconnected',
      lastSync: 'Never',
      syncEnabled: false,
      features: ['Leads', 'Contacts', 'Deals', 'Accounts'],
      config: null
    }
  ];

  const communicationIntegrations = [
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Email integration and tracking',
      logo: 'https://www.svgrepo.com/show/303108/google-gmail-logo.svg',
      status: 'connected',
      lastSync: '1 minute ago',
      syncEnabled: true,
      features: ['Email Tracking', 'Templates', 'Sequences', 'Analytics']
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook',
      description: 'Email and calendar integration',
      logo: 'https://www.svgrepo.com/show/303164/microsoft-outlook-2019-logo.svg',
      status: 'connected',
      lastSync: '3 minutes ago',
      syncEnabled: true,
      features: ['Email Sync', 'Calendar', 'Contacts', 'Tasks']
    },
    {
      id: 'zoom',
      name: 'Zoom',
      description: 'Video conferencing and meeting scheduling',
      logo: 'https://www.svgrepo.com/show/303115/zoom-logo.svg',
      status: 'connected',
      lastSync: '10 minutes ago',
      syncEnabled: true,
      features: ['Meeting Scheduling', 'Recording', 'Analytics', 'Webhooks']
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Team collaboration and meetings',
      logo: 'https://www.svgrepo.com/show/303163/microsoft-teams-logo.svg',
      status: 'disconnected',
      lastSync: 'Never',
      syncEnabled: false,
      features: ['Meetings', 'Chat', 'File Sharing', 'Notifications']
    }
  ];

  const socialIntegrations = [
    {
      id: 'linkedin',
      name: 'LinkedIn Sales Navigator',
      description: 'Advanced prospecting and lead research',
      logo: 'https://www.svgrepo.com/show/303207/linkedin-logo.svg',
      status: 'connected',
      lastSync: '15 minutes ago',
      syncEnabled: true,
      features: ['Lead Search', 'InMail', 'Company Research', 'Sales Insights']
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      description: 'Social selling and prospect research',
      logo: 'https://www.svgrepo.com/show/303115/twitter-logo.svg',
      status: 'connected',
      lastSync: '30 minutes ago',
      syncEnabled: true,
      features: ['Profile Research', 'Social Listening', 'Engagement Tracking']
    }
  ];

  const apiKeys = [
    {
      id: 'openai-key',
      name: 'OpenAI API',
      description: 'AI content generation and analysis',
      value: 'sk-proj-***************************',
      created: '2024-01-15',
      lastUsed: '2 hours ago',
      status: 'active'
    },
    {
      id: 'elevenlabs-key',
      name: 'ElevenLabs API',
      description: 'Voice synthesis for coaching',
      value: 'el_***************************',
      created: '2024-01-10',
      lastUsed: '1 day ago',
      status: 'active'
    },
    {
      id: 'sendgrid-key',
      name: 'SendGrid API',
      description: 'Email delivery service',
      value: 'SG.***************************',
      created: '2024-01-05',
      lastUsed: '5 minutes ago',
      status: 'active'
    }
  ];

  const webhooks = [
    {
      id: 'lead-created',
      name: 'Lead Created',
      url: 'https://api.company.com/webhooks/lead-created',
      events: ['lead.created', 'lead.updated'],
      status: 'active',
      lastTriggered: '5 minutes ago',
      successRate: 98.5
    },
    {
      id: 'deal-closed',
      name: 'Deal Closed',
      url: 'https://api.company.com/webhooks/deal-closed',
      events: ['deal.won', 'deal.lost'],
      status: 'active',
      lastTriggered: '2 hours ago',
      successRate: 100
    },
    {
      id: 'email-opened',
      name: 'Email Engagement',
      url: 'https://api.company.com/webhooks/email-engagement',
      events: ['email.opened', 'email.clicked'],
      status: 'error',
      lastTriggered: '1 day ago',
      successRate: 85.2
    }
  ];

  const availableEvents = [
    'lead.created',
    'lead.updated',
    'lead.deleted',
    'deal.created',
    'deal.updated',
    'deal.won',
    'deal.lost',
    'email.sent',
    'email.opened',
    'email.clicked',
    'meeting.scheduled',
    'meeting.completed',
    'activity.created'
  ];

  // Functions
  function getStatusIcon(status: string) {
    switch (status) {
      case 'connected':
      case 'active':
        return CheckCircle;
      case 'error':
        return AlertCircle;
      case 'disconnected':
      case 'inactive':
        return XCircle;
      default:
        return AlertCircle;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'connected':
      case 'active':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'disconnected':
      case 'inactive':
        return 'text-gray-600';
      default:
        return 'text-yellow-600';
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'connected':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'disconnected':
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  }

  async function connectIntegration(integration: any) {
    // Simulate OAuth flow
    toast.success(`Connecting to ${integration.name}...`);
    
    // In a real app, this would redirect to OAuth provider
    setTimeout(() => {
      integration.status = 'connected';
      integration.lastSync = 'Just now';
      integration.syncEnabled = true;
      toast.success(`Successfully connected to ${integration.name}`);
    }, 2000);
  }

  async function disconnectIntegration(integration: any) {
    integration.status = 'disconnected';
    integration.lastSync = 'Never';
    integration.syncEnabled = false;
    toast.success(`Disconnected from ${integration.name}`);
  }

  async function testConnection(integration: any) {
    toast.success(`Testing connection to ${integration.name}...`);
    
    setTimeout(() => {
      if (integration.status === 'connected') {
        toast.success(`Connection to ${integration.name} is working properly`);
      } else {
        toast.error(`Connection to ${integration.name} failed`);
      }
    }, 1500);
  }

  async function syncNow(integration: any) {
    isRefreshing = true;
    toast.success(`Starting sync with ${integration.name}...`);
    
    setTimeout(() => {
      integration.lastSync = 'Just now';
      isRefreshing = false;
      toast.success(`Sync with ${integration.name} completed`);
    }, 3000);
  }

  function configureIntegration(integration: any) {
    selectedIntegration = integration;
    showDataMappingDialog = true;
  }

  function addApiKey() {
    if (!newApiKeyName || !newApiKeyValue) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newKey = {
      id: `key-${Date.now()}`,
      name: newApiKeyName,
      description: newApiKeyDescription,
      value: newApiKeyValue,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      status: 'active'
    };

    apiKeys.push(newKey);
    
    // Reset form
    newApiKeyName = '';
    newApiKeyValue = '';
    newApiKeyDescription = '';
    showApiKeyDialog = false;
    
    toast.success('API key added successfully');
  }

  function deleteApiKey(keyId: string) {
    const index = apiKeys.findIndex(key => key.id === keyId);
    if (index > -1) {
      apiKeys.splice(index, 1);
      toast.success('API key deleted');
    }
  }

  function copyApiKey(value: string) {
    navigator.clipboard.writeText(value);
    toast.success('API key copied to clipboard');
  }

  function addWebhook() {
    if (!webhookUrl || webhookEvents.length === 0) {
      toast.error('Please provide URL and select at least one event');
      return;
    }

    const newWebhook = {
      id: `webhook-${Date.now()}`,
      name: `Webhook ${webhooks.length + 1}`,
      url: webhookUrl,
      events: [...webhookEvents],
      status: 'active',
      lastTriggered: 'Never',
      successRate: 100
    };

    webhooks.push(newWebhook);
    
    // Reset form
    webhookUrl = '';
    webhookEvents = [];
    webhookSecret = '';
    showWebhookDialog = false;
    
    toast.success('Webhook created successfully');
  }

  function deleteWebhook(webhookId: string) {
    const index = webhooks.findIndex(webhook => webhook.id === webhookId);
    if (index > -1) {
      webhooks.splice(index, 1);
      toast.success('Webhook deleted');
    }
  }

  function testWebhook(webhook: any) {
    toast.success(`Testing webhook: ${webhook.name}...`);
    
    setTimeout(() => {
      toast.success(`Webhook test successful: ${webhook.name}`);
    }, 1500);
  }

  function refreshAllIntegrations() {
    isRefreshing = true;
    toast.success('Refreshing all integrations...');
    
    setTimeout(() => {
      isRefreshing = false;
      toast.success('All integrations refreshed');
    }, 3000);
  }

  function toggleEventSelection(event: string) {
    if (webhookEvents.includes(event)) {
      webhookEvents = webhookEvents.filter(e => e !== event);
    } else {
      webhookEvents = [...webhookEvents, event];
    }
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold">Integration Management</h1>
      <p class="text-muted-foreground">Connect and manage your sales tools and platforms</p>
    </div>
    <div class="flex items-center gap-4">
      <Button variant="outline" onclick={refreshAllIntegrations} disabled={isRefreshing}>
        <RefreshCw class={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh All
      </Button>
      <Button onclick={() => showAddIntegrationDialog = true}>
        <Plus class="h-4 w-4 mr-2" />
        Add Integration
      </Button>
    </div>
  </div>

  <!-- Integration Health Overview -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <Card.Root class="p-6">
      <div class="flex items-center gap-4">
        <div class="p-3 rounded-lg bg-green-100">
          <CheckCircle class="h-6 w-6 text-green-600" />
        </div>
        <div>
          <p class="text-sm font-medium text-muted-foreground">Connected</p>
          <p class="text-2xl font-bold">8</p>
        </div>
      </div>
    </Card.Root>

    <Card.Root class="p-6">
      <div class="flex items-center gap-4">
        <div class="p-3 rounded-lg bg-red-100">
          <AlertCircle class="h-6 w-6 text-red-600" />
        </div>
        <div>
          <p class="text-sm font-medium text-muted-foreground">Issues</p>
          <p class="text-2xl font-bold">2</p>
        </div>
      </div>
    </Card.Root>

    <Card.Root class="p-6">
      <div class="flex items-center gap-4">
        <div class="p-3 rounded-lg bg-blue-100">
          <Activity class="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <p class="text-sm font-medium text-muted-foreground">API Calls Today</p>
          <p class="text-2xl font-bold">12.5K</p>
        </div>
      </div>
    </Card.Root>

    <Card.Root class="p-6">
      <div class="flex items-center gap-4">
        <div class="p-3 rounded-lg bg-purple-100">
          <Zap class="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <p class="text-sm font-medium text-muted-foreground">Webhooks Active</p>
          <p class="text-2xl font-bold">{webhooks.filter(w => w.status === 'active').length}</p>
        </div>
      </div>
    </Card.Root>
  </div>

  <!-- Integration Tabs -->
  <Tabs.Root bind:value={activeTab} class="space-y-6">
    <Tabs.List class="grid w-full grid-cols-5">
      <Tabs.Trigger value="crm">
        <Database class="h-4 w-4 mr-2" />
        CRM
      </Tabs.Trigger>
      <Tabs.Trigger value="communication">
        <Mail class="h-4 w-4 mr-2" />
        Communication
      </Tabs.Trigger>
      <Tabs.Trigger value="social">
        <Users class="h-4 w-4 mr-2" />
        Social
      </Tabs.Trigger>
      <Tabs.Trigger value="api">
        <Key class="h-4 w-4 mr-2" />
        API Keys
      </Tabs.Trigger>
      <Tabs.Trigger value="webhooks">
        <Code class="h-4 w-4 mr-2" />
        Webhooks
      </Tabs.Trigger>
    </Tabs.List>

    <!-- CRM Integrations -->
    <Tabs.Content value="crm" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each crmIntegrations as integration}
        {@const StatusIcon = getStatusIcon(integration.status)}
          <Card.Root class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <img src={integration.logo} alt={integration.name} class="w-10 h-10" />
                <div>
                  <h3 class="font-semibold">{integration.name}</h3>
                  <p class="text-sm text-muted-foreground">{integration.description}</p>
                </div>
              </div>
              <StatusIcon class={`h-5 w-5 ${getStatusColor(integration.status)}`} />
            </div>

            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Status</span>
                <Badge class={getStatusBadge(integration.status)}>
                  {integration.status}
                </Badge>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Last Sync</span>
                <span class="text-sm">{integration.lastSync}</span>
              </div>

              {#if integration.status === 'connected'}
                <div class="flex items-center justify-between">
                  <span class="text-sm text-muted-foreground">Auto Sync</span>
                  <Switch.Root bind:checked={integration.syncEnabled}>
                    <Switch.Thumb />
                  </Switch.Root>
                </div>
              {/if}

              <div class="space-y-2">
                <span class="text-sm text-muted-foreground">Features</span>
                <div class="flex flex-wrap gap-1">
                  {#each integration.features as feature}
                    <Badge variant="outline" class="text-xs">{feature}</Badge>
                  {/each}
                </div>
              </div>
            </div>

            <div class="flex gap-2 mt-4">
              {#if integration.status === 'connected'}
                <Button variant="outline" size="sm" onclick={() => syncNow(integration)}>
                  <RefreshCw class="h-4 w-4 mr-1" />
                  Sync
                </Button>
                <Button variant="outline" size="sm" onclick={() => configureIntegration(integration)}>
                  <Settings class="h-4 w-4 mr-1" />
                  Configure
                </Button>
                <Button variant="outline" size="sm" onclick={() => disconnectIntegration(integration)}>
                  Disconnect
                </Button>
              {:else}
                <Button size="sm" onclick={() => connectIntegration(integration)}>
                  Connect
                </Button>
                {#if integration.status === 'error'}
                  <Button variant="outline" size="sm" onclick={() => testConnection(integration)}>
                    Test
                  </Button>
                {/if}
              {/if}
            </div>
          </Card.Root>
        {/each}
      </div>
    </Tabs.Content>

    <!-- Communication Integrations -->
    <Tabs.Content value="communication" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each communicationIntegrations as integration}
        {@const StatusIcon = getStatusIcon(integration.status)}
          <Card.Root class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <img src={integration.logo} alt={integration.name} class="w-10 h-10" />
                <div>
                  <h3 class="font-semibold">{integration.name}</h3>
                  <p class="text-sm text-muted-foreground">{integration.description}</p>
                </div>
              </div>
              <StatusIcon class={`h-5 w-5 ${getStatusColor(integration.status)}`} />
            </div>

            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Status</span>
                <Badge class={getStatusBadge(integration.status)}>
                  {integration.status}
                </Badge>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Last Sync</span>
                <span class="text-sm">{integration.lastSync}</span>
              </div>

              <div class="space-y-2">
                <span class="text-sm text-muted-foreground">Features</span>
                <div class="flex flex-wrap gap-1">
                  {#each integration.features as feature}
                    <Badge variant="outline" class="text-xs">{feature}</Badge>
                  {/each}
                </div>
              </div>
            </div>

            <div class="flex gap-2 mt-4">
              {#if integration.status === 'connected'}
                <Button variant="outline" size="sm" onclick={() => configureIntegration(integration)}>
                  <Settings class="h-4 w-4 mr-1" />
                  Configure
                </Button>
                <Button variant="outline" size="sm" onclick={() => disconnectIntegration(integration)}>
                  Disconnect
                </Button>
              {:else}
                <Button size="sm" onclick={() => connectIntegration(integration)}>
                  Connect
                </Button>
              {/if}
            </div>
          </Card.Root>
        {/each}
      </div>
    </Tabs.Content>

    <!-- Social Integrations -->
    <Tabs.Content value="social" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each socialIntegrations as integration}
        {@const StatusIcon = getStatusIcon(integration.status)}
          <Card.Root class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <img src={integration.logo} alt={integration.name} class="w-10 h-10" />
                <div>
                  <h3 class="font-semibold">{integration.name}</h3>
                  <p class="text-sm text-muted-foreground">{integration.description}</p>
                </div>
              </div>
              <StatusIcon class={`h-5 w-5 ${getStatusColor(integration.status)}`} />
            </div>

            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Status</span>
                <Badge class={getStatusBadge(integration.status)}>
                  {integration.status}
                </Badge>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Last Sync</span>
                <span class="text-sm">{integration.lastSync}</span>
              </div>

              <div class="space-y-2">
                <span class="text-sm text-muted-foreground">Features</span>
                <div class="flex flex-wrap gap-1">
                  {#each integration.features as feature}
                    <Badge variant="outline" class="text-xs">{feature}</Badge>
                  {/each}
                </div>
              </div>
            </div>

            <div class="flex gap-2 mt-4">
              {#if integration.status === 'connected'}
                <Button variant="outline" size="sm" onclick={() => configureIntegration(integration)}>
                  <Settings class="h-4 w-4 mr-1" />
                  Configure
                </Button>
                <Button variant="outline" size="sm" onclick={() => disconnectIntegration(integration)}>
                  Disconnect
                </Button>
              {:else}
                <Button size="sm" onclick={() => connectIntegration(integration)}>
                  Connect
                </Button>
              {/if}
            </div>
          </Card.Root>
        {/each}
      </div>
    </Tabs.Content>

    <!-- API Keys -->
    <Tabs.Content value="api" class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-lg font-semibold">API Key Management</h2>
          <p class="text-sm text-muted-foreground">Manage your API keys for external services</p>
        </div>
        <Button onclick={() => showApiKeyDialog = true}>
          <Plus class="h-4 w-4 mr-2" />
          Add API Key
        </Button>
      </div>

      <div class="space-y-4">
        {#each apiKeys as apiKey}
          <Card.Root class="p-6">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="font-semibold">{apiKey.name}</h3>
                  <Badge class={getStatusBadge(apiKey.status)}>
                    {apiKey.status}
                  </Badge>
                </div>
                <p class="text-sm text-muted-foreground mb-3">{apiKey.description}</p>
                
                <div class="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span class="text-muted-foreground">Created:</span>
                    <p>{apiKey.created}</p>
                  </div>
                  <div>
                    <span class="text-muted-foreground">Last Used:</span>
                    <p>{apiKey.lastUsed}</p>
                  </div>
                  <div>
                    <span class="text-muted-foreground">API Key:</span>
                    <div class="flex items-center gap-2">
                      <code class="text-xs bg-muted px-2 py-1 rounded">{apiKey.value}</code>
                      <Button variant="ghost" size="icon" onclick={() => copyApiKey(apiKey.value)}>
                        <Copy class="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <Button variant="outline" size="sm" onclick={() => { selectedApiKey = apiKey; showApiKeyDialog = true; }}>
                  <Settings class="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onclick={() => deleteApiKey(apiKey.id)}>
                  <Trash2 class="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </Card.Root>
        {/each}
      </div>
    </Tabs.Content>

    <!-- Webhooks -->
    <Tabs.Content value="webhooks" class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-lg font-semibold">Webhook Management</h2>
          <p class="text-sm text-muted-foreground">Configure webhooks for real-time event notifications</p>
        </div>
        <Button onclick={() => showWebhookDialog = true}>
          <Plus class="h-4 w-4 mr-2" />
          Create Webhook
        </Button>
      </div>

      <div class="space-y-4">
        {#each webhooks as webhook}
          <Card.Root class="p-6">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="font-semibold">{webhook.name}</h3>
                  <Badge class={getStatusBadge(webhook.status)}>
                    {webhook.status}
                  </Badge>
                </div>
                
                <div class="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span class="text-muted-foreground">URL:</span>
                    <p class="font-mono text-xs">{webhook.url}</p>
                  </div>
                  <div>
                    <span class="text-muted-foreground">Success Rate:</span>
                    <div class="flex items-center gap-2">
                      <Progress value={webhook.successRate} class="h-2 w-20" />
                      <span>{webhook.successRate}%</span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-4 text-sm">
                  <div>
                    <span class="text-muted-foreground">Events:</span>
                    <div class="flex flex-wrap gap-1 mt-1">
                      {#each webhook.events as event}
                        <Badge variant="outline" class="text-xs">{event}</Badge>
                      {/each}
                    </div>
                  </div>
                  <div>
                    <span class="text-muted-foreground">Last Triggered:</span>
                    <p>{webhook.lastTriggered}</p>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <Button variant="outline" size="sm" onclick={() => testWebhook(webhook)}>
                  <Zap class="h-4 w-4 mr-1" />
                  Test
                </Button>
                <Button variant="outline" size="sm">
                  <Settings class="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onclick={() => deleteWebhook(webhook.id)}>
                  <Trash2 class="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </Card.Root>
        {/each}
      </div>
    </Tabs.Content>
  </Tabs.Root>

  <!-- Add Integration Dialog -->
  <Dialog.Root bind:open={showAddIntegrationDialog}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Add New Integration</Dialog.Title>
        <Dialog.Description>
          Connect a new service to your sales workflow
        </Dialog.Description>
      </Dialog.Header>

      <div class="space-y-4">
        <div>
          <Label for="integration-type">Integration Type</Label>
          <Select.Root bind:value={newIntegrationType}>
            <Select.Trigger id="integration-type">
              {newIntegrationType || "Select integration type"}
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="crm">CRM System</Select.Item>
              <Select.Item value="email">Email Provider</Select.Item>
              <Select.Item value="calendar">Calendar Service</Select.Item>
              <Select.Item value="social">Social Platform</Select.Item>
              <Select.Item value="analytics">Analytics Tool</Select.Item>
              <Select.Item value="custom">Custom Integration</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>

        <div class="text-sm text-muted-foreground">
          Popular integrations can be found in their respective tabs. Use this form for custom or unlisted integrations.
        </div>
      </div>

      <Dialog.Footer>
        <Button variant="outline" onclick={() => showAddIntegrationDialog = false}>
          Cancel
        </Button>
        <Button disabled={!newIntegrationType}>
          Continue Setup
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>

  <!-- API Key Dialog -->
  <Dialog.Root bind:open={showApiKeyDialog}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>{selectedApiKey ? 'Edit API Key' : 'Add API Key'}</Dialog.Title>
        <Dialog.Description>
          {selectedApiKey ? 'Update your API key details' : 'Add a new API key for external service integration'}
        </Dialog.Description>
      </Dialog.Header>

      <div class="space-y-4">
        <div>
          <Label for="api-key-name">Name *</Label>
          <Input
            id="api-key-name"
            placeholder="e.g., OpenAI API Key"
            bind:value={newApiKeyName}
          />
        </div>

        <div>
          <Label for="api-key-description">Description</Label>
          <Input
            id="api-key-description"
            placeholder="Brief description of what this key is used for"
            bind:value={newApiKeyDescription}
          />
        </div>

        <div>
          <Label for="api-key-value">API Key *</Label>
          <div class="flex gap-2">
            <Input
              id="api-key-value"
              type={showApiKeyValue ? 'text' : 'password'}
              placeholder="Enter your API key"
              bind:value={newApiKeyValue}
            />
            <Button
              variant="outline"
              size="icon"
              onclick={() => showApiKeyValue = !showApiKeyValue}
            >
              {#if showApiKeyValue}
                <EyeOff class="h-4 w-4" />
              {:else}
                <Eye class="h-4 w-4" />
              {/if}
            </Button>
          </div>
        </div>
      </div>

      <Dialog.Footer>
        <Button variant="outline" onclick={() => { showApiKeyDialog = false; selectedApiKey = null; }}>
          Cancel
        </Button>
        <Button onclick={addApiKey}>
          {selectedApiKey ? 'Update' : 'Add'} API Key
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>

  <!-- Webhook Dialog -->
  <Dialog.Root bind:open={showWebhookDialog}>
    <Dialog.Content class="max-w-2xl">
      <Dialog.Header>
        <Dialog.Title>Create Webhook</Dialog.Title>
        <Dialog.Description>
          Set up a webhook to receive real-time event notifications
        </Dialog.Description>
      </Dialog.Header>

      <div class="space-y-4">
        <div>
          <Label for="webhook-url">Webhook URL *</Label>
          <Input
            id="webhook-url"
            placeholder="https://your-app.com/webhooks/endpoint"
            bind:value={webhookUrl}
          />
        </div>

        <div>
          <Label>Events to Subscribe *</Label>
          <div class="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
            {#each availableEvents as event}
              <label class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={webhookEvents.includes(event)}
                  onchange={() => toggleEventSelection(event)}
                />
                <span class="text-sm">{event}</span>
              </label>
            {/each}
          </div>
        </div>

        <div>
          <Label for="webhook-secret">Secret (Optional)</Label>
          <Input
            id="webhook-secret"
            type="password"
            placeholder="Webhook signing secret"
            bind:value={webhookSecret}
          />
          <p class="text-xs text-muted-foreground mt-1">
            Used to verify webhook authenticity
          </p>
        </div>
      </div>

      <Dialog.Footer>
        <Button variant="outline" onclick={() => showWebhookDialog = false}>
          Cancel
        </Button>
        <Button onclick={addWebhook}>
          Create Webhook
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>

  <!-- Data Mapping Dialog -->
  <Dialog.Root bind:open={showDataMappingDialog}>
    <Dialog.Content class="max-w-4xl">
      <Dialog.Header>
        <Dialog.Title>Data Mapping - {selectedIntegration?.name}</Dialog.Title>
        <Dialog.Description>
          Configure how data is synchronized between systems
        </Dialog.Description>
      </Dialog.Header>

      <div class="space-y-6">
        <!-- Sync Settings -->
        <div>
          <h3 class="font-semibold mb-3">Synchronization Settings</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label>Sync Frequency</Label>
              <Select.Root>
                <Select.Trigger>
                  {selectedIntegration?.config?.syncFrequency || 'Select frequency'}
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="5min">Every 5 minutes</Select.Item>
                  <Select.Item value="15min">Every 15 minutes</Select.Item>
                  <Select.Item value="30min">Every 30 minutes</Select.Item>
                  <Select.Item value="1hour">Every hour</Select.Item>
                  <Select.Item value="daily">Daily</Select.Item>
                </Select.Content>
              </Select.Root>
            </div>
            <div>
              <Label>Sync Direction</Label>
              <Select.Root>
                <Select.Trigger>
                  Bidirectional
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="bidirectional">Bidirectional</Select.Item>
                  <Select.Item value="to-crm">To CRM Only</Select.Item>
                  <Select.Item value="from-crm">From CRM Only</Select.Item>
                </Select.Content>
              </Select.Root>
            </div>
          </div>
        </div>

        <!-- Field Mapping -->
        <div>
          <h3 class="font-semibold mb-3">Field Mapping</h3>
          <div class="space-y-3">
            <div class="grid grid-cols-3 gap-4 text-sm font-medium">
              <span>AI Sales Copilot Field</span>
              <span>Direction</span>
              <span>{selectedIntegration?.name} Field</span>
            </div>
            
            {#each ['Email', 'First Name', 'Last Name', 'Company', 'Phone', 'Lead Score'] as field}
              <div class="grid grid-cols-3 gap-4 items-center">
                <Input value={field} readonly />
                <Select.Root>
                  <Select.Trigger>
                    <span class="text-xs">↔</span>
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="bidirectional">↔ Bidirectional</Select.Item>
                    <Select.Item value="to-external">→ To {selectedIntegration?.name}</Select.Item>
                    <Select.Item value="from-external">← From {selectedIntegration?.name}</Select.Item>
                    <Select.Item value="none">✕ No Sync</Select.Item>
                  </Select.Content>
                </Select.Root>
                <Input placeholder={`${selectedIntegration?.name} field name`} />
              </div>
            {/each}
          </div>
        </div>

        <!-- Conflict Resolution -->
        <div>
          <h3 class="font-semibold mb-3">Conflict Resolution</h3>
          <div class="space-y-3">
            <div>
              <Label>When data conflicts occur:</Label>
              <Select.Root>
                <Select.Trigger>
                  AI Sales Copilot wins
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="local-wins">AI Sales Copilot wins</Select.Item>
                  <Select.Item value="external-wins">{selectedIntegration?.name} wins</Select.Item>
                  <Select.Item value="newest-wins">Newest data wins</Select.Item>
                  <Select.Item value="manual-review">Manual review required</Select.Item>
                </Select.Content>
              </Select.Root>
            </div>
          </div>
        </div>
      </div>

      <Dialog.Footer>
        <Button variant="outline" onclick={() => showDataMappingDialog = false}>
          Cancel
        </Button>
        <Button onclick={() => { showDataMappingDialog = false; toast.success('Data mapping saved'); }}>
          Save Configuration
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
</div>