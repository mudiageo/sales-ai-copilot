<script lang="ts">
  import { page } from '$app/stores';
  import { userStore } from '$lib/stores/user.svelte';
  import { Button } from '$lib/components/ui/button';

  let isMenuOpen = $state(false);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];

  function toggleTheme() {
    userStore.updatePreferences({
      theme: $userStore.preferences.theme === 'light' ? 'dark' : 'light'
    });
    document.documentElement.classList.toggle('dark');
  }
</script>

<nav class="bg-background border-b border-border">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <div class="flex">
        <div class="flex-shrink-0 flex items-center">
          <a href="/" class="text-2xl font-bold text-primary">AI Sales Copilot</a>
        </div>
        <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
          {#each navigation as item}
            <a
              href={item.href}
              class="inline-flex items-center px-1 pt-1 text-sm font-medium {$page.url.pathname === item.href ? 'text-primary border-b-2 border-primary' : 'text-foreground hover:text-primary'}"
            >
              {item.name}
            </a>
          {/each}
        </div>
      </div>
      <div class="hidden sm:ml-6 sm:flex sm:items-center">
        <Button variant="ghost" size="icon" onclick={toggleTheme}>
          {#if $userStore.preferences.theme === 'dark'}
            <span class="i-lucide-sun h-5 w-5" />
          {:else}
            <span class="i-lucide-moon h-5 w-5" />
          {/if}
        </Button>
        <Button href="/dashboard" variant="default" class="ml-4">Dashboard</Button>
      </div>
      <div class="-mr-2 flex items-center sm:hidden">
        <Button
          variant="ghost"
          size="icon"
          onclick={() => (isMenuOpen = !isMenuOpen)}
          aria-expanded={isMenuOpen}
        >
          <span class="sr-only">Open main menu</span>
          {#if isMenuOpen}
            <span class="i-lucide-x h-6 w-6" />
          {:else}
            <span class="i-lucide-menu h-6 w-6" />
          {/if}
        </Button>
      </div>
    </div>
  </div>

  {#if isMenuOpen}
    <div class="sm:hidden">
      <div class="pt-2 pb-3 space-y-1">
        {#each navigation as item}
          <a
            href={item.href}
            class="block pl-3 pr-4 py-2 text-base font-medium {$page.url.pathname === item.href ? 'text-primary bg-primary/10' : 'text-foreground hover:text-primary hover:bg-primary/5'}"
          >
            {item.name}
          </a>
        {/each}
      </div>
      <div class="pt-4 pb-3 border-t border-border">
        <div class="flex items-center px-4">
          <Button variant="ghost" size="icon" onclick={toggleTheme}>
            {#if $userStore.preferences.theme === 'dark'}
              <span class="i-lucide-sun h-5 w-5" />
            {:else}
              <span class="i-lucide-moon h-5 w-5" />
            {/if}
          </Button>
          <Button href="/dashboard" variant="default" class="ml-4">Dashboard</Button>
        </div>
      </div>
    </div>
  {/if}
</nav>