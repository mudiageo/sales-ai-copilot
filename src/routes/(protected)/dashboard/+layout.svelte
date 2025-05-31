<script lang="ts">
  import { auth } from '$lib/stores/auth.svelte';
  import { goto } from '$app/navigation';

  $effect(() => {
    if (!$auth.isAuthenticated && !$auth.loading) {
      goto('/login');
    }
  });
</script>

<div class="min-h-screen bg-background">
  <slot />
</div>