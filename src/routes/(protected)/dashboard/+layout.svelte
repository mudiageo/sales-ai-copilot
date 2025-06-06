<script lang="ts">
  import { page } from '$app/state';
  import { auth } from '$lib/stores/auth.svelte';
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import AppSidebar from ".//app-sidebar.svelte";
	import SiteHeader from ".//site-header.svelte";
	
import { ModeWatcher } from "mode-watcher";
  let { children } = $props();
</script>
 
<ModeWatcher />

<Sidebar.Provider
	style="--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 12);"
>
	<AppSidebar variant="inset" />
	<Sidebar.Inset>
		<SiteHeader />
      <!-- Page Content -->
		<div class="flex flex-1 flex-col">
		  	<div class="@container/main flex flex-1 flex-col gap-2">
		  	 <div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
        {@render children?.()}
		</div>
		</div>
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
     