<script lang="ts">
  import type { PageData } from "./$types.js";
  import * as Form from "$lib/components/ui/form";
  import * as Tabs from "$lib/components/ui/tabs";
  import * as Card from "$lib/components/ui/card";
  import * as Select from "$lib/components/ui/select";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Button } from "$lib/components/ui/button";
  import { Label } from "$lib/components/ui/label";
  import { Badge } from "$lib/components/ui/badge";
  import { Switch } from "$lib/components/ui/switch";
  import { Separator } from "$lib/components/ui/separator";
  import { Progress } from "$lib/components/ui/progress";
  import { Avatar } from "$lib/components/ui/avatar";
  import { 
    profileSchema, 
    notificationSchema, 
    teamSchema, 
    aiConfigSchema, 
    securitySchema,
    type ProfileSchema,
    type NotificationSchema,
    type TeamSchema,
    type AiConfigSchema,
    type SecuritySchema
  } from "./schemas";
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { toast } from "svelte-sonner";

  // Icons
  import User from "@lucide/svelte/icons/user";
  import Bell from "@lucide/svelte/icons/bell";
  import Users from "@lucide/svelte/icons/users";
  import Brain from "@lucide/svelte/icons/brain";
  import Shield from "@lucide/svelte/icons/shield";
  import CreditCard from "@lucide/svelte/icons/credit-card";
  import Upload from "@lucide/svelte/icons/upload";
  import Camera from "@lucide/svelte/icons/camera";
  import Plus from "@lucide/svelte/icons/plus";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import Edit from "@lucide/svelte/icons/edit";
  import Key from "@lucide/svelte/icons/key";
  import Smartphone from "@lucide/svelte/icons/smartphone";
  import Download from "@lucide/svelte/icons/download";
  import Eye from "@lucide/svelte/icons/eye";
  import EyeOff from "@lucide/svelte/icons/eye-off";
  import CheckCircle from "@lucide/svelte/icons/check-circle";
  import AlertTriangle from "@lucide/svelte/icons/alert-triangle";
  import Copy from "@lucide/svelte/icons/copy";

  let { data }: { data: PageData } = $props();

  // Form instances
  const profileForm = superForm(data.profileForm, {
    validators: zodClient(profileSchema),
    onUpdated: ({ form }) => {
      if (form.valid) {
        toast.success('Profile updated successfully');
      }
    }
  });

  const notificationForm = superForm(data.notificationForm, {
    validators: zodClient(notificationSchema),
    onUpdated: ({ form }) => {
      if (form.valid) {
        toast.success('Notification preferences updated');
      }
    }
  });

  const teamForm = superForm(data.teamForm, {
    validators: zodClient(teamSchema),
    onUpdated: ({ form }) => {
      if (form.valid) {
        toast.success('Team member invited successfully');
      }
    }
  });

  const aiConfigForm = superForm(data.aiConfigForm, {
    validators: zodClient(aiConfigSchema),
    onUpdated: ({ form }) => {
      if (form.valid) {
        toast.success('AI configuration updated');
      }
    }
  });

  const securityForm = superForm(data.securityForm, {
    validators: zodClient(securitySchema),
    onUpdated: ({ form }) => {
      if (form.valid) {
        toast.success('Security settings updated');
      }
    }
  });

  // Extract form data and enhance functions
  const { form: profileData, enhance: profileEnhance } = profileForm;
  const { form: notificationData, enhance: notificationEnhance } = notificationForm;
  const { form: teamData, enhance: teamEnhance } = teamForm;
  const { form: aiConfigData, enhance: aiConfigEnhance } = aiConfigForm;
  const { form: securityData, enhance: securityEnhance } = securityForm;

  // State
  let showProfilePictureDialog = $state(false);
  let showInviteDialog = $state(false);
  let showDeleteAccountDialog = $state(false);
  let showApiTokenDialog = $state(false);
  let showPasswordDialog = $state(false);
  let show2FADialog = $state(false);
  let showNewPasswordField = $state(false);
  let showConfirmPasswordField = $state(false);

  // Mock data
  const teamMembers = [
    {
      id: '1',
      name: 'Sarah Chen',
      email: 'sarah@company.com',
      role: 'admin',
      status: 'active',
      lastActive: '2 hours ago',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      email: 'michael@company.com',
      role: 'manager',
      status: 'active',
      lastActive: '1 day ago',
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg'
    },
    {
      id: '3',
      name: 'Emily Taylor',
      email: 'emily@company.com',
      role: 'sales_rep',
      status: 'inactive',
      lastActive: '3 days ago',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'
    }
  ];

  const apiTokens = [
    {
      id: '1',
      name: 'Production API',
      token: 'sk_live_...',
      lastUsed: '2 hours ago',
      permissions: ['read', 'write']
    },
    {
      id: '2',
      name: 'Development API',
      token: 'sk_test_...',
      lastUsed: '1 week ago',
      permissions: ['read']
    }
  ];

  const activityLogs = [
    {
      id: '1',
      action: 'Profile updated',
      timestamp: '2024-01-15 14:30:00',
      ip: '192.168.1.1',
      device: 'Chrome on macOS'
    },
    {
      id: '2',
      action: 'Password changed',
      timestamp: '2024-01-14 09:15:00',
      ip: '192.168.1.1',
      device: 'Chrome on macOS'
    },
    {
      id: '3',
      action: 'API token created',
      timestamp: '2024-01-13 16:45:00',
      ip: '192.168.1.1',
      device: 'Chrome on macOS'
    }
  ];

  const subscriptionData = {
    plan: 'Professional',
    status: 'active',
    nextBilling: '2024-02-15',
    amount: 99,
    seats: 10,
    usedSeats: 7
  };

  // Options
  const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time' },
    { value: 'America/Chicago', label: 'Central Time' },
    { value: 'America/Denver', label: 'Mountain Time' },
    { value: 'America/Los_Angeles', label: 'Pacific Time' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Paris', label: 'Paris' },
    { value: 'Asia/Tokyo', label: 'Tokyo' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'zh', label: 'Chinese' }
  ];

  const roles = [
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Manager' },
    { value: 'sales_rep', label: 'Sales Representative' },
    { value: 'viewer', label: 'Viewer' }
  ];

  // Functions
  function handleProfilePictureUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      // Handle file upload logic
      toast.success('Profile picture uploaded successfully');
      showProfilePictureDialog = false;
    }
  }

  function copyApiToken(token: string) {
    navigator.clipboard.writeText(token);
    toast.success('API token copied to clipboard');
  }

  function generateApiToken() {
    const newToken = 'sk_live_' + Math.random().toString(36).substring(2, 15);
    toast.success('New API token generated');
    showApiTokenDialog = false;
  }

  function enable2FA() {
    toast.success('Two-factor authentication enabled');
    show2FADialog = false;
  }

  function removeMember(memberId: string) {
    toast.success('Team member removed');
  }

  function exportActivityLogs() {
    const csvContent = activityLogs.map(log => 
      `${log.timestamp},${log.action},${log.ip},${log.device}`
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'activity-logs.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Activity logs exported');
  }

  function getRoleColor(role: string) {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'sales_rep': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <h1 class="text-2xl font-bold">Settings</h1>
    <p class="text-muted-foreground">Manage your account settings and preferences</p>
  </div>

  <!-- Settings Tabs -->
  <Tabs.Root value="profile" class="space-y-6">
    <Tabs.List class="grid w-full grid-cols-6">
      <Tabs.Trigger value="profile" class="flex items-center gap-2">
        <User class="h-4 w-4" />
        Profile
      </Tabs.Trigger>
      <Tabs.Trigger value="notifications" class="flex items-center gap-2">
        <Bell class="h-4 w-4" />
        Notifications
      </Tabs.Trigger>
      <Tabs.Trigger value="team" class="flex items-center gap-2">
        <Users class="h-4 w-4" />
        Team
      </Tabs.Trigger>
      <Tabs.Trigger value="ai" class="flex items-center gap-2">
        <Brain class="h-4 w-4" />
        AI Config
      </Tabs.Trigger>
      <Tabs.Trigger value="security" class="flex items-center gap-2">
        <Shield class="h-4 w-4" />
        Security
      </Tabs.Trigger>
      <Tabs.Trigger value="billing" class="flex items-center gap-2">
        <CreditCard class="h-4 w-4" />
        Billing
      </Tabs.Trigger>
    </Tabs.List>

    <!-- Profile Tab -->
    <Tabs.Content value="profile" class="space-y-6">
      <Card.Root>
        <Card.Header>
          <Card.Title>Personal Information</Card.Title>
          <Card.Description>Update your personal details and preferences</Card.Description>
        </Card.Header>
        <Card.Content class="space-y-6">
          <!-- Profile Picture -->
          <div class="flex items-center gap-6">
            <Avatar class="h-20 w-20">
              <img src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg" alt="Profile" />
            </Avatar>
            <div>
              <Button variant="outline" onclick={() => showProfilePictureDialog = true}>
                <Camera class="h-4 w-4 mr-2" />
                Change Picture
              </Button>
              <p class="text-sm text-muted-foreground mt-2">
                JPG, GIF or PNG. 1MB max.
              </p>
            </div>
          </div>

          <!-- Profile Form -->
          <form method="POST" action="?/updateProfile" use:profileEnhance class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <Form.Field form={profileForm} name="firstName">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label>First Name</Form.Label>
                    <Input {...props} bind:value={$profileData.firstName} />
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>

              <Form.Field form={profileForm} name="lastName">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label>Last Name</Form.Label>
                    <Input {...props} bind:value={$profileData.lastName} />
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>
            </div>

            <Form.Field form={profileForm} name="email">
              <Form.Control>
                {#snippet children({ props })}
                  <Form.Label>Email</Form.Label>
                  <Input {...props} type="email" bind:value={$profileData.email} />
                {/snippet}
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>

            <div class="grid grid-cols-2 gap-4">
              <Form.Field form={profileForm} name="phone">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label>Phone</Form.Label>
                    <Input {...props} bind:value={$profileData.phone} />
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>

              <Form.Field form={profileForm} name="title">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label>Job Title</Form.Label>
                    <Input {...props} bind:value={$profileData.title} />
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>
            </div>

            <Form.Field form={profileForm} name="department">
              <Form.Control>
                {#snippet children({ props })}
                  <Form.Label>Department</Form.Label>
                  <Input {...props} bind:value={$profileData.department} />
                {/snippet}
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>

            <div class="grid grid-cols-2 gap-4">
              <Form.Field form={profileForm} name="timezone">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label>Timezone</Form.Label>
                    <Select.Root bind:value={$profileData.timezone}>
                      <Select.Trigger {...props}>
                        {timezones.find(tz => tz.value === $profileData.timezone)?.label || "Select timezone"}
                      </Select.Trigger>
                      <Select.Content>
                        {#each timezones as timezone}
                          <Select.Item value={timezone.value}>{timezone.label}</Select.Item>
                        {/each}
                      </Select.Content>
                    </Select.Root>
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>

              <Form.Field form={profileForm} name="language">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label>Language</Form.Label>
                    <Select.Root bind:value={$profileData.language}>
                      <Select.Trigger {...props}>
                        {languages.find(lang => lang.value === $profileData.language)?.label || "Select language"}
                      </Select.Trigger>
                      <Select.Content>
                        {#each languages as language}
                          <Select.Item value={language.value}>{language.label}</Select.Item>
                        {/each}
                      </Select.Content>
                    </Select.Root>
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>
            </div>

            <Form.Field form={profileForm} name="bio">
              <Form.Control>
                {#snippet children({ props })}
                  <Form.Label>Bio</Form.Label>
                  <Textarea {...props} bind:value={$profileData.bio} rows={3} />
                {/snippet}
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>

            <Form.Button>Update Profile</Form.Button>
          </form>
        </Card.Content>
      </Card.Root>
    </Tabs.Content>

    <!-- Notifications Tab -->
    <Tabs.Content value="notifications" class="space-y-6">
      <Card.Root>
        <Card.Header>
          <Card.Title>Notification Preferences</Card.Title>
          <Card.Description>Choose how you want to be notified about updates</Card.Description>
        </Card.Header>
        <Card.Content>
          <form method="POST" action="?/updateNotifications" use:notificationEnhance class="space-y-6">
            <!-- Communication Channels -->
            <div>
              <h3 class="text-lg font-medium mb-4">Communication Channels</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p class="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch bind:checked={$notificationData.emailNotifications} />
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p class="text-sm text-muted-foreground">Receive browser push notifications</p>
                  </div>
                  <Switch bind:checked={$notificationData.pushNotifications} />
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p class="text-sm text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                  <Switch bind:checked={$notificationData.smsNotifications} />
                </div>
              </div>
            </div>

            <Separator />

            <!-- Notification Types -->
            <div>
              <h3 class="text-lg font-medium mb-4">Notification Types</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <Label>Lead Alerts</Label>
                    <p class="text-sm text-muted-foreground">New leads and lead score changes</p>
                  </div>
                  <Switch bind:checked={$notificationData.leadAlerts} />
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <Label>Deal Updates</Label>
                    <p class="text-sm text-muted-foreground">Deal stage changes and wins</p>
                  </div>
                  <Switch bind:checked={$notificationData.dealUpdates} />
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <Label>Team Updates</Label>
                    <p class="text-sm text-muted-foreground">Team member activities and achievements</p>
                  </div>
                  <Switch bind:checked={$notificationData.teamUpdates} />
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <Label>Weekly Reports</Label>
                    <p class="text-sm text-muted-foreground">Weekly performance summaries</p>
                  </div>
                  <Switch bind:checked={$notificationData.weeklyReports} />
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <Label>Monthly Reports</Label>
                    <p class="text-sm text-muted-foreground">Monthly analytics and insights</p>
                  </div>
                  <Switch bind:checked={$notificationData.monthlyReports} />
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <Label>Marketing Emails</Label>
                    <p class="text-sm text-muted-foreground">Product updates and tips</p>
                  </div>
                  <Switch bind:checked={$notificationData.marketingEmails} />
                </div>
              </div>
            </div>

            <Form.Button>Save Preferences</Form.Button>
          </form>
        </Card.Content>
      </Card.Root>
    </Tabs.Content>

    <!-- Team Tab -->
    <Tabs.Content value="team" class="space-y-6">
      <!-- Team Members -->
      <Card.Root>
        <Card.Header>
          <div class="flex items-center justify-between">
            <div>
              <Card.Title>Team Members</Card.Title>
              <Card.Description>Manage your team members and their permissions</Card.Description>
            </div>
            <Button onclick={() => showInviteDialog = true}>
              <Plus class="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </div>
        </Card.Header>
        <Card.Content>
          <div class="space-y-4">
            {#each teamMembers as member}
              <div class="flex items-center justify-between p-4 border rounded-lg">
                <div class="flex items-center gap-4">
                  <Avatar class="h-10 w-10">
                    <img src={member.avatar} alt={member.name} />
                  </Avatar>
                  <div>
                    <p class="font-medium">{member.name}</p>
                    <p class="text-sm text-muted-foreground">{member.email}</p>
                    <p class="text-xs text-muted-foreground">Last active: {member.lastActive}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <Badge class={getRoleColor(member.role)}>
                    {member.role.replace('_', ' ')}
                  </Badge>
                  <Badge class={getStatusColor(member.status)}>
                    {member.status}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Edit class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onclick={() => removeMember(member.id)}>
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            {/each}
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Performance Tracking -->
      <Card.Root>
        <Card.Header>
          <Card.Title>Performance Tracking Settings</Card.Title>
          <Card.Description>Configure how team performance is tracked and measured</Card.Description>
        </Card.Header>
        <Card.Content class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <Label>Activity Tracking</Label>
              <p class="text-sm text-muted-foreground">Track calls, emails, and meetings</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <Label>Goal Tracking</Label>
              <p class="text-sm text-muted-foreground">Monitor progress towards sales goals</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <Label>Leaderboards</Label>
              <p class="text-sm text-muted-foreground">Show team performance rankings</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <Label>Performance Reports</Label>
              <p class="text-sm text-muted-foreground">Generate individual performance reports</p>
            </div>
            <Switch defaultChecked />
          </div>
        </Card.Content>
      </Card.Root>
    </Tabs.Content>

    <!-- AI Configuration Tab -->
    <Tabs.Content value="ai" class="space-y-6">
      <Card.Root>
        <Card.Header>
          <Card.Title>AI Model Configuration</Card.Title>
          <Card.Description>Customize AI features and behavior for your sales process</Card.Description>
        </Card.Header>
        <Card.Content>
          <form method="POST" action="?/updateAiConfig" use:aiConfigEnhance class="space-y-6">
            <!-- Lead Scoring -->
            <div>
              <h3 class="text-lg font-medium mb-4">Lead Scoring</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <Label>Enable Lead Scoring</Label>
                    <p class="text-sm text-muted-foreground">Automatically score leads based on behavior</p>
                  </div>
                  <Switch bind:checked={$aiConfigData.leadScoringEnabled} />
                </div>

                {#if $aiConfigData.leadScoringEnabled}
                  <div>
                    <Label>Lead Scoring Threshold</Label>
                    <p class="text-sm text-muted-foreground mb-2">
                      Minimum score for high-priority leads: {$aiConfigData.leadScoringThreshold}
                    </p>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      bind:value={$aiConfigData.leadScoringThreshold}
                      class="w-full"
                    />
                  </div>
                {/if}
              </div>
            </div>

            <Separator />

            <!-- Sales Coaching -->
            <div>
              <h3 class="text-lg font-medium mb-4">Sales Coaching</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <Label>Enable AI Coaching</Label>
                    <p class="text-sm text-muted-foreground">Real-time coaching during calls</p>
                  </div>
                  <Switch bind:checked={$aiConfigData.coachingEnabled} />
                </div>

                {#if $aiConfigData.coachingEnabled}
                  <Form.Field form={aiConfigForm} name="coachingTone">
                    <Form.Control>
                      {#snippet children({ props })}
                        <Form.Label>Coaching Tone</Form.Label>
                        <Select.Root bind:value={$aiConfigData.coachingTone}>
                          <Select.Trigger {...props}>
                            {$aiConfigData.coachingTone.charAt(0).toUpperCase() + $aiConfigData.coachingTone.slice(1)}
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Item value="encouraging">Encouraging</Select.Item>
                            <Select.Item value="direct">Direct</Select.Item>
                            <Select.Item value="instructive">Instructive</Select.Item>
                          </Select.Content>
                        </Select.Root>
                      {/snippet}
                    </Form.Control>
                    <Form.FieldErrors />
                  </Form.Field>
                {/if}
              </div>
            </div>

            <Separator />

            <!-- Content Generation -->
            <div>
              <h3 class="text-lg font-medium mb-4">Content Generation</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <Label>Enable Content Generation</Label>
                    <p class="text-sm text-muted-foreground">AI-generated emails and messages</p>
                  </div>
                  <Switch bind:checked={$aiConfigData.contentGenerationEnabled} />
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <Label>Auto Personalization</Label>
                    <p class="text-sm text-muted-foreground">Automatically personalize content</p>
                  </div>
                  <Switch bind:checked={$aiConfigData.autoPersonalization} />
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <Label>Sentiment Analysis</Label>
                    <p class="text-sm text-muted-foreground">Analyze customer sentiment in communications</p>
                  </div>
                  <Switch bind:checked={$aiConfigData.sentimentAnalysis} />
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <Label>Predictive Forecasting</Label>
                    <p class="text-sm text-muted-foreground">AI-powered sales forecasting</p>
                  </div>
                  <Switch bind:checked={$aiConfigData.predictiveForecasting} />
                </div>
              </div>
            </div>

            <Form.Button>Save AI Configuration</Form.Button>
          </form>
        </Card.Content>
      </Card.Root>
    </Tabs.Content>

    <!-- Security Tab -->
    <Tabs.Content value="security" class="space-y-6">
      <!-- Password & Authentication -->
      <Card.Root>
        <Card.Header>
          <Card.Title>Password & Authentication</Card.Title>
          <Card.Description>Manage your password and authentication settings</Card.Description>
        </Card.Header>
        <Card.Content class="space-y-6">
          <!-- Change Password -->
          <div>
            <Button variant="outline" onclick={() => showPasswordDialog = true}>
              <Key class="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </div>

          <!-- Two-Factor Authentication -->
          <div class="flex items-center justify-between">
            <div>
              <Label>Two-Factor Authentication</Label>
              <p class="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <div class="flex items-center gap-2">
              <Badge variant="outline" class="text-green-600">
                <CheckCircle class="h-3 w-3 mr-1" />
                Enabled
              </Badge>
              <Button variant="outline" size="sm" onclick={() => show2FADialog = true}>
                <Smartphone class="h-4 w-4 mr-2" />
                Manage
              </Button>
            </div>
          </div>

          <!-- Session Timeout -->
          <div>
            <Label>Session Timeout</Label>
            <p class="text-sm text-muted-foreground mb-2">
              Automatically log out after {$securityData.sessionTimeout} minutes of inactivity
            </p>
            <input
              type="range"
              min="15"
              max="480"
              step="15"
              bind:value={$securityData.sessionTimeout}
              class="w-full"
            />
            <div class="flex justify-between text-xs text-muted-foreground mt-1">
              <span>15 min</span>
              <span>8 hours</span>
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- API Access Tokens -->
      <Card.Root>
        <Card.Header>
          <div class="flex items-center justify-between">
            <div>
              <Card.Title>API Access Tokens</Card.Title>
              <Card.Description>Manage API tokens for integrations</Card.Description>
            </div>
            <Button onclick={() => showApiTokenDialog = true}>
              <Plus class="h-4 w-4 mr-2" />
              Generate Token
            </Button>
          </div>
        </Card.Header>
        <Card.Content>
          <div class="space-y-4">
            {#each apiTokens as token}
              <div class="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p class="font-medium">{token.name}</p>
                  <p class="text-sm text-muted-foreground font-mono">{token.token}****</p>
                  <p class="text-xs text-muted-foreground">Last used: {token.lastUsed}</p>
                </div>
                <div class="flex items-center gap-2">
                  <div class="flex gap-1">
                    {#each token.permissions as permission}
                      <Badge variant="outline" class="text-xs">{permission}</Badge>
                    {/each}
                  </div>
                  <Button variant="ghost" size="icon" onclick={() => copyApiToken(token.token)}>
                    <Copy class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            {/each}
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Activity Logs -->
      <Card.Root>
        <Card.Header>
          <div class="flex items-center justify-between">
            <div>
              <Card.Title>Activity Logs</Card.Title>
              <Card.Description>Recent security-related activities</Card.Description>
            </div>
            <Button variant="outline" onclick={exportActivityLogs}>
              <Download class="h-4 w-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </Card.Header>
        <Card.Content>
          <div class="space-y-4">
            {#each activityLogs as log}
              <div class="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p class="font-medium">{log.action}</p>
                  <p class="text-sm text-muted-foreground">{log.timestamp}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm">{log.ip}</p>
                  <p class="text-xs text-muted-foreground">{log.device}</p>
                </div>
              </div>
            {/each}
          </div>
        </Card.Content>
      </Card.Root>
    </Tabs.Content>

    <!-- Billing Tab -->
    <Tabs.Content value="billing" class="space-y-6">
      <!-- Current Plan -->
      <Card.Root>
        <Card.Header>
          <Card.Title>Current Plan</Card.Title>
          <Card.Description>Manage your subscription and billing</Card.Description>
        </Card.Header>
        <Card.Content class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-medium">{subscriptionData.plan} Plan</h3>
              <p class="text-sm text-muted-foreground">
                ${subscriptionData.amount}/month • Next billing: {subscriptionData.nextBilling}
              </p>
            </div>
            <Badge class="bg-green-100 text-green-800">
              {subscriptionData.status}
            </Badge>
          </div>

          <div>
            <div class="flex justify-between text-sm mb-2">
              <span>Team Seats Used</span>
              <span>{subscriptionData.usedSeats} of {subscriptionData.seats}</span>
            </div>
            <Progress value={(subscriptionData.usedSeats / subscriptionData.seats) * 100} />
          </div>

          <div class="flex gap-4">
            <Button>Upgrade Plan</Button>
            <Button variant="outline">Manage Billing</Button>
            <Button variant="outline">Download Invoice</Button>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Usage Statistics -->
      <Card.Root>
        <Card.Header>
          <Card.Title>Usage Statistics</Card.Title>
          <Card.Description>Current month usage across features</Card.Description>
        </Card.Header>
        <Card.Content>
          <div class="grid grid-cols-2 gap-6">
            <div>
              <div class="flex justify-between text-sm mb-2">
                <span>API Calls</span>
                <span>8,450 of 10,000</span>
              </div>
              <Progress value={84.5} />
            </div>

            <div>
              <div class="flex justify-between text-sm mb-2">
                <span>AI Generations</span>
                <span>1,230 of 2,000</span>
              </div>
              <Progress value={61.5} />
            </div>

            <div>
              <div class="flex justify-between text-sm mb-2">
                <span>Email Sequences</span>
                <span>45 of 100</span>
              </div>
              <Progress value={45} />
            </div>

            <div>
              <div class="flex justify-between text-sm mb-2">
                <span>Storage Used</span>
                <span>2.3 GB of 10 GB</span>
              </div>
              <Progress value={23} />
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Danger Zone -->
      <Card.Root class="border-destructive">
        <Card.Header>
          <Card.Title class="text-destructive">Danger Zone</Card.Title>
          <Card.Description>Irreversible and destructive actions</Card.Description>
        </Card.Header>
        <Card.Content>
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">Delete Account</p>
              <p class="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="destructive" onclick={() => showDeleteAccountDialog = true}>
              Delete Account
            </Button>
          </div>
        </Card.Content>
      </Card.Root>
    </Tabs.Content>
  </Tabs.Root>

  <!-- Profile Picture Dialog -->
  <Dialog.Root bind:open={showProfilePictureDialog}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Change Profile Picture</Dialog.Title>
        <Dialog.Description>Upload a new profile picture</Dialog.Description>
      </Dialog.Header>

      <div class="space-y-4">
        <div class="flex items-center justify-center w-full">
          <label class="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
            <div class="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload class="w-8 h-8 mb-4 text-muted-foreground" />
              <p class="mb-2 text-sm text-muted-foreground">
                <span class="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p class="text-xs text-muted-foreground">PNG, JPG or GIF (MAX. 1MB)</p>
            </div>
            <input type="file" class="hidden" accept="image/*" onchange={handleProfilePictureUpload} />
          </label>
        </div>
      </div>

      <Dialog.Footer>
        <Button variant="outline" onclick={() => showProfilePictureDialog = false}>
          Cancel
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>

  <!-- Invite Team Member Dialog -->
  <Dialog.Root bind:open={showInviteDialog}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Invite Team Member</Dialog.Title>
        <Dialog.Description>Send an invitation to join your team</Dialog.Description>
      </Dialog.Header>

      <form method="POST" action="?/updateTeam" use:teamEnhance class="space-y-4">
        <Form.Field form={teamForm} name="memberEmail">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Email Address</Form.Label>
              <Input {...props} type="email" bind:value={$teamData.memberEmail} />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Form.Field form={teamForm} name="memberRole">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Role</Form.Label>
              <Select.Root bind:value={$teamData.memberRole}>
                <Select.Trigger {...props}>
                  {roles.find(role => role.value === $teamData.memberRole)?.label || "Select role"}
                </Select.Trigger>
                <Select.Content>
                  {#each roles as role}
                    <Select.Item value={role.value}>{role.label}</Select.Item>
                  {/each}
                </Select.Content>
              </Select.Root>
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Dialog.Footer>
          <Button variant="outline" onclick={() => showInviteDialog = false}>
            Cancel
          </Button>
          <Form.Button>Send Invitation</Form.Button>
        </Dialog.Footer>
      </form>
    </Dialog.Content>
  </Dialog.Root>

  <!-- Change Password Dialog -->
  <Dialog.Root bind:open={showPasswordDialog}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Change Password</Dialog.Title>
        <Dialog.Description>Update your account password</Dialog.Description>
      </Dialog.Header>

      <form method="POST" action="?/updateSecurity" use:securityEnhance class="space-y-4">
        <Form.Field form={securityForm} name="currentPassword">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Current Password</Form.Label>
              <div class="relative">
                <Input 
                  {...props} 
                  type="password" 
                  bind:value={$securityData.currentPassword} 
                />
              </div>
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Form.Field form={securityForm} name="newPassword">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>New Password</Form.Label>
              <div class="relative">
                <Input 
                  {...props} 
                  type={showNewPasswordField ? "text" : "password"} 
                  bind:value={$securityData.newPassword} 
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  class="absolute right-2 top-1/2 -translate-y-1/2"
                  onclick={() => showNewPasswordField = !showNewPasswordField}
                >
                  {#if showNewPasswordField}
                    <EyeOff class="h-4 w-4" />
                  {:else}
                    <Eye class="h-4 w-4" />
                  {/if}
                </Button>
              </div>
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Form.Field form={securityForm} name="confirmPassword">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Confirm New Password</Form.Label>
              <div class="relative">
                <Input 
                  {...props} 
                  type={showConfirmPasswordField ? "text" : "password"} 
                  bind:value={$securityData.confirmPassword} 
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  class="absolute right-2 top-1/2 -translate-y-1/2"
                  onclick={() => showConfirmPasswordField = !showConfirmPasswordField}
                >
                  {#if showConfirmPasswordField}
                    <EyeOff class="h-4 w-4" />
                  {:else}
                    <Eye class="h-4 w-4" />
                  {/if}
                </Button>
              </div>
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Dialog.Footer>
          <Button variant="outline" onclick={() => showPasswordDialog = false}>
            Cancel
          </Button>
          <Form.Button>Update Password</Form.Button>
        </Dialog.Footer>
      </form>
    </Dialog.Content>
  </Dialog.Root>

  <!-- 2FA Management Dialog -->
  <Dialog.Root bind:open={show2FADialog}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Two-Factor Authentication</Dialog.Title>
        <Dialog.Description>Manage your 2FA settings</Dialog.Description>
      </Dialog.Header>

      <div class="space-y-4">
        <div class="flex items-center gap-4 p-4 border rounded-lg">
          <Smartphone class="h-8 w-8" />
          <div class="flex-1">
            <p class="font-medium">Authenticator App</p>
            <p class="text-sm text-muted-foreground">Use Google Authenticator or similar app</p>
          </div>
          <Badge class="bg-green-100 text-green-800">Active</Badge>
        </div>

        <div class="flex items-center gap-4 p-4 border rounded-lg">
          <Key class="h-8 w-8" />
          <div class="flex-1">
            <p class="font-medium">Backup Codes</p>
            <p class="text-sm text-muted-foreground">Download backup codes for recovery</p>
          </div>
          <Button variant="outline" size="sm">Download</Button>
        </div>
      </div>

      <Dialog.Footer>
        <Button variant="outline" onclick={() => show2FADialog = false}>
          Close
        </Button>
        <Button variant="destructive">Disable 2FA</Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>

  <!-- API Token Dialog -->
  <Dialog.Root bind:open={showApiTokenDialog}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Generate API Token</Dialog.Title>
        <Dialog.Description>Create a new API token for integrations</Dialog.Description>
      </Dialog.Header>

      <div class="space-y-4">
        <div>
          <Label>Token Name</Label>
          <Input placeholder="e.g., Production API" />
        </div>

        <div>
          <Label>Permissions</Label>
          <div class="space-y-2 mt-2">
            <label class="flex items-center space-x-2">
              <input type="checkbox" checked />
              <span class="text-sm">Read access</span>
            </label>
            <label class="flex items-center space-x-2">
              <input type="checkbox" />
              <span class="text-sm">Write access</span>
            </label>
            <label class="flex items-center space-x-2">
              <input type="checkbox" />
              <span class="text-sm">Admin access</span>
            </label>
          </div>
        </div>
      </div>

      <Dialog.Footer>
        <Button variant="outline" onclick={() => showApiTokenDialog = false}>
          Cancel
        </Button>
        <Button onclick={generateApiToken}>Generate Token</Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>

  <!-- Delete Account Dialog -->
  <AlertDialog.Root bind:open={showDeleteAccountDialog}>
    <AlertDialog.Content>
      <AlertDialog.Header>
        <AlertDialog.Title>Delete Account</AlertDialog.Title>
        <AlertDialog.Description>
          This action cannot be undone. This will permanently delete your account and remove all associated data from our servers.
        </AlertDialog.Description>
      </AlertDialog.Header>
      
      <div class="my-4">
        <Label>Type "DELETE" to confirm</Label>
        <Input placeholder="DELETE" class="mt-2" />
      </div>

      <AlertDialog.Footer>
        <AlertDialog.Cancel onclick={() => showDeleteAccountDialog = false}>
          Cancel
        </AlertDialog.Cancel>
        <AlertDialog.Action class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
          Delete Account
        </AlertDialog.Action>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
</div>