<script lang="ts">
   import { page } from '$app/state';
  import { auth } from '$lib/stores/auth.svelte';
	import CameraIcon from "@tabler/icons-svelte/icons/camera";
	import ChartBarIcon from "@tabler/icons-svelte/icons/chart-bar";
	import DashboardIcon from "@tabler/icons-svelte/icons/dashboard";
	import DatabaseIcon from "@tabler/icons-svelte/icons/database";
	import FileAiIcon from "@tabler/icons-svelte/icons/file-ai";
	import FileDescriptionIcon from "@tabler/icons-svelte/icons/file-description";
	import FileWordIcon from "@tabler/icons-svelte/icons/file-word";
	import FolderIcon from "@tabler/icons-svelte/icons/folder";
	import HelpIcon from "@tabler/icons-svelte/icons/help";
	import InnerShadowTopIcon from "@tabler/icons-svelte/icons/inner-shadow-top";
	import ListDetailsIcon from "@tabler/icons-svelte/icons/list-details";
	import ReportIcon from "@tabler/icons-svelte/icons/report";
	import SearchIcon from "@tabler/icons-svelte/icons/search";
	import SettingsIcon from "@tabler/icons-svelte/icons/settings";
	import UsersIcon from "@tabler/icons-svelte/icons/users";
	import GitBranchIcon from "@tabler/icons-svelte/icons/git-branch";
	import PlugIcon from "@tabler/icons-svelte/icons/plug";
	import NavDocuments from "./nav-documents.svelte";
	import NavMain from "./nav-main.svelte";
	import NavSecondary from "./nav-secondary.svelte";
	import NavUser from "./nav-user.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import type { ComponentProps } from "svelte";
	

	const data = {
		user: {
			name: "shadcn",
			email: "m@example.com",
			avatar: "/avatars/shadcn.jpg",
		},
		navMain: [
			{
				title: "Dashboard",
				url: "/dashboard",
				icon: DashboardIcon,
			},
			{
				title: "Lifecycle",
				url: "#",
				icon: ListDetailsIcon,
			},
			{
			  title: 'Leads', 
			  url: '/dashboard/leads', 
			  icon: UsersIcon 
			},
      { 
        title: 'Pipeline', 
        url: '/dashboard/pipeline', 
        icon: GitBranchIcon 
      },
			{
				title: "Analytics",
				url: "/dashboard/analytics",
				icon: ChartBarIcon,
			},  
			{ 
			  title: 'Integrations', 
			  url: '/dashboard/integrations',
			  icon: PlugIcon
			},
			{
				title: "Projects",
				url: "#",
				icon: FolderIcon,
			},
			{
				title: "Team",
				url: "#",
				icon: UsersIcon,
			},
		],
		navClouds: [
			{
				title: "Capture",
				icon: CameraIcon,
				isActive: true,
				url: "#",
				items: [
					{
						title: "Active Proposals",
						url: "#",
					},
					{
						title: "Archived",
						url: "#",
					},
				],
			},
			{
				title: "Proposal",
				icon: FileDescriptionIcon,
				url: "#",
				items: [
					{
						title: "Active Proposals",
						url: "#",
					},
					{
						title: "Archived",
						url: "#",
					},
				],
			},
			{
				title: "Prompts",
				icon: FileAiIcon,
				url: "#",
				items: [
					{
						title: "Active Proposals",
						url: "#",
					},
					{
						title: "Archived",
						url: "#",
					},
				],
			},
		],
		navSecondary: [
			{
				title: "Settings",
				url: "/dashboard/settings",
				icon: SettingsIcon,
			},
			{
				title: "Get Help",
				url: "/dashboard/help",
				icon: HelpIcon,
			},
			{
				title: "Search",
				url: "#",
				icon: SearchIcon,
			},
		],
		documents: [
			{
				name: "Data Library",
				url: "#",
				icon: DatabaseIcon,
			},
			{
				name: "Reports",
				url: "#",
				icon: ReportIcon,
			},
			{
				name: "Word Assistant",
				url: "#",
				icon: FileWordIcon,
			},
		],
	};

	let { ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

  
<Sidebar.Root collapsible="offcanvas" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton class="data-[slot=sidebar-menu-button]:!p-1.5">
					{#snippet child({ props })}
						<a href="##" {...props}>
							<InnerShadowTopIcon class="!size-5" />
							<span class="text-base font-semibold">AI Sales Copilot Inc.</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={data.navMain} />
		<NavDocuments items={data.documents} />
		<NavSecondary items={data.navSecondary} class="mt-auto" />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser user={data.user} />
	</Sidebar.Footer>
</Sidebar.Root>
