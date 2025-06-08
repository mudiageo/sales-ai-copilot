<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import * as Select from '$lib/components/ui/select';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Card } from '$lib/components/ui/card';
  import DataTableLeads from './data-table-leads.svelte';
  import type { Lead } from './schemas.js';
  import Plus from "@lucide/svelte/icons/plus";
  import Upload from "@lucide/svelte/icons/upload";
  import Filter from "@lucide/svelte/icons/filter";
  import Sparkles from "@lucide/svelte/icons/sparkles";

  // Mock data
  const mockLeads: Lead[] = Array.from({ length: 50 }, (_, i) => ({
    id: `LEAD-${i + 1}`,
    name: `Contact ${i + 1}`,
    company: `Company ${i + 1}`,
    title: ['CEO', 'CTO', 'CFO', 'VP Sales', 'Director'][Math.floor(Math.random() * 5)],
    leadScore: Math.floor(Math.random() * 100),
    status: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation'][Math.floor(Math.random() * 5)] as Lead['status'],
    lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    assignedRep: ['Sarah Chen', 'Michael Rodriguez', 'Emily Taylor', 'David Kim'][Math.floor(Math.random() * 4)]
  }));

  // State
  let searchQuery = $state('');
  let statusFilter = $state('');
  let dateFilter = $state('');
  let selectedLead = $state<Lead | null>(null);
  let showLeadModal = $state(false);

  // Filters
  let filteredLeads = $derived(mockLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  }));

  function showLeadDetails(lead: Lead) {
    selectedLead = lead;
    showLeadModal = true;
  }

  // Import functionality
  function handleFileImport(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      // Implement file import logic
      console.log('Importing file:', file);
    }
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold">Leads Management</h1>
      <p class="text-muted-foreground">Manage and track your sales leads</p>
    </div>
    <div class="flex items-center gap-4">
      <label class="cursor-pointer">
        <input type="file" class="hidden" accept=".csv,.xlsx" onchange={handleFileImport} />
        <Button variant="outline">
          <Upload class="h-4 w-4 mr-2" />
          Import Leads
        </Button>
      </label>
      <Button>
        <Plus class="h-4 w-4 mr-2" />
        Add Lead
      </Button>
    </div>
  </div>

  <!-- Filters -->
  <Card class="p-4">
    <div class="flex flex-wrap gap-4">
      <div class="flex-1 min-w-[200px]">
        <Input
          type="search"
          placeholder="Search leads..."
          bind:value={searchQuery}
        />
      </div>
      <Select.Root bind:value={statusFilter}>
        <Select.Trigger class="w-[200px]">
          {statusFilter || "All Statuses"}
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="">All Statuses</Select.Item>
          <Select.Item value="New">New</Select.Item>
          <Select.Item value="Contacted">Contacted</Select.Item>
          <Select.Item value="Qualified">Qualified</Select.Item>
          <Select.Item value="Proposal">Proposal</Select.Item>
          <Select.Item value="Negotiation">Negotiation</Select.Item>
        </Select.Content>
      </Select.Root>
      <Select.Root bind:value={dateFilter}>
        <Select.Trigger class="w-[200px]">
          {dateFilter || "All Time"}
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="">All Time</Select.Item>
          <Select.Item value="today">Today</Select.Item>
          <Select.Item value="week">This Week</Select.Item>
          <Select.Item value="month">This Month</Select.Item>
        </Select.Content>
      </Select.Root>
      <Button variant="outline">
        <Filter class="h-4 w-4 mr-2" />
        More Filters
      </Button>
    </div>
  </Card>

  <!-- Leads Data Table -->
  <DataTableLeads data={filteredLeads} onShowLeadDetails={showLeadDetails} />

  <!-- Lead Detail Modal -->
  <Dialog.Root bind:open={showLeadModal}>
    <Dialog.Content class="max-w-3xl">
      {#if selectedLead}
        <Dialog.Header>
          <Dialog.Title>Lead Details</Dialog.Title>
          <Dialog.Description>
            View and manage lead information
          </Dialog.Description>
        </Dialog.Header>

        <div class="grid grid-cols-2 gap-6">
          <!-- Contact Information -->
          <div>
            <h3 class="font-semibold mb-4">Contact Information</h3>
            <div class="space-y-2">
              <div>
                <span class="text-sm text-muted-foreground">Name:</span>
                <p>{selectedLead.name}</p>
              </div>
              <div>
                <span class="text-sm text-muted-foreground">Company:</span>
                <p>{selectedLead.company}</p>
              </div>
              <div>
                <span class="text-sm text-muted-foreground">Title:</span>
                <p>{selectedLead.title}</p>
              </div>
            </div>
          </div>

          <!-- Lead Score & Status -->
          <div>
            <h3 class="font-semibold mb-4">Lead Score</h3>
            <div class="flex items-center gap-4 mb-6">
              <div class="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center">
                <span class="text-2xl font-bold">{selectedLead.leadScore}</span>
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Current Status</p>
                <p class="font-medium">{selectedLead.status}</p>
              </div>
            </div>
          </div>

          <!-- AI Insights -->
          <div class="col-span-2">
            <h3 class="font-semibold mb-4">AI Insights</h3>
            <Card class="p-4 bg-primary/5">
              <div class="space-y-2">
                <div class="flex items-start gap-2">
                  <Sparkles class="h-5 w-5 text-primary mt-0.5" />
                  <p class="text-sm">High engagement with pricing page suggests strong purchase intent</p>
                </div>
                <div class="flex items-start gap-2">
                  <Sparkles class="h-5 w-5 text-primary mt-0.5" />
                  <p class="text-sm">Similar profile to recently converted enterprise customers</p>
                </div>
                <div class="flex items-start gap-2">
                  <Sparkles class="h-5 w-5 text-primary mt-0.5" />
                  <p class="text-sm">Recommended next action: Schedule product demo</p>
                </div>
              </div>
            </Card>
          </div>

          <!-- Activity Timeline -->
          <div class="col-span-2">
            <h3 class="font-semibold mb-4">Activity Timeline</h3>
            <div class="space-y-4">
              {#each Array(3) as _, i}
                <div class="flex gap-4">
                  <div class="flex flex-col items-center">
                    <div class="w-2 h-2 rounded-full bg-primary"></div>
                    {#if i < 2}
                      <div class="w-0.5 h-full bg-border"></div>
                    {/if}
                  </div>
                  <div>
                    <p class="text-sm font-medium">Email opened: Product Overview</p>
                    <p class="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <Dialog.Footer>
          <Button variant="outline" onclick={() => showLeadModal = false}>
            Close
          </Button>
          <Button>
            Edit Lead
          </Button>
        </Dialog.Footer>
      {/if}
    </Dialog.Content>
  </Dialog.Root>
</div>