<script lang="ts">
  import { auth } from '$lib/stores/auth.svelte';
  import { appStore } from '$lib/stores/app.svelte';
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-8">AI Sales Copilot Desktop</h1>
  
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div class="p-6 bg-card rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4">Voice Assistant</h2>
      <!-- Add voice assistant component here -->
    </div>
    
    <div class="p-6 bg-card rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4">Sales Tools</h2>
      <!-- Add sales tools component here -->
    </div>
  </div>
</div>