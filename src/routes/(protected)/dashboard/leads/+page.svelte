<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Select } from '$lib/components/ui/select';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as Table from '$lib/components/ui/table';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { Card } from '$lib/components/ui/card';
  import { createTable, type TableOptions, type ColumnDef } from '@tanstack/svelte-table';

  // Mock data
  const mockLeads = Array.from({ length: 50 }, (_, i) => ({
    id: `LEAD-${i + 1}`,
    name: `Contact ${i + 1}`,
    company: `Company ${i + 1}`,
    title: ['CEO', 'CTO', 'CFO', 'VP Sales', 'Director'][Math.floor(Math.random() * 5)],
    leadScore: Math.floor(Math.random() * 100),
    status: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation'][Math.floor(Math.random() * 5)],
    lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    assignedRep: ['Sarah Chen', 'Michael Rodriguez', 'Emily Taylor', 'David Kim'][Math.floor(Math.random() * 4)]
  }));

  // Table configuration
  const columns: ColumnDef[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
        />
      )
    },
    {
      accessorKey: 'name',
      header: 'Name'
    },
    {
      accessorKey: 'company',
      header: 'Company'
    },
    {
      accessorKey: 'title',
      header: 'Title'
    },
    {
      accessorKey: 'leadScore',
      header: 'Lead Score',
      cell: ({ row }) => (
        <div class="flex items-center gap-2">
          <div class="w-12 h-2 rounded-full bg-primary/20">
            <div
              class="h-full rounded-full bg-primary"
              style={`width: ${row.original.leadScore}%`}
            ></div>
          </div>
          <span>{row.original.leadScore}</span>
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span class={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
          ${row.original.status === 'New' ? 'bg-blue-100 text-blue-800' :
          row.original.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
          row.original.status === 'Qualified' ? 'bg-green-100 text-green-800' :
          row.original.status === 'Proposal' ? 'bg-purple-100 text-purple-800' :
          'bg-gray-100 text-gray-800'}`}>
          {row.original.status}
        </span>
      )
    },
    {
      accessorKey: 'lastActivity',
      header: 'Last Activity',
      cell: ({ row }) => new Date(row.original.lastActivity).toLocaleDateString()
    },
    {
      accessorKey: 'assignedRep',
      header: 'Assigned Rep'
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="ghost" size="icon">
              <span class="i-lucide-more-vertical h-4 w-4"></span>
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item onclick={() => showLeadDetails(row.original)}>
              View Details
            </DropdownMenu.Item>
            <DropdownMenu.Item>Edit Lead</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item class="text-destructive">
              Delete Lead
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      )
    }
  ];

  const tableOptions = {
    data: mockLeads,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    enableMultiRowSelection: true
  };

  const table = createTable(tableOptions);

  // State
  let searchQuery = '';
  let statusFilter = '';
  let dateFilter = '';
  let selectedLead = null;
  let showLeadModal = false;

  // Filters
  $: filteredLeads = mockLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function showLeadDetails(lead) {
    selectedLead = lead;
    showLeadModal = true;
  }

  // Bulk actions
  function handleBulkAction(action: string) {
    const selectedRows = table.getSelectedRowModel().rows;
    console.log(`Performing ${action} on`, selectedRows);
    // Implement bulk actions
  }

  // Import functionality
  function handleFileImport(event) {
    const file = event.target.files[0];
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
          <span class="i-lucide-upload h-4 w-4 mr-2"></span>
          Import Leads
        </Button>
      </label>
      <Button>
        <span class="i-lucide-plus h-4 w-4 mr-2"></span>
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
      <Select bind:value={statusFilter} class="w-[200px]">
        <option value="">All Statuses</option>
        <option value="New">New</option>
        <option value="Contacted">Contacted</option>
        <option value="Qualified">Qualified</option>
        <option value="Proposal">Proposal</option>
        <option value="Negotiation">Negotiation</option>
      </Select>
      <Select bind:value={dateFilter} class="w-[200px]">
        <option value="">All Time</option>
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
      </Select>
      <Button variant="outline">
        <span class="i-lucide-filter h-4 w-4 mr-2"></span>
        More Filters
      </Button>
    </div>
  </Card>

  <!-- Bulk Actions -->
  <div class="flex items-center gap-4">
    <Button
      variant="outline"
      disabled={!table.getSelectedRowModel().rows.length}
      onclick={() => handleBulkAction('assign')}
    >
      Assign to Rep
    </Button>
    <Button
      variant="outline"
      disabled={!table.getSelectedRowModel().rows.length}
      onclick={() => handleBulkAction('tag')}
    >
      Add Tags
    </Button>
    <Button
      variant="outline"
      disabled={!table.getSelectedRowModel().rows.length}
      onclick={() => handleBulkAction('export')}
    >
      Export Selected
    </Button>
    <Button
      variant="destructive"
      disabled={!table.getSelectedRowModel().rows.length}
      onclick={() => handleBulkAction('delete')}
    >
      Delete Selected
    </Button>
  </div>

  <!-- Leads Table -->
  <div class="rounded-md border">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup}
          <Table.Row>
            {#each headerGroup.headers as header}
              <Table.Head>
                {#if header.isPlaceholder}
                  <span></span>
                {:else}
                  {@html header.column.columnDef.header?.(header) ?? header.column.columnDef.header}
                {/if}
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#each table.getRowModel().rows as row}
          <Table.Row>
            {#each row.getVisibleCells() as cell}
              <Table.Cell>
                {@html cell.column.columnDef.cell?.(cell) ?? cell.getValue()}
              </Table.Cell>
            {/each}
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>

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
                  <span class="i-lucide-sparkles h-5 w-5 text-primary mt-0.5"></span>
                  <p class="text-sm">High engagement with pricing page suggests strong purchase intent</p>
                </div>
                <div class="flex items-start gap-2">
                  <span class="i-lucide-sparkles h-5 w-5 text-primary mt-0.5"></span>
                  <p class="text-sm">Similar profile to recently converted enterprise customers</p>
                </div>
                <div class="flex items-start gap-2">
                  <span class="i-lucide-sparkles h-5 w-5 text-primary mt-0.5"></span>
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