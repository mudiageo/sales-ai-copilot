<script lang="ts" module>

</script>

<script lang="ts">
  import type { ColumnDef } from "@tanstack/table-core";
  import type { Lead } from './schemas.js';
  import { renderComponent, renderSnippet } from "$lib/components/ui/data-table/index.js";
  import { createRawSnippet } from "svelte";
  import DataTableCheckbox from "$lib/components/data-table-checkbox.svelte";
  import LeadScoreCell from './LeadScoreCell.svelte';
  import LeadStatusCell from './LeadStatusCell.svelte';

  import {
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type ColumnFiltersState,
    type PaginationState,
    type RowSelectionState,
    type SortingState,
    type VisibilityState,
  } from "@tanstack/table-core";
  import { createSvelteTable } from "$lib/components/ui/data-table/data-table.svelte.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { FlexRender } from "$lib/components/ui/data-table/index.js";
  import BulkActionsToolbar from './BulkActionsToolbar.svelte';
  import { toast } from "svelte-sonner";
  import LayoutColumnsIcon from "@tabler/icons-svelte/icons/layout-columns";
  import ChevronDownIcon from "@tabler/icons-svelte/icons/chevron-down";
  import ChevronsLeftIcon from "@tabler/icons-svelte/icons/chevrons-left";
  import ChevronLeftIcon from "@tabler/icons-svelte/icons/chevron-left";
  import ChevronRightIcon from "@tabler/icons-svelte/icons/chevron-right";
  import ChevronsRightIcon from "@tabler/icons-svelte/icons/chevrons-right";
  import DotsVerticalIcon from "@tabler/icons-svelte/icons/dots-vertical";
  import PhoneIcon from "@tabler/icons-svelte/icons/phone";
  import MailIcon from "@tabler/icons-svelte/icons/mail";
  import CalendarIcon from "@tabler/icons-svelte/icons/calendar";
  import EyeIcon from "@tabler/icons-svelte/icons/eye";

  let { 
    data, 
    onShowLeadDetails 
  }: { 
    data: Lead[]; 
    onShowLeadDetails: (lead: Lead) => void;
  } = $props();

  export const columns: ColumnDef<Lead>[] = [
    {
      id: "select",
      header: ({ table }) =>
      renderComponent(DataTableCheckbox, {
        checked: table.getIsAllPageRowsSelected(),
        indeterminate:
            table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
          onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
          "aria-label": "Select all",
        }),
      cell: ({ row }) =>
        renderComponent(DataTableCheckbox, {
          checked: row.getIsSelected(),
          onCheckedChange: (value) => row.toggleSelected(!!value),
          "aria-label": "Select row",
        }),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Name",
        cell: ({ row }) => renderSnippet(LeadNameCell, { lead: row.original, onShowLeadDetails }),
      },
    {
      accessorKey: "company",
      header: "Company",
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "leadScore",
      header: "Lead Score",
      cell: ({ row }) => renderComponent(LeadScoreCell, { lead: row.original }),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => renderComponent(LeadStatusCell, { lead: row.original }),
    },
    {
      accessorKey: "lastActivity",
      header: "Last Activity",
      cell: ({ row }) => renderSnippet(LastActivityCell, { lead: row.original }),
    },
    {
      accessorKey: "assignedRep",
      header: "Assigned Rep",
    },
    {
      id: "actions",
      cell: ({ row }) => renderSnippet(LeadActionsCell, { lead: row.original, onShowLeadDetails }),
    },
  ];
  let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
  let sorting = $state<SortingState>([]);
  let columnFilters = $state<ColumnFiltersState>([]);
  let rowSelection = $state<RowSelectionState>({});
  let columnVisibility = $state<VisibilityState>({});

  const table = createSvelteTable({
    get data() {
      return data;
    },
    columns,
    state: {
      get pagination() {
        return pagination;
      },
      get sorting() {
        return sorting;
      },
      get columnVisibility() {
        return columnVisibility;
      },
      get rowSelection() {
        return rowSelection;
      },
      get columnFilters() {
        return columnFilters;
      },
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        pagination = updater(pagination);
      } else {
        pagination = updater;
      }
    },
    onSortingChange: (updater) => {
      if (typeof updater === "function") {
        sorting = updater(sorting);
      } else {
        sorting = updater;
      }
    },
    onColumnFiltersChange: (updater) => {
      if (typeof updater === "function") {
        columnFilters = updater(columnFilters);
      } else {
        columnFilters = updater;
      }
    },
    onColumnVisibilityChange: (updater) => {
      if (typeof updater === "function") {
        columnVisibility = updater(columnVisibility);
      } else {
        columnVisibility = updater;
      }
    },
    onRowSelectionChange: (updater) => {
      if (typeof updater === "function") {
        rowSelection = updater(rowSelection);
      } else {
        rowSelection = updater;
      }
    },
  });

  // Get selected leads
  let selectedLeads = $derived(
    table.getSelectedRowModel().rows.map(row => row.original)
  );

  function clearSelection() {
    table.resetRowSelection();
  }

  function handleBulkAction(action: string, actionData?: any) {
    const selectedCount = selectedLeads.length;
    
    switch (action) {
      case 'assign':
        toast.success(`Assigned ${selectedCount} lead${selectedCount === 1 ? '' : 's'} to ${actionData.rep}`);
        break;
      case 'status':
        toast.success(`Updated status of ${selectedCount} lead${selectedCount === 1 ? '' : 's'} to ${actionData.status}`);
        break;
      case 'tag':
        toast.success(`Added tag "${actionData.tag}" to ${selectedCount} lead${selectedCount === 1 ? '' : 's'}`);
        break;
      case 'export':
        // Simulate export
        const csvContent = generateCSV(selectedLeads);
        downloadCSV(csvContent, 'selected-leads.csv');
        toast.success(`Exported ${selectedCount} lead${selectedCount === 1 ? '' : 's'}`);
        break;
      case 'delete':
        toast.success(`Deleted ${selectedCount} lead${selectedCount === 1 ? '' : 's'}`);
        break;
    }
    
    // Clear selection after action
    clearSelection();
  }

  function generateCSV(leads: Lead[]): string {
    const headers = ['ID', 'Name', 'Company', 'Title', 'Lead Score', 'Status', 'Last Activity', 'Assigned Rep'];
    const rows = leads.map(lead => [
      lead.id,
      lead.name,
      lead.company,
      lead.title,
      lead.leadScore.toString(),
      lead.status,
      new Date(lead.lastActivity).toLocaleDateString(),
      lead.assignedRep
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  function downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
</script>

<div class="space-y-4">
  <!-- Bulk Actions Toolbar -->
  <BulkActionsToolbar 
    {selectedLeads}
    onClearSelection={clearSelection}
    onBulkAction={handleBulkAction}
  />

  <!-- Table Controls -->
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <Input
        placeholder="Search leads..."
        value={table.getColumn("name")?.getFilterValue() ?? ""}
        onInput={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
        class="max-w-sm"
      />
    </div>
    
    <div class="flex items-center gap-2">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <Button variant="outline" size="sm" {...props}>
              <LayoutColumnsIcon class="h-4 w-4 mr-2" />
              Columns
              <ChevronDownIcon class="h-4 w-4 ml-2" />
            </Button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" class="w-56">
          {#each table
            .getAllColumns()
            .filter((col) => typeof col.accessorFn !== "undefined" && col.getCanHide()) as column (column.id)}
            <DropdownMenu.CheckboxItem
              class="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {column.id}
            </DropdownMenu.CheckboxItem>
          {/each}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  </div>

  <!-- Data Table -->
  <div class="rounded-md border">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head colspan={header.colSpan}>
                {#if !header.isPlaceholder}
                  <FlexRender
                    content={header.column.columnDef.header}
                    context={header.getContext()}
                  />
                {/if}
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#if table.getRowModel().rows?.length}
          {#each table.getRowModel().rows as row (row.id)}
            <Table.Row data-state={row.getIsSelected() && "selected"}>
              {#each row.getVisibleCells() as cell (cell.id)}
                <Table.Cell>
                  <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
                </Table.Cell>
              {/each}
            </Table.Row>
          {/each}
        {:else}
          <Table.Row>
            <Table.Cell colspan={columns.length} class="h-24 text-center">
              No results.
            </Table.Cell>
          </Table.Row>
        {/if}
      </Table.Body>
    </Table.Root>
  </div>

  <!-- Pagination -->
  <div class="flex items-center justify-between px-2">
    <div class="flex-1 text-sm text-muted-foreground">
      {table.getFilteredSelectedRowModel().rows.length} of{" "}
      {table.getFilteredRowModel().rows.length} row(s) selected.
    </div>
    <div class="flex items-center space-x-6 lg:space-x-8">
      <div class="flex items-center space-x-2">
        <p class="text-sm font-medium">Rows per page</p>
        <Select.Root
          type="single"
          bind:value={
            () => `${table.getState().pagination.pageSize}`,
            (v) => table.setPageSize(Number(v))
          }
        >
          <Select.Trigger class="h-8 w-[70px]">
            {table.getState().pagination.pageSize}
          </Select.Trigger>
          <Select.Content side="top">
            {#each [10, 20, 30, 40, 50] as pageSize (pageSize)}
              <Select.Item value={pageSize.toString()}>
                {pageSize}
              </Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>
      <div class="flex w-[100px] items-center justify-center text-sm font-medium">
        Page {table.getState().pagination.pageIndex + 1} of{" "}
        {table.getPageCount()}
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          class="hidden h-8 w-8 p-0 lg:flex"
          onclick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <span class="sr-only">Go to first page</span>
          <ChevronsLeftIcon class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          class="h-8 w-8 p-0"
          onclick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <span class="sr-only">Go to previous page</span>
          <ChevronLeftIcon class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          class="h-8 w-8 p-0"
          onclick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <span class="sr-only">Go to next page</span>
          <ChevronRightIcon class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          class="hidden h-8 w-8 p-0 lg:flex"
          onclick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <span class="sr-only">Go to last page</span>
          <ChevronsRightIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</div>

{#snippet LeadNameCell({ lead, onShowLeadDetails }: { lead: Lead })}
  <Button
    variant="link"
    class="p-0 h-auto font-medium text-left justify-start"
    onclick={() => onShowLeadDetails(lead)}
  >
    {lead.name}
  </Button>
{/snippet}

{#snippet LastActivityCell({ lead }: { lead: Lead })}
  <span class="text-sm text-muted-foreground">
    {new Date(lead.lastActivity).toLocaleDateString()}
  </span>
{/snippet}

{#snippet LeadActionsCell({ lead, onShowLeadDetails }: { lead: Lead })}
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      {#snippet child({ props })}
        <Button variant="ghost" size="icon" {...props}>
          <DotsVerticalIcon class="h-4 w-4" />
          <span class="sr-only">Open menu</span>
        </Button>
      {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="end">
      <DropdownMenu.Item onclick={() => onShowLeadDetails(lead)}>
        <EyeIcon class="h-4 w-4 mr-2" />
        View Details
      </DropdownMenu.Item>
      <DropdownMenu.Item>
        <PhoneIcon class="h-4 w-4 mr-2" />
        Call
      </DropdownMenu.Item>
      <DropdownMenu.Item>
        <MailIcon class="h-4 w-4 mr-2" />
        Email
      </DropdownMenu.Item>
      <DropdownMenu.Item>
        <CalendarIcon class="h-4 w-4 mr-2" />
        Schedule Meeting
      </DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item>Edit Lead</DropdownMenu.Item>
      <DropdownMenu.Item class="text-destructive">
        Delete Lead
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
{/snippet}
