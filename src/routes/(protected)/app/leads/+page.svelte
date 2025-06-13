<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import * as Select from '$lib/components/ui/select';
  import { Card } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import Plus from "@lucide/svelte/icons/plus";
  import Upload from "@lucide/svelte/icons/upload";
  import Filter from "@lucide/svelte/icons/filter";
  import Phone from "@lucide/svelte/icons/phone";
  import Mail from "@lucide/svelte/icons/mail";
  import Calendar from "@lucide/svelte/icons/calendar";
  import Sparkles from "@lucide/svelte/icons/sparkles";

  // Mock data
  const mockLeads = Array.from({ length: 10 }, (_, i) => ({
    id: `LEAD-${i + 1}`,
    name: `Contact ${i + 1}`,
    company: `Company ${i + 1}`,
    title: ['CEO', 'CTO', 'CFO', 'VP Sales', 'Director'][Math.floor(Math.random() * 5)],
    leadScore: Math.floor(Math.random() * 100),
    status: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation'][Math.floor(Math.random() * 5)],
    lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    assignedRep: ['Sarah Chen', 'Michael Rodriguez', 'Emily Taylor', 'David Kim'][Math.floor(Math.random() * 4)]
  }));

  let searchQuery = $state('');
  let statusFilter = $state('');

  function getScoreColor(score: number) {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'New': return 'text-blue-700 bg-blue-100';
      case 'Contacted': return 'text-yellow-700 bg-yellow-100';
      case 'Qualified': return 'text-green-700 bg-green-100';
      case 'Proposal': return 'text-purple-700 bg-purple-100';
      case 'Negotiation': return 'text-orange-700 bg-orange-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString();
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
      <Button variant="outline">
        <Upload class="h-4 w-4 mr-2" />
        Import
      </Button>
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
      <Button variant="outline">
        <Filter class="h-4 w-4 mr-2" />
        More Filters
      </Button>
    </div>
  </Card>

  <!-- Leads List -->
  <div class="space-y-4">
    {#each mockLeads as lead}
      <Card class="p-6">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-4 mb-2">
              <h3 class="text-lg font-semibold">{lead.name}</h3>
              <Badge variant="outline" class={`${getStatusColor(lead.status)} border-0`}>
                {lead.status}
              </Badge>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
              <div>
                <span class="font-medium">Company:</span> {lead.company}
              </div>
              <div>
                <span class="font-medium">Title:</span> {lead.title}
              </div>
              <div>
                <span class="font-medium">Last Activity:</span> {formatDate(lead.lastActivity)}
              </div>
              <div>
                <span class="font-medium">Assigned to:</span> {lead.assignedRep}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <!-- Lead Score -->
            <div class="text-center">
              <div class="text-sm text-muted-foreground mb-1">Score</div>
              <div class="flex items-center gap-2">
                <div class="w-12 h-2 rounded-full bg-muted">
                  <div
                    class={`h-full rounded-full ${getScoreColor(lead.leadScore)}`}
                    style={`width: ${lead.leadScore}%`}
                  ></div>
                </div>
                <span class="text-sm font-medium">{lead.leadScore}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <Button variant="outline" size="sm">
                <Phone class="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button variant="outline" size="sm">
                <Mail class="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button variant="outline" size="sm">
                <Calendar class="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>
        </div>

        <!-- AI Insights -->
        <div class="mt-4 p-4 bg-primary/5 rounded-lg">
          <div class="flex items-start gap-2">
            <Sparkles class="h-4 w-4 text-primary mt-0.5" />
            <div class="text-sm">
              <p class="font-medium text-primary">AI Insight:</p>
              <p class="text-muted-foreground">High engagement with pricing page suggests strong purchase intent. Recommended action: Schedule product demo.</p>
            </div>
          </div>
        </div>
      </Card>
    {/each}
  </div>
</div>