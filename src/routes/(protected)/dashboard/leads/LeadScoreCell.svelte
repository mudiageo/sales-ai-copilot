<script lang="ts">
  import type { Lead } from './schemas.js';
  
  let { lead }: { lead: Lead } = $props();
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };
</script>

<div class="flex items-center gap-2">
  <div class="w-12 h-2 rounded-full bg-muted">
    <div
      class={`h-full rounded-full ${getScoreColor(lead.leadScore)}`}
      style={`width: ${lead.leadScore}%`}
    ></div>
  </div>
  <span class="text-sm font-medium">{lead.leadScore}</span>
</div>