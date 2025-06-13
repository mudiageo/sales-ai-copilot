<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { toast } from 'svelte-sonner';
  
  // Icons
  import Plus from "@lucide/svelte/icons/plus";
  import Phone from "@lucide/svelte/icons/phone";
  import Mail from "@lucide/svelte/icons/mail";
  import Calendar from "@lucide/svelte/icons/calendar";
  import TrendingUp from "@lucide/svelte/icons/trending-up";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import Target from "@lucide/svelte/icons/target";
  import Users from "@lucide/svelte/icons/users";
  import DollarSign from "@lucide/svelte/icons/dollar-sign";
  import Activity from "@lucide/svelte/icons/activity";

  // Mock data for demo
  const mockData = {
    leads: [
      { id: 1, name: 'TechCorp Inc.', score: 85, status: 'Hot' },
      { id: 2, name: 'InnovateX', score: 72, status: 'Warm' },
      { id: 3, name: 'GrowthMax', score: 91, status: 'Hot' }
    ],
    metrics: {
      totalLeads: 247,
      conversionRate: 32.5,
      pipelineValue: 1250000,
      activitiesCompleted: 156
    },
    recentActivity: [
      { type: 'call', description: 'Called TechCorp Inc.', time: '2 hours ago' },
      { type: 'email', description: 'Sent proposal to InnovateX', time: '4 hours ago' },
      { type: 'meeting', description: 'Demo scheduled with GrowthMax', time: '1 day ago' }
    ]
  };

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  function showNewLeadDialog() {
    toast.success('New lead dialog would open here');
  }
</script>

<div class="dashboard-view space-y-6">
  <!-- Metrics Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <Card class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Total Leads</p>
          <p class="text-2xl font-bold">{mockData.metrics.totalLeads}</p>
          <p class="text-sm text-green-600 mt-1">↑ 12% from last month</p>
        </div>
        <Users class="h-8 w-8 text-muted-foreground" />
      </div>
    </Card>
    
    <Card class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Conversion Rate</p>
          <p class="text-2xl font-bold">{mockData.metrics.conversionRate}%</p>
          <p class="text-sm text-green-600 mt-1">↑ 5% from last month</p>
        </div>
        <Target class="h-8 w-8 text-muted-foreground" />
      </div>
    </Card>
    
    <Card class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Pipeline Value</p>
          <p class="text-2xl font-bold">{formatCurrency(mockData.metrics.pipelineValue)}</p>
          <p class="text-sm text-green-600 mt-1">↑ 18% from last month</p>
        </div>
        <DollarSign class="h-8 w-8 text-muted-foreground" />
      </div>
    </Card>
    
    <Card class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Activities</p>
          <p class="text-2xl font-bold">{mockData.metrics.activitiesCompleted}</p>
          <p class="text-sm text-green-600 mt-1">↑ 8% from last month</p>
        </div>
        <Activity class="h-8 w-8 text-muted-foreground" />
      </div>
    </Card>
  </div>

  <!-- Top Leads -->
  <Card class="p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">Top Leads</h3>
      <Button variant="outline" size="sm">View All</Button>
    </div>
    <div class="space-y-4">
      {#each mockData.leads as lead}
        <div class="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 class="font-medium">{lead.name}</h4>
            <div class="flex items-center gap-2 mt-1">
              <Badge variant={lead.status === 'Hot' ? 'destructive' : 'secondary'}>
                {lead.status}
              </Badge>
              <span class="text-sm text-muted-foreground">Score: {lead.score}</span>
            </div>
          </div>
          <div class="flex gap-2">
            <Button variant="outline" size="sm">
              <Phone class="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Mail class="h-4 w-4" />
            </Button>
          </div>
        </div>
      {/each}
    </div>
  </Card>

  <!-- Recent Activity -->
  <Card class="p-6">
    <h3 class="text-lg font-semibold mb-4">Recent Activity</h3>
    <div class="space-y-4">
      {#each mockData.recentActivity as activity}
        <div class="flex items-center gap-3">
          {#if activity.type === 'call'}
            <Phone class="h-5 w-5 text-blue-500" />
          {:else if activity.type === 'email'}
            <Mail class="h-5 w-5 text-green-500" />
          {:else}
            <Calendar class="h-5 w-5 text-purple-500" />
          {/if}
          <div>
            <p class="font-medium">{activity.description}</p>
            <p class="text-sm text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      {/each}
    </div>
  </Card>

  <!-- Quick Actions -->
  <Card class="p-6">
    <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Button class="h-20 flex-col gap-2" onclick={showNewLeadDialog}>
        <Plus class="h-6 w-6" />
        <span>Add Lead</span>
      </Button>
      <Button variant="outline" class="h-20 flex-col gap-2">
        <Phone class="h-6 w-6" />
        <span>Make Call</span>
      </Button>
      <Button variant="outline" class="h-20 flex-col gap-2">
        <Mail class="h-6 w-6" />
        <span>Send Email</span>
      </Button>
      <Button variant="outline" class="h-20 flex-col gap-2">
        <Calendar class="h-6 w-6" />
        <span>Schedule</span>
      </Button>
    </div>
  </Card>

  <!-- AI Insights -->
  <Card class="p-6">
    <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
      <Sparkles class="h-5 w-5" />
      AI Insights
    </h3>
    <div class="space-y-4">
      <div class="flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
        <TrendingUp class="h-5 w-5 text-primary mt-0.5" />
        <div>
          <p class="font-medium">High-value lead identified</p>
          <p class="text-sm text-muted-foreground">TechCorp Inc. shows strong buying signals. Recommend immediate follow-up.</p>
        </div>
      </div>
      <div class="flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
        <Target class="h-5 w-5 text-primary mt-0.5" />
        <div>
          <p class="font-medium">Optimal contact time</p>
          <p class="text-sm text-muted-foreground">Best time to contact prospects is between 10-11 AM based on your data.</p>
        </div>
      </div>
    </div>
  </Card>
</div>