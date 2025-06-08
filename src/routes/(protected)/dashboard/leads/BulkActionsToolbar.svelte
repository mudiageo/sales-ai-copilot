<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import * as Select from '$lib/components/ui/select';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as AlertDialog from '$lib/components/ui/alert-dialog';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import type { Lead } from './schemas.js';
  import UserCheck from "@lucide/svelte/icons/user-check";
  import Tag from "@lucide/svelte/icons/tag";
  import Download from "@lucide/svelte/icons/download";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import RefreshCw from "@lucide/svelte/icons/refresh-cw";
  import X from "@lucide/svelte/icons/x";

  let { 
    selectedLeads,
    onClearSelection,
    onBulkAction 
  }: { 
    selectedLeads: Lead[];
    onClearSelection: () => void;
    onBulkAction: (action: string, data?: any) => void;
  } = $props();

  // Dialog states
  let showAssignDialog = $state(false);
  let showTagDialog = $state(false);
  let showStatusDialog = $state(false);
  let showDeleteDialog = $state(false);

  // Form states
  let selectedRep = $state('');
  let newTag = $state('');
  let newStatus = $state('');

  const salesReps = [
    'Sarah Chen',
    'Michael Rodriguez', 
    'Emily Taylor',
    'David Kim'
  ];

  const statuses = [
    'New',
    'Contacted',
    'Qualified',
    'Proposal',
    'Negotiation'
  ];

  function handleAssign() {
    if (selectedRep) {
      onBulkAction('assign', { rep: selectedRep });
      showAssignDialog = false;
      selectedRep = '';
    }
  }

  function handleAddTag() {
    if (newTag.trim()) {
      onBulkAction('tag', { tag: newTag.trim() });
      showTagDialog = false;
      newTag = '';
    }
  }

  function handleUpdateStatus() {
    if (newStatus) {
      onBulkAction('status', { status: newStatus });
      showStatusDialog = false;
      newStatus = '';
    }
  }

  function handleDelete() {
    onBulkAction('delete');
    showDeleteDialog = false;
  }

  function handleExport() {
    onBulkAction('export');
  }
</script>

{#if selectedLeads.length > 0}
  <div class="flex items-center justify-between p-4 bg-muted/50 border rounded-lg">
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium">
          {selectedLeads.length} lead{selectedLeads.length === 1 ? '' : 's'} selected
        </span>
        <Button variant="ghost" size="sm" onclick={onClearSelection}>
          <X class="h-4 w-4" />
        </Button>
      </div>

      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" onclick={() => showAssignDialog = true}>
          <UserCheck class="h-4 w-4 mr-2" />
          Assign to Rep
        </Button>

        <Button variant="outline" size="sm" onclick={() => showStatusDialog = true}>
          <RefreshCw class="h-4 w-4 mr-2" />
          Update Status
        </Button>

        <Button variant="outline" size="sm" onclick={() => showTagDialog = true}>
          <Tag class="h-4 w-4 mr-2" />
          Add Tag
        </Button>

        <Button variant="outline" size="sm" onclick={handleExport}>
          <Download class="h-4 w-4 mr-2" />
          Export
        </Button>

        <Button variant="destructive" size="sm" onclick={() => showDeleteDialog = true}>
          <Trash2 class="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  </div>

  <!-- Assign to Rep Dialog -->
  <Dialog.Root bind:open={showAssignDialog}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Assign to Sales Rep</Dialog.Title>
        <Dialog.Description>
          Assign {selectedLeads.length} selected lead{selectedLeads.length === 1 ? '' : 's'} to a sales representative.
        </Dialog.Description>
      </Dialog.Header>

      <div class="space-y-4">
        <div>
          <Label for="rep-select">Sales Representative</Label>
          <Select.Root bind:value={selectedRep}>
            <Select.Trigger id="rep-select">
              {selectedRep || "Select a sales rep"}
            </Select.Trigger>
            <Select.Content>
              {#each salesReps as rep}
                <Select.Item value={rep}>{rep}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>
      </div>

      <Dialog.Footer>
        <Button variant="outline" onclick={() => showAssignDialog = false}>
          Cancel
        </Button>
        <Button onclick={handleAssign} disabled={!selectedRep}>
          Assign Leads
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>

  <!-- Update Status Dialog -->
  <Dialog.Root bind:open={showStatusDialog}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Update Status</Dialog.Title>
        <Dialog.Description>
          Update the status of {selectedLeads.length} selected lead{selectedLeads.length === 1 ? '' : 's'}.
        </Dialog.Description>
      </Dialog.Header>

      <div class="space-y-4">
        <div>
          <Label for="status-select">New Status</Label>
          <Select.Root bind:value={newStatus}>
            <Select.Trigger id="status-select">
              {newStatus || "Select a status"}
            </Select.Trigger>
            <Select.Content>
              {#each statuses as status}
                <Select.Item value={status}>{status}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>
      </div>

      <Dialog.Footer>
        <Button variant="outline" onclick={() => showStatusDialog = false}>
          Cancel
        </Button>
        <Button onclick={handleUpdateStatus} disabled={!newStatus}>
          Update Status
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>

  <!-- Add Tag Dialog -->
  <Dialog.Root bind:open={showTagDialog}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Add Tag</Dialog.Title>
        <Dialog.Description>
          Add a tag to {selectedLeads.length} selected lead{selectedLeads.length === 1 ? '' : 's'}.
        </Dialog.Description>
      </Dialog.Header>

      <div class="space-y-4">
        <div>
          <Label for="tag-input">Tag Name</Label>
          <Input
            id="tag-input"
            placeholder="Enter tag name..."
            bind:value={newTag}
          />
        </div>
      </div>

      <Dialog.Footer>
        <Button variant="outline" onclick={() => showTagDialog = false}>
          Cancel
        </Button>
        <Button onclick={handleAddTag} disabled={!newTag.trim()}>
          Add Tag
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>

  <!-- Delete Confirmation Dialog -->
  <AlertDialog.Root bind:open={showDeleteDialog}>
    <AlertDialog.Content>
      <AlertDialog.Header>
        <AlertDialog.Title>Delete Leads</AlertDialog.Title>
        <AlertDialog.Description>
          Are you sure you want to delete {selectedLeads.length} selected lead{selectedLeads.length === 1 ? '' : 's'}? 
          This action cannot be undone.
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <AlertDialog.Cancel onclick={() => showDeleteDialog = false}>
          Cancel
        </AlertDialog.Cancel>
        <AlertDialog.Action onclick={handleDelete}>
          Delete Leads
        </AlertDialog.Action>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
{/if}