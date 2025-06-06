<script lang="ts">
	import TrendingDownIcon from "@tabler/icons-svelte/icons/trending-down";
	import TrendingUpIcon from "@tabler/icons-svelte/icons/trending-up";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	
	  // Mock data
  const metrics = {
    totalLeads: 1247,
    conversionRate: 32.5,
    pipelineValue: 2500000,
    activitiesCompleted: 856,
    aiSuggestionsImplemented: 124
  };
</script>

<div
	class="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t lg:px-6"
>
	<Card.Root class="@container/card">
		<Card.Header>
			<Card.Description>Total Revenue</Card.Description>
			<Card.Title class="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
				$1,250.00
			</Card.Title>
			<Card.Action>
				<Badge variant="outline">
					<TrendingUpIcon />
					+12.5%
				</Badge>
			</Card.Action>
		</Card.Header>
		<Card.Footer class="flex-col items-start gap-1.5 text-sm">
			<div class="line-clamp-1 flex gap-2 font-medium">
				Trending up this month <TrendingUpIcon class="size-4" />
			</div>
			<div class="text-muted-foreground">Visitors for the last 6 months</div>
		</Card.Footer>
	</Card.Root>
	<Card.Root class="@container/card">
		<Card.Header>
			<Card.Description>New Customers</Card.Description>
			<Card.Title class="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
				1,234
			</Card.Title>
			<Card.Action>
				<Badge variant="outline">
					<TrendingDownIcon />
					-20%
				</Badge>
			</Card.Action>
		</Card.Header>
		<Card.Footer class="flex-col items-start gap-1.5 text-sm">
			<div class="line-clamp-1 flex gap-2 font-medium">
				Down 20% this period <TrendingDownIcon class="size-4" />
			</div>
			<div class="text-muted-foreground">Acquisition needs attention</div>
		</Card.Footer>
	</Card.Root>
	<Card.Root class="@container/card">
		<Card.Header>
			<Card.Description>Active Accounts</Card.Description>
			<Card.Title class="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
				45,678
			</Card.Title>
			<Card.Action>
				<Badge variant="outline">
					<TrendingUpIcon />
					+12.5%
				</Badge>
			</Card.Action>
		</Card.Header>
		<Card.Footer class="flex-col items-start gap-1.5 text-sm">
			<div class="line-clamp-1 flex gap-2 font-medium">
				Strong user retention <TrendingUpIcon class="size-4" />
			</div>
			<div class="text-muted-foreground">Engagement exceed targets</div>
		</Card.Footer>
	</Card.Root>
	<Card.Root class="@container/card">
		<Card.Header>
			<Card.Description>Growth Rate</Card.Description>
			<Card.Title class="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
				4.5%
			</Card.Title>
			<Card.Action>
				<Badge variant="outline">
					<TrendingUpIcon />
					+4.5%
				</Badge>
			</Card.Action>
		</Card.Header>
		<Card.Footer class="flex-col items-start gap-1.5 text-sm">
			<div class="line-clamp-1 flex gap-2 font-medium">
				Steady performance increase <TrendingUpIcon class="size-4" />
			</div>
			<div class="text-muted-foreground">Meets growth projections</div>
		</Card.Footer>
	</Card.Root>
	  <Card.Root class="p-6">
      <div class="flex flex-col">
        <span class="text-sm font-medium text-muted-foreground">Total Leads</span>
        <span class="text-2xl font-bold">{metrics.totalLeads}</span>
        <span class="text-sm text-primary mt-2">↑ 12% from last month</span>
      </div>
    </Card.Root>
    
    <Card.Root class="p-6">
      <div class="flex flex-col">
        <span class="text-sm font-medium text-muted-foreground">Conversion Rate</span>
        <span class="text-2xl font-bold">{metrics.conversionRate}%</span>
        <span class="text-sm text-primary mt-2">↑ 5% from last month</span>
      </div>
    </Card.Root>
    
    <Card.Root class="p-6">
      <div class="flex flex-col">
        <span class="text-sm font-medium text-muted-foreground">Pipeline Value</span>
        <span class="text-2xl font-bold">${(metrics.pipelineValue / 1000000).toFixed(1)}M</span>
        <span class="text-sm text-primary mt-2">↑ 18% from last month</span>
      </div>
    </Card.Root>
    
    <Card.Root class="p-6">
      <div class="flex flex-col">
        <span class="text-sm font-medium text-muted-foreground">Activities Completed</span>
        <span class="text-2xl font-bold">{metrics.activitiesCompleted}</span>
        <span class="text-sm text-primary mt-2">↑ 8% from last month</span>
      </div>
    </Card.Root>
    
    <Card.Root class="p-6">
      <div class="flex flex-col">
        <span class="text-sm font-medium text-muted-foreground">AI Suggestions Used</span>
        <span class="text-2xl font-bold">{metrics.aiSuggestionsImplemented}</span>
        <span class="text-sm text-primary mt-2">↑ 15% from last month</span>
      </div>
    </Card.Root>
</div>