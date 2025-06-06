<script lang="ts">
   import { page } from '$app/state';
  import { auth } from '$lib/stores/auth.svelte';
  import { userStore } from '$lib/stores/user.svelte';
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import Menu from '@lucide/svelte/icons/menu';
  import Search from '@lucide/svelte/icons/search';
  import ThemeToggle from '$lib/components/theme-toggle.svelte';

  import Bell from '@lucide/svelte/icons/bell';
  import User from '@lucide/svelte/icons/user';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';


import Home from '@lucide/svelte/icons/home';
import Users from '@lucide/svelte/icons/users';
import GitBranch from '@lucide/svelte/icons/git-branch';
import ChartBar from '@lucide/svelte/icons/chart-bar';
import UserCheck from '@lucide/svelte/icons/user-check';
import Plug from '@lucide/svelte/icons/plug';
import Settings from '@lucide/svelte/icons/settings';

  
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Leads', href: '/dashboard/leads', icon: Users },
  { name: 'Pipeline', href: '/dashboard/pipeline', icon: GitBranch },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBar },
  { name: 'Team', href: '/dashboard/team', icon: UserCheck },
  { name: 'Integrations', href: '/dashboard/integrations', icon: Plug },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings }
];

  $effect(() => {
    if (!$auth.isAuthenticated && !$auth.loading) {
      goto('/login');
    }
  });


  async function signOut() {
    await auth.signOut();
    goto('/login');
  }
</script>
<header
	class="h-(--header-height) group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) flex shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear"
>
	<div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
		<Sidebar.Trigger class="-ml-1" />
		<Separator orientation="vertical" class="mx-2 data-[orientation=vertical]:h-4" />
		
        <!-- Breadcrumbs -->
        <div class="px-4 py-2 bg-background/50">
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <a href="/dashboard" class="text-base font-medium hover:text-foreground">Dashboard</a>
            {#if page.url.pathname !== '/dashboard'}
              <ChevronRight class="h-4 w-4" />
              <span class="text-foreground">
                {navigation.find(item => item.href === page.url.pathname)?.name || 'Page'}
              </span>
            {/if}
          </div>
        </div>
		<div class="ml-auto flex items-center gap-2">
		            <div class="flex items-center gap-4">

            <!-- Search -->
            <div class="hidden md:block">
              <div class="relative">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                <ThemeToggle/>

            <!-- Notifications -->
            <Button variant="ghost" size="icon">
              <Bell class="h-5 w-5" />
              <span class="sr-only">Notifications</span>
            </Button>

            <!-- User Menu -->
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button variant="ghost" size="icon">
                  <User class="h-5 w-5" />
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
	</div>
</header>
