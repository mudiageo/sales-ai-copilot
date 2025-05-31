<script lang="ts">
  import { auth } from '$lib/stores/auth.svelte';
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-8">Dashboard</h1>
  
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div class="p-6 bg-card rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4">Sales Overview</h2>
      <!-- Add sales metrics components here -->
    </div>
    
    <div class="p-6 bg-card rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4">AI Insights</h2>
      <!-- Add AI insights components here -->
    </div>
    
    <div class="p-6 bg-card rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4">Recent Activity</h2>
      <!-- Add activity feed component here -->
    </div>
  </div>
</div>