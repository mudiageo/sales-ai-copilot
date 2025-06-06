<script lang="ts">
  import { onMount } from 'svelte';
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import SectionCards from "./section-cards.svelte";
	import ChartAreaInteractive from "./chart-area-interactive.svelte";
	import DataTable from "$lib/components/data-table.svelte";
	import TrendingUp from "@lucide/svelte/icons/trending-up"
	import Sparkles from "@lucide/svelte/icons/sparkles"
	import Mail from "@lucide/svelte/icons/mail"
	import Phone from "@lucide/svelte/icons/phone"
	import Calendar from "@lucide/svelte/icons/calendar"
	import UserPlus from "@lucide/svelte/icons/user-plus"
	import CheckCircle from "@lucide/svelte/icons/check-circle"
	import FileText from "@lucide/svelte/icons/file-text"
	import MoreVertical from "@lucide/svelte/icons/more-vertical"
	import data from "./data.js";
  import Chart from 'chart.js/auto';

  const recentActivity = [
    { type: 'lead', title: 'New lead: TechCorp', time: '5 minutes ago' },
    { type: 'call', title: 'Call completed with John Smith', time: '1 hour ago' },
    { type: 'email', title: 'Email sent to Sarah Johnson', time: '2 hours ago' },
    { type: 'deal', title: 'Deal won: InnovateX Solutions', time: '3 hours ago' },
    { type: 'task', title: 'Follow-up reminder created', time: '4 hours ago' }
  ];

  const salesReps = [
    { name: 'Sarah Chen', deals: 42, value: 850000 },
    { name: 'Michael Rodriguez', deals: 38, value: 720000 },
    { name: 'Emily Taylor', deals: 35, value: 680000 },
    { name: 'David Kim', deals: 31, value: 590000 }
  ];

  const upcomingTasks = [
    { title: 'Follow up with TechCorp', due: '2024-03-20', priority: 'high' },
    { title: 'Prepare proposal for InnovateX', due: '2024-03-21', priority: 'medium' },
    { title: 'Schedule demo with GrowthMax', due: '2024-03-22', priority: 'high' }
  ];

  const aiInsights = [
    'Follow up with leads who viewed pricing page',
    'Schedule demos with high-intent prospects',
    'Update proposal templates based on win/loss analysis',
    'Optimize email sequences for better engagement'
  ];

  let pipelineChart: Chart;
  let trendsChart: Chart;

  onMount(() => {
    // Pipeline Chart
    const pipelineCtx = document.getElementById('pipelineChart') as HTMLCanvasElement;
    pipelineChart = new Chart(pipelineCtx, {
      type: 'doughnut',
      data: {
        labels: ['Qualified', 'Meeting', 'Proposal', 'Negotiation', 'Closed'],
        datasets: [{
          data: [30, 25, 20, 15, 10],
          backgroundColor: [
            'rgb(var(--chart-1))',
            'rgb(var(--chart-2))',
            'rgb(var(--chart-3))',
            'rgb(var(--chart-4))',
            'rgb(var(--chart-5))'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });

    // Trends Chart
    const trendsCtx = document.getElementById('trendsChart') as HTMLCanvasElement;
    trendsChart = new Chart(trendsCtx, {
      type: 'line',
      data: {
        labels: Array.from({ length: 30 }, (_, i) => i + 1),
        datasets: [{
          label: 'Deals Won',
          data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 50) + 50),
          borderColor: 'rgb(var(--chart-1))',
          tension: 0.4
        }, {
          label: 'Pipeline Value',
          data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 100) + 100),
          borderColor: 'rgb(var(--chart-2))',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  });
</script>
		
					<SectionCards />
					<div class="px-4 lg:px-6">
						<ChartAreaInteractive />
					</div>
					<DataTable {data} />
				
	
<div class="space-y-8">

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Charts -->
    <Card class="p-6">
      <h2 class="text-lg font-semibold mb-4">Pipeline Overview</h2>
      <canvas id="pipelineChart"></canvas>
    </Card>

    <Card class="p-6">
      <h2 class="text-lg font-semibold mb-4">Performance Trends</h2>
      <canvas id="trendsChart"></canvas>
    </Card>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Recent Activity -->
    <Card class="p-6">
      <h2 class="text-lg font-semibold mb-4">Recent Activity</h2>
      <div class="space-y-4">
        {#each recentActivity as activity}
        {@const Icon = activity.type === 'lead' ? UserPlus : activity.type === 'call' ? Phone : activity.type === 'email' ? Mail : activity.type === 'deal' ? CheckCircle : Calendar}
          <div class="flex items-start gap-3"> 
            <Icon class="h-5 w-5 text-primary mt-0.5"/>
            <div>
              <p class="text-sm font-medium">{activity.title}</p>
              <p class="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        {/each}
      </div>
    </Card>

    <!-- Top Sales Reps -->
    <Card class="p-6">
      <h2 class="text-lg font-semibold mb-4">Top Performers</h2>
      <div class="space-y-4">
        {#each salesReps as rep}
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">{rep.name}</p>
              <p class="text-sm text-muted-foreground">{rep.deals} deals · ${(rep.value / 1000).toFixed(0)}k</p>
            </div>
            <div class="flex items-center gap-2">
              	<TrendingUp class="h-4 w-4 text-primary"/>
            </div>
          </div>
        {/each}
      </div>
    </Card>

    <!-- AI Insights -->
    <Card class="p-6">
      <h2 class="text-lg font-semibold mb-4">AI Recommendations</h2>
      <div class="space-y-4">
        {#each aiInsights as insight}
          <div class="flex items-start gap-3">
            <Sparkles class="h-5 w-5 text-primary mt-0.5" />
            <p class="text-sm">{insight}</p>
          </div>
        {/each}
      </div>
    </Card>
  </div>

  <!-- Quick Actions & Tasks -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <Card class="p-6">
      <h2 class="text-lg font-semibold mb-4">Quick Actions</h2>
      <div class="grid grid-cols-2 gap-4">
        <Button variant="outline" class="w-full">
          <UserPlus class="h-4 w-4 mr-2" />
          Add Lead
        </Button>
        <Button variant="outline" class="w-full">
          <Phone class=" h-4 w-4 mr-2" />
          Schedule Call
        </Button>
        <Button variant="outline" class="w-full">
          <Mail class="h-4 w-4 mr-2" />
          Send Email
        </Button>
        <Button variant="outline" class="w-full">
          <FileText class="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>
    </Card>

    <Card class="p-6">
      <h2 class="text-lg font-semibold mb-4">Upcoming Tasks</h2>
      <div class="space-y-4">
        {#each upcomingTasks as task}
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class={`size-2 rounded-full ${task.priority === 'high' ? 'bg-destructive' : 'bg-primary'}`}></span>
              <div>
                <p class="font-medium">{task.title}</p>
                <p class="text-sm text-muted-foreground">Due {task.due}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical class="h-4 w-4" />
            </Button>
          </div>
        {/each}
      </div>
    </Card>
  </div>
</div>

<style>
  :global(.dark) {
    --chart-1: 74 222 128;
    --chart-2: 96 165 250;
    --chart-3: 251 146 60;
    --chart-4: 167 139 250;
    --chart-5: 248 113 113;
  }

  :global(:not(.dark)) {
    --chart-1: 34 197 94;
    --chart-2: 59 130 246;
    --chart-3: 249 115 22;
    --chart-4: 139 92 246;
    --chart-5: 239 68 68;
  }
</style>