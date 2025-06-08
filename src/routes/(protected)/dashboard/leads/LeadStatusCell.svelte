<script lang="ts">
  import { Badge } from '$lib/components/ui/badge';
  import type { Lead } from './schemas.js';
  
  let { lead }: { lead: Lead } = $props();
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'New':
        return 'default';
      case 'Contacted':
        return 'secondary';
      case 'Qualified':
        return 'outline';
      case 'Proposal':
        return 'default';
      case 'Negotiation':
        return 'default';
      default:
        return 'secondary';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'text-blue-700 bg-blue-100';
      case 'Contacted':
        return 'text-yellow-700 bg-yellow-100';
      case 'Qualified':
        return 'text-green-700 bg-green-100';
      case 'Proposal':
        return 'text-purple-700 bg-purple-100';
      case 'Negotiation':
        return 'text-orange-700 bg-orange-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };
</script>

<Badge variant="outline" class={`${getStatusColor(lead.status)} border-0`}>
  {lead.status}
</Badge>