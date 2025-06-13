<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import Plus from "@lucide/svelte/icons/plus";
  import MoreVertical from "@lucide/svelte/icons/more-vertical";
  import Phone from "@lucide/svelte/icons/phone";
  import Mail from "@lucide/svelte/icons/mail";
  import Calendar from "@lucide/svelte/icons/calendar";
  import DollarSign from "@lucide/svelte/icons/dollar-sign";
  import TrendingUp from "@lucide/svelte/icons/trending-up";

  // Pipeline stages
  const stages = [
    { id: 'prospecting', name: 'Prospecting', color: 'bg-blue-100' },
    { id: 'qualification', name: 'Qualification', color: 'bg-yellow-100' },
    { id: 'proposal', name: 'Proposal', color: 'bg-orange-100' },
    { id: 'negotiation', name: 'Negotiation', color: 'bg-purple-100' },
    { id: 'closed_won', name: 'Closed Won', color: 'bg-green-100' }
  ];

  // Mock deals data
  const mockDeals = Array.from({ length: 15 }, (_, i) => ({
    id: `deal-${i + 1}`,
    company: `Company ${i + 1}`,
    value: Math.floor(Math.random() * 100000) + 10000,
    probability: Math.floor(Math.random() * 100),
    daysInStage: Math.floor(Math.random() * 30),
    stage: stages[Math.floor(Math.random() * 4)].id,
    assignedRep: ['Sarah Chen', 'Michael Rodriguez', 'Emily Taylor', 'David Kim'][
      Math.floor(Math.random() * 4)
    ],
    lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  }));

  // Pipeline metrics
  const metrics = {
    totalValue: mockDeals.reduce((sum, deal) => sum + deal.value, 0),
    weightedValue: mockDeals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0),
    avgDealSize: mockDeals.reduce((sum, deal) => sum + deal.value, 0) / mockDeals.length,
    winRate: 65
  };

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  function getDaysAgo(date: string) {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    return days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`;
  }

  function getDealsForStage(stageId: string) {
    return mockDeals.filter(deal => deal.stage === stageId);
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold">Sales Pipeline</h1>
      <p class="text-muted-foreground">Manage and track your deals</p>
    </div>
    <Button>
      <Plus class="h-4 w-4 mr-2" />
      Add Deal
    </Button>
  </div>

  <!-- Pipeline Analytics -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <Card class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Total Pipeline</p>
          <p class="text-2xl font-bold">{formatCurrency(metrics.totalValue)}</p>
        </div>
        <DollarSign class="h-8 w-8 text-muted-foreground" />
      </div>
    </Card>
    
    <Card class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Weighted Pipeline</p>
          <p class="text-2xl font-bold">{formatCurrency(metrics.weightedValue)}</p>
        </div>
        <TrendingUp class="h-8 w-8 text-muted-foreground" />
      </div>
    </Card>
    
    <Card class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Average Deal Size</p>
          <p class="text-2xl font-bold">{formatCurrency(metrics.avgDealSize)}</p>
        </div>
        <DollarSign class="h-8 w-8 text-muted-foreground" />
      </div>
    </Card>
    
    <Card class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Win Rate</p>
          <p class="text-2xl font-bold">{metrics.winRate}%</p>
        </div>
        <TrendingUp class="h-8 w-8 text-muted-foreground" />
      </div>
    </Card>
  </div>

  <!-- Pipeline Board -->
  <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[600px]">
    {#each stages as stage}
      {@const stageDeals = getDealsForStage(stage.id)}
      <div class="flex flex-col bg-muted/50 rounded-lg p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold">{stage.name}</h3>
          <div class="text-sm text-muted-foreground">
            {stageDeals.length} deals
          </div>
        </div>

        <div class="flex flex-col gap-3">
          {#each stageDeals as deal}
            <Card class="bg-card p-4">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h4 class="font-medium">{deal.company}</h4>
                  <p class="text-xl font-bold text-primary">{formatCurrency(deal.value)}</p>
                </div>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Button variant="ghost" size="icon">
                      <MoreVertical class="h-4 w-4" />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Item>
                      <Phone class="h-4 w-4 mr-2"/>
                      Call
                    </DropdownMenu.Item>
                    <DropdownMenu.Item>
                      <Mail class="h-4 w-4 mr-2" />
                      Email
                    </DropdownMenu.Item>
                    <DropdownMenu.Item>
                      <Calendar class="h-4 w-4 mr-2"/>
                      Schedule Meeting
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item>Edit Deal</DropdownMenu.Item>
                    <DropdownMenu.Item class="text-destructive">
                      Delete Deal
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </div>

              <div class="space-y-2 text-sm">
                <div class="flex items-center justify-between">
                  <span class="text-muted-foreground">Probability</span>
                  <div class="flex items-center gap-2">
                    <div class="w-16 h-2 rounded-full bg-primary/20">
                      <div
                        class="h-full rounded-full bg-primary"
                        style={`width: ${deal.probability}%`}
                      ></div>
                    </div>
                    <span>{deal.probability}%</span>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-muted-foreground">Days in stage</span>
                  <span>{deal.daysInStage}</span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-muted-foreground">Assigned to</span>
                  <span class="text-xs">{deal.assignedRep}</span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-muted-foreground">Last activity</span>
                  <span class="text-xs">{getDaysAgo(deal.lastActivity)}</span>
                </div>
              </div>

              <div class="mt-3 flex gap-2">
                <Button variant="outline" size="sm" class="flex-1">
                  <Phone class="h-3 w-3 mr-1"/>
                  Call
                </Button>
                <Button variant="outline" size="sm" class="flex-1">
                  <Mail class="h-3 w-3 mr-1"/>
                  Email
                </Button>
              </div>
            </Card>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>