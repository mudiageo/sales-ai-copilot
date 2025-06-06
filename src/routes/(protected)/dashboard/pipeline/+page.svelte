<script lang="ts">
  import { onMount } from 'svelte';
  import { DndContext, DragOverlay, closestCenter } from '@dnd-kit-svelte/core';
  import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit-svelte/sortable';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Select } from '$lib/components/ui/select';
  import * as Card from '$lib/components/ui/card';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import Mail from "@lucide/svelte/icons/mail"
	import Phone from "@lucide/svelte/icons/phone"
	import Calendar from "@lucide/svelte/icons/calendar"
	import Plus from "@lucide/svelte/icons/plus"
	import MoreVertical from "@lucide/svelte/icons/more-vertical"

  // Pipeline stages
  const stages = [
    { id: 'prospecting', name: 'Prospecting' },
    { id: 'qualification', name: 'Qualification' },
    { id: 'proposal', name: 'Proposal' },
    { id: 'negotiation', name: 'Negotiation' },
    { id: 'closed_won', name: 'Closed Won' },
    { id: 'closed_lost', name: 'Closed Lost' }
  ];

  // Mock data for deals
  const mockDeals = Array.from({ length: 20 }, (_, i) => ({
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

  let deals = $state(mockDeals);
  let activeDeal = $state(null);
  let selectedRep = $state('');
  let dateRange = $state('');
  let minDealSize = $state('');
  let maxDealSize = $state('');

  // Computed pipeline metrics
   let metrics = $derived.by(() => {
    const metrics = {
      totalValue: deals.reduce((sum, deal) => sum + deal.value, 0),
      weightedValue: deals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0),
      avgDealSize: deals.reduce((sum, deal) => sum + deal.value, 0) / deals.length,
      winRate: {
        total: deals.filter(d => d.stage === 'closed_won').length / deals.length * 100,
        byStage: stages.reduce((acc, stage) => {
          const stageDeals = deals.filter(d => d.stage === stage.id);
          acc[stage.id] = stageDeals.length ? 
            (stageDeals.filter(d => d.probability > 70).length / stageDeals.length * 100) : 0;
          return acc;
        }, {})
      }
    };
    return metrics;
  });

  // Filtered deals based on selected criteria
    deals = deals.filter(deal => {
      if (selectedRep && deal.assignedRep !== selectedRep) return false;
      if (minDealSize && deal.value < parseInt(minDealSize)) return false;
      if (maxDealSize && deal.value > parseInt(maxDealSize)) return false;
      return true;
    });

  function handleDragStart(event) {
    activeDeal = deals.find(deal => deal.id === event.active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = deals.findIndex(deal => deal.id === active.id);
      const newStage = over.id.split('-')[1];
      
      deals = deals.map(deal => 
        deal.id === active.id ? { ...deal, stage: newStage } : deal
      );
    }
    
    activeDeal = null;
  }

  function handleDragCancel() {
    activeDeal = null;
  }

  async function predictDealProbability(deal) {
    // Simulate AI prediction
    await new Promise(resolve => setTimeout(resolve, 1000));
    return Math.floor(Math.random() * 30) + 70;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  function getDaysAgo(date) {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    return days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`;
  }
</script>

<div class="space-y-6 px-4 lg:px-6">
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
    <Card.Root class="p-6">
      <div class="flex flex-col">
        <span class="text-sm font-medium text-muted-foreground">Total Pipeline</span>
        <span class="text-2xl font-bold">{formatCurrency(metrics.totalValue)}</span>
      </div>
    </Card.Root>
    
    <Card.Root class="p-6">
      <div class="flex flex-col">
        <span class="text-sm font-medium text-muted-foreground">Weighted Pipeline</span>
        <span class="text-2xl font-bold">{formatCurrency(metrics.weightedValue)}</span>
      </div>
    </Card.Root>
    
    <Card.Root class="p-6">
      <div class="flex flex-col">
        <span class="text-sm font-medium text-muted-foreground">Average Deal Size</span>
        <span class="text-2xl font-bold">{formatCurrency(metrics.avgDealSize)}</span>
      </div>
    </Card.Root>
    
    <Card.Root class="p-6">
      <div class="flex flex-col">
        <span class="text-sm font-medium text-muted-foreground">Win Rate</span>
        <span class="text-2xl font-bold">{metrics.winRate.total.toFixed(1)}%</span>
      </div>
    </Card.Root>
  </div>

  <!-- Filters -->
  <Card.Root class="p-4">
    <div class="flex flex-wrap gap-4">
      <Select bind:value={selectedRep} class="w-[200px]">
        <option value="">All Sales Reps</option>
        <option value="Sarah Chen">Sarah Chen</option>
        <option value="Michael Rodriguez">Michael Rodriguez</option>
        <option value="Emily Taylor">Emily Taylor</option>
        <option value="David Kim">David Kim</option>
      </Select>

      <Select bind:value={dateRange} class="w-[200px]">
        <option value="">All Time</option>
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
        <option value="quarter">This Quarter</option>
      </Select>

      <div class="flex items-center gap-2">
        <Input
          type="number"
          placeholder="Min Deal Size"
          class="w-[150px]"
          bind:value={minDealSize}
        />
        <span>-</span>
        <Input
          type="number"
          placeholder="Max Deal Size"
          class="w-[150px]"
          bind:value={maxDealSize}
        />
      </div>
    </div>
  </Card.Root>

  <!-- Pipeline Board -->
  <DndContext
    onDragStart={handleDragStart}
    onDragEnd={handleDragEnd}
    onDragCancel={handleDragCancel}
    collisionDetection={closestCenter}
  >
    <div class="grid grid-cols-1 lg:grid-cols-6 gap-4 min-h-[600px]">
      {#each stages as stage}
        <div class="flex flex-col bg-muted/50 rounded-lg p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold">{stage.name}</h3>
            <div class="text-sm text-muted-foreground">
              {deals.filter(d => d.stage === stage.id).length} deals
            </div>
          </div>

          <SortableContext
            items={deals.filter(d => d.stage === stage.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div class="flex flex-col gap-2">
              {#each deals.filter(d => d.stage === stage.id) as deal (deal.id)}
                <Card.Root class="bg-card p-4">
                  <div class="flex items-start justify-between">
                    <div>
                      <h4 class="font-medium">{deal.company}</h4>
                      <p class="text-xl font-bold">{formatCurrency(deal.value)}</p>
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

                  <div class="mt-4 space-y-2">
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-muted-foreground">Probability</span>
                      <div class="flex items-center gap-2">
                        <div class="w-24 h-2 rounded-full bg-primary/20">
                          <div
                            class="h-full rounded-full bg-primary"
                            style={`width: ${deal.probability}%`}
                          ></div>
                        </div>
                        <span>{deal.probability}%</span>
                      </div>
                    </div>

                    <div class="flex items-center justify-between text-sm">
                      <span class="text-muted-foreground">Days in stage</span>
                      <span>{deal.daysInStage}</span>
                    </div>

                    <div class="flex items-center justify-between text-sm">
                      <span class="text-muted-foreground">Assigned to</span>
                      <span>{deal.assignedRep}</span>
                    </div>

                    <div class="flex items-center justify-between text-sm">
                      <span class="text-muted-foreground">Last activity</span>
                      <span>{getDaysAgo(deal.lastActivity)}</span>
                    </div>
                  </div>

                  <div class="mt-4 flex gap-2 w-full">
                    <Button variant="outline" size="sm" class="">
                      <Phone class="h-4 w-4 mr-2"/>
                      Call
                    </Button>
                    <Button variant="outline" size="sm" class="">
                      <Mail class="h-4 w-4 mr-2"/>
                      Email
                    </Button>
                  </div>
                </Card.Root>
              {/each}
            </div>
          </SortableContext>
        </div>
      {/each}
    </div>

    <DragOverlay>
      {#if activeDeal}
        <Card.Root class="bg-card p-4 w-[300px] opacity-80">
          <h4 class="font-medium">{activeDeal.company}</h4>
          <p class="text-xl font-bold">{formatCurrency(activeDeal.value)}</p>
        </Card.Root>
      {/if}
    </DragOverlay>
  </DndContext>
</div>