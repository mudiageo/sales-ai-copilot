<script lang="ts">
  import { page } from '$app/stores';
  import { auth } from '$lib/stores/auth.svelte';
  import { userStore } from '$lib/stores/user.svelte';
  import { goto } from '$app/navigation';
  import * as Sheet from '$lib/components/ui/sheet';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { Button } from '$lib/components/ui/button';
  import { Separator } from '$lib/components/ui/separator';

  let isOpen = $state(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'i-lucide-home' },
    { name: 'Leads', href: '/dashboard/leads', icon: 'i-lucide-users' },
    { name: 'Pipeline', href: '/dashboard/pipeline', icon: 'i-lucide-git-branch' },
    { name: 'Analytics', href: '/dashboard/analytics', icon: 'i-lucide-bar-chart-2' },
    { name: 'Team', href: '/dashboard/team', icon: 'i-lucide-users-2' },
    { name: 'Integrations', href: '/dashboard/integrations', icon: 'i-lucide-plug' },
    { name: 'Settings', href: '/dashboard/settings', icon: 'i-lucide-settings' }
  ];

  $effect(() => {
    if (!$auth.isAuthenticated && !$auth.loading) {
      goto('/login');
    }
  });

  function toggleTheme() {
    userStore.updatePreferences({
      theme: $userStore.preferences.theme === 'light' ? 'dark' : 'light'
    });
    document.documentElement.classList.toggle('dark');
  }

  async function signOut() {
    await auth.signOut();
    goto('/login');
  }
</script>

<div class="min-h-screen bg-background">
  <!-- Mobile Navigation -->
  <Sheet.Root bind:open={isOpen}>
    <Sheet.Trigger>
      <Button variant="ghost" size="icon" class="md:hidden">
        <span class="i-lucide-menu h-6 w-6"></span>
        <span class="sr-only">Toggle Menu</span>
      </Button>
    </Sheet.Trigger>
    <Sheet.Content side="left" class="w-[300px] sm:w-[400px]">
      <nav class="flex flex-col gap-4">
        {#each navigation as item}
          <a
            href={item.href}
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md hover:bg-accent"
            class:text-primary={$page.url.pathname === item.href}
          >
            <span class={`${item.icon} h-5 w-5`}></span>
            {item.name}
          </a>
        {/each}
      </nav>
    </Sheet.Content>
  </Sheet.Root>

  <!-- Desktop Layout -->
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <aside class="hidden md:flex md:w-64 md:flex-col">
      <div class="flex flex-col flex-grow pt-5 bg-card border-r">
        <div class="flex items-center flex-shrink-0 px-4">
          <span class="text-2xl font-bold">AI Sales Copilot</span>
        </div>
        <div class="flex-grow flex flex-col mt-5">
          <nav class="flex-1 px-2 space-y-1">
            {#each navigation as item}
              <a
                href={item.href}
                class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md hover:bg-accent"
                class:text-primary={$page.url.pathname === item.href}
              >
                <span class={`${item.icon} h-5 w-5`}></span>
                {item.name}
              </a>
            {/each}
          </nav>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex flex-col flex-1 overflow-hidden">
      <!-- Top Navigation -->
      <header class="bg-card border-b">
        <div class="flex items-center justify-between h-16 px-4">
          <div class="flex items-center gap-4">
            <Button variant="ghost" size="icon" class="md:hidden" onclick={() => isOpen = true}>
              <span class="i-lucide-menu h-6 w-6"></span>
              <span class="sr-only">Toggle Menu</span>
            </Button>

            <!-- Search -->
            <div class="hidden md:block">
              <div class="relative">
                <span class="i-lucide-search absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"></span>
                <input
                  type="search"
                  placeholder="Search..."
                  class="w-64 pl-10 pr-4 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <!-- Theme Toggle -->
            <Button variant="ghost" size="icon" onclick={toggleTheme}>
              {#if $userStore.preferences.theme === 'dark'}
                <span class="i-lucide-sun h-5 w-5"></span>
              {:else}
                <span class="i-lucide-moon h-5 w-5"></span>
              {/if}
              <span class="sr-only">Toggle Theme</span>
            </Button>

            <!-- Notifications -->
            <Button variant="ghost" size="icon">
              <span class="i-lucide-bell h-5 w-5"></span>
              <span class="sr-only">Notifications</span>
            </Button>

            <!-- User Menu -->
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button variant="ghost" size="icon">
                  <span class="i-lucide-user h-5 w-5"></span>
                  <span class="sr-only">User Menu</span>
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Label>My Account</DropdownMenu.Label>
                <DropdownMenu.Separator />
                <DropdownMenu.Item>Profile</DropdownMenu.Item>
                <DropdownMenu.Item>Settings</DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item onclick={signOut}>Sign out</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </div>

        <!-- Breadcrumbs -->
        <div class="px-4 py-2 bg-background/50">
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <a href="/dashboard" class="hover:text-foreground">Dashboard</a>
            {#if $page.url.pathname !== '/dashboard'}
              <span class="i-lucide-chevron-right h-4 w-4"></span>
              <span class="text-foreground">
                {navigation.find(item => item.href === $page.url.pathname)?.name || 'Page'}
              </span>
            {/if}
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</div>