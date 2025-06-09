<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import * as Select from '$lib/components/ui/select';
  import * as Card from '$lib/components/ui/card';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as Tabs from '$lib/components/ui/tabs';
  import { Badge } from '$lib/components/ui/badge';
  import { Progress } from '$lib/components/ui/progress';
  import * as Chart from '$lib/components/ui/chart';
  import { AreaChart, BarChart, LineChart } from 'layerchart';
  import { scaleUtc, scaleLinear, scaleBand } from 'd3-scale';
  import { curveNatural } from 'd3-shape';
  import { toast } from 'svelte-sonner';
  
  import Download from "@lucide/svelte/icons/download";
  import Calendar from "@lucide/svelte/icons/calendar";
  import Users from "@lucide/svelte/icons/users";
  import TrendingUp from "@lucide/svelte/icons/trending-up";
  import TrendingDown from "@lucide/svelte/icons/trending-down";
  import Target from "@lucide/svelte/icons/target";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import AlertTriangle from "@lucide/svelte/icons/alert-triangle";
  import Lightbulb from "@lucide/svelte/icons/lightbulb";
  import CheckCircle from "@lucide/svelte/icons/check-circle";
  import RefreshCw from "@lucide/svelte/icons/refresh-cw";
  import Filter from "@lucide/svelte/icons/filter";
  import Mail from "@lucide/svelte/icons/mail";

  // State
  let dateRange = $state('30d');
  let selectedTeamMembers = $state<string[]>([]);
  let selectedMetrics = $state<string[]>(['revenue', 'leads', 'conversion']);
  let comparisonPeriod = $state('previous');
  let showExportDialog = $state(false);
  let showScheduleDialog = $state(false);
  let isRefreshing = $state(false);

  // Export options
  let exportFormat = $state('pdf');
  let includeCharts = $state(true);
  let includeInsights = $state(true);

  // Schedule options
  let scheduleFrequency = $state('weekly');
  let scheduleRecipients = $state('');
  let scheduleFormat = $state('pdf');

  // Team members
  const teamMembers = [
    'Sarah Chen',
    'Michael Rodriguez', 
    'Emily Taylor',
    'David Kim',
    'Alex Thompson',
    'Lisa Wong'
  ];

  // Generate mock data
  const generateTimeSeriesData = (days: number) => {
    const data = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      data.push({
        date,
        revenue: Math.floor(Math.random() * 50000) + 30000,
        leads: Math.floor(Math.random() * 100) + 50,
        activities: Math.floor(Math.random() * 200) + 100,
        deals: Math.floor(Math.random() * 20) + 10,
        forecast: Math.floor(Math.random() * 60000) + 40000,
        conservative: Math.floor(Math.random() * 45000) + 35000
      });
    }
    return data;
  };

  const generateFunnelData = () => [
    { stage: 'Leads', count: 1000, conversion: 100 },
    { stage: 'Qualified', count: 400, conversion: 40 },
    { stage: 'Proposal', count: 200, conversion: 20 },
    { stage: 'Negotiation', count: 100, conversion: 10 },
    { stage: 'Closed Won', count: 60, conversion: 6 }
  ];

  const generateActivityHeatmap = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = [];
    
    days.forEach(day => {
      hours.forEach(hour => {
        data.push({
          day,
          hour,
          activities: Math.floor(Math.random() * 50) + 10,
          emails: Math.floor(Math.random() * 30) + 5,
          calls: Math.floor(Math.random() * 20) + 2
        });
      });
    });
    return data;
  };

  const generateTeamPerformance = () => teamMembers.map(member => ({
    name: member,
    revenue: Math.floor(Math.random() * 200000) + 100000,
    deals: Math.floor(Math.random() * 30) + 15,
    activities: Math.floor(Math.random() * 150) + 75
  }));

  // Data
  let timeSeriesData = $state(generateTimeSeriesData(30));
  let funnelData = $state(generateFunnelData());
  let activityData = $state(generateActivityHeatmap());
  let teamData = $state(generateTeamPerformance());

  // Chart configurations
  const chartConfig = {
    revenue: { label: "Revenue", color: "var(--chart-1)" },
    leads: { label: "Leads", color: "var(--chart-2)" },
    activities: { label: "Activities", color: "var(--chart-3)" },
    deals: { label: "Deals", color: "var(--chart-4)" },
    forecast: { label: "Forecast", color: "var(--chart-5)" },
    conservative: { label: "Conservative", color: "var(--chart-1)" },
    emails: { label: "Emails", color: "var(--chart-2)" },
    calls: { label: "Calls", color: "var(--chart-3)" }
  } satisfies Chart.ChartConfig;

  // KPI calculations
  let kpis = $derived.by(() => {
    const totalRevenue = timeSeriesData.reduce((sum, d) => sum + d.revenue, 0);
    const totalLeads = timeSeriesData.reduce((sum, d) => sum + d.leads, 0);
    const totalDeals = timeSeriesData.reduce((sum, d) => sum + d.deals, 0);
    
    return {
      totalRevenue,
      totalLeads,
      conversionRate: totalLeads > 0 ? (totalDeals / totalLeads * 100) : 0,
      avgDealSize: totalDeals > 0 ? (totalRevenue / totalDeals) : 0,
      salesCycle: 28,
      winRate: 65
    };
  });

  // AI Insights
  const aiInsights = [
    {
      type: 'opportunity',
      title: 'High-Value Lead Segment Identified',
      description: 'Enterprise leads from technology sector show 40% higher conversion rates',
      impact: 'high',
      action: 'Focus outreach efforts on tech companies with 500+ employees'
    },
    {
      type: 'warning',
      title: 'Conversion Rate Declining',
      description: 'Lead to opportunity conversion dropped 15% this month',
      impact: 'medium',
      action: 'Review lead qualification criteria and sales process'
    },
    {
      type: 'insight',
      title: 'Optimal Contact Time Discovered',
      description: 'Calls made between 10-11 AM have 25% higher success rate',
      impact: 'medium',
      action: 'Schedule more calls during peak engagement hours'
    },
    {
      type: 'recommendation',
      title: 'Email Sequence Optimization',
      description: 'A/B test shows personalized subject lines increase open rates by 30%',
      impact: 'high',
      action: 'Implement personalization tokens in all email templates'
    }
  ];

  // Goals
  const goals = [
    {
      name: 'Monthly Revenue',
      current: 850000,
      target: 1000000,
      status: 'on-track'
    },
    {
      name: 'New Leads',
      current: 1200,
      target: 1500,
      status: 'behind'
    },
    {
      name: 'Conversion Rate',
      current: 32,
      target: 35,
      status: 'at-risk'
    },
    {
      name: 'Team Activities',
      current: 2800,
      target: 3000,
      status: 'on-track'
    }
  ];

  // Functions
  function refreshData() {
    isRefreshing = true;
    setTimeout(() => {
      timeSeriesData = generateTimeSeriesData(30);
      funnelData = generateFunnelData();
      activityData = generateActivityHeatmap();
      teamData = generateTeamPerformance();
      isRefreshing = false;
      toast.success('Data refreshed successfully');
    }, 1500);
  }

  function exportReport() {
    // Simulate export
    const filename = `analytics-report-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
    
    if (exportFormat === 'csv') {
      // Generate CSV content
      const csvContent = generateCSVReport();
      downloadCSV(csvContent, filename);
    } else {
      // Simulate PDF/Excel export
      toast.success(`${exportFormat.toUpperCase()} report exported: ${filename}`);
    }
    
    showExportDialog = false;
  }

  function generateCSVReport() {
    const headers = ['Date', 'Revenue', 'Leads', 'Activities', 'Deals'];
    const rows = timeSeriesData.map(d => [
      d.date.toISOString().split('T')[0],
      d.revenue,
      d.leads,
      d.activities,
      d.deals
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  function downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  function scheduleReport() {
    toast.success(`${scheduleFrequency} reports scheduled for: ${scheduleRecipients}`);
    showScheduleDialog = false;
    scheduleRecipients = '';
  }

  function getInsightIcon(type: string) {
    switch (type) {
      case 'opportunity': return TrendingUp;
      case 'warning': return AlertTriangle;
      case 'insight': return Lightbulb;
      case 'recommendation': return Sparkles;
      default: return CheckCircle;
    }
  }

  function getInsightColor(type: string) {
    switch (type) {
      case 'opportunity': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'insight': return 'text-blue-600 bg-blue-100';
      case 'recommendation': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  function getGoalStatus(status: string) {
    switch (status) {
      case 'on-track': return 'bg-green-100 text-green-800';
      case 'at-risk': return 'bg-yellow-100 text-yellow-800';
      case 'behind': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  function formatNumber(value: number) {
    return new Intl.NumberFormat('en-US').format(value);
  }

  function formatPercentage(value: number) {
    return `${value.toFixed(1)}%`;
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold">Analytics Dashboard</h1>
      <p class="text-muted-foreground">Comprehensive sales performance insights and analytics</p>
    </div>
    <div class="flex items-center gap-4">
      <Button variant="outline" onclick={refreshData} disabled={isRefreshing}>
        <RefreshCw class={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh Data
      </Button>
      <Button variant="outline" onclick={() => showExportDialog = true}>
        <Download class="h-4 w-4 mr-2" />
        Export Report
      </Button>
      <Button variant="outline" onclick={() => showScheduleDialog = true}>
        <Mail class="h-4 w-4 mr-2" />
        Schedule Reports
      </Button>
    </div>
  </div>

  <!-- Filters -->
  <Card.Root class="p-4">
    <div class="flex flex-wrap gap-4">
      <div class="flex items-center gap-2">
        <Filter class="h-4 w-4" />
        <span class="text-sm font-medium">Filters:</span>
      </div>
      
      <Select.Root bind:value={dateRange}>
        <Select.Trigger class="w-[150px]">
          {dateRange === '7d' ? 'Last 7 days' : 
           dateRange === '30d' ? 'Last 30 days' : 
           dateRange === '90d' ? 'Last 90 days' : 
           dateRange === '1y' ? 'Last year' : 'Custom range'}
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="7d">Last 7 days</Select.Item>
          <Select.Item value="30d">Last 30 days</Select.Item>
          <Select.Item value="90d">Last 90 days</Select.Item>
          <Select.Item value="1y">Last year</Select.Item>
          <Select.Item value="custom">Custom range</Select.Item>
        </Select.Content>
      </Select.Root>

      <Select.Root bind:value={comparisonPeriod}>
        <Select.Trigger class="w-[180px]">
          {comparisonPeriod === 'previous' ? 'vs Previous period' : 'vs Same period last year'}
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="previous">vs Previous period</Select.Item>
          <Select.Item value="year">vs Same period last year</Select.Item>
        </Select.Content>
      </Select.Root>
    </div>
  </Card.Root>

  <!-- KPI Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
    <Card.Root class="p-6">
      <div class="flex flex-col">
        <span class="text-sm font-medium text-muted-foreground">Total Revenue</span>
        <span class="text-2xl font-bold">{formatCurrency(kpis.totalRevenue)}</span>
        <div class="flex items-center mt-2">
          <TrendingUp class="h-4 w-4 text-green-600 mr-1" />
          <span class="text-sm text-green-600">+12.5%</span>
        </div>
      </div>
    </Card.Root>

    <Card.Root class="p-6">
      <div class="flex flex-col">
        <span class="text-sm font-medium text-muted-foreground">Total Leads</span>
        <span class="text-2xl font-bold">{formatNumber(kpis.totalLeads)}</span>
        <div class="flex items-center mt-2">
          <TrendingUp class="h-4 w-4 text-green-600 mr-1" />
          <span class="text-sm text-green-600">+8.3%</span>
        </div>
      </div>
    </Card.Root>

    <Card.Root class="p-6">
      <div class="flex flex-col">
        <span class="text-sm font-medium text-muted-foreground">Conversion Rate</span>
        <span class="text-2xl font-bold">{formatPercentage(kpis.conversionRate)}</span>
        <div class="flex items-center mt-2">
          <TrendingDown class="h-4 w-4 text-red-600 mr-1" />
          <span class="text-sm text-red-600">-2.1%</span>
        </div>
      </div>
    </Card.Root>

    <Card.Root class="p-6">
      <div class="flex flex-col">
        <span class="text-sm font-medium text-muted-foreground">Avg Deal Size</span>
        <span class="text-2xl font-bold">{formatCurrency(kpis.avgDealSize)}</span>
        <div class="flex items-center mt-2">
          <TrendingUp class="h-4 w-4 text-green-600 mr-1" />
          <span class="text-sm text-green-600">+15.7%</span>
        </div>
      </div>
    </Card.Root>

    <Card.Root class="p-6">
      <div class="flex flex-col">
        <span class="text-sm font-medium text-muted-foreground">Sales Cycle</span>
        <span class="text-2xl font-bold">{kpis.salesCycle} days</span>
        <div class="flex items-center mt-2">
          <TrendingDown class="h-4 w-4 text-green-600 mr-1" />
          <span class="text-sm text-green-600">-3 days</span>
        </div>
      </div>
    </Card.Root>

    <Card.Root class="p-6">
      <div class="flex flex-col">
        <span class="text-sm font-medium text-muted-foreground">Win Rate</span>
        <span class="text-2xl font-bold">{formatPercentage(kpis.winRate)}</span>
        <div class="flex items-center mt-2">
          <TrendingUp class="h-4 w-4 text-green-600 mr-1" />
          <span class="text-sm text-green-600">+5.2%</span>
        </div>
      </div>
    </Card.Root>
  </div>

  <!-- Main Analytics -->
  <Tabs.Root value="overview" class="space-y-6">
    <Tabs.List class="grid w-full grid-cols-5">
      <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
      <Tabs.Trigger value="performance">Performance</Tabs.Trigger>
      <Tabs.Trigger value="funnel">Funnel</Tabs.Trigger>
      <Tabs.Trigger value="team">Team</Tabs.Trigger>
      <Tabs.Trigger value="goals">Goals</Tabs.Trigger>
    </Tabs.List>

    <!-- Overview Tab -->
    <Tabs.Content value="overview" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Sales Performance Trends -->
        <Card.Root>
          <Card.Header>
            <Card.Title>Sales Performance Trends</Card.Title>
            <Card.Description>Revenue and lead generation over time</Card.Description>
          </Card.Header>
          <Card.Content>
            <Chart.Container config={chartConfig} class="h-[300px]">
              <AreaChart
                data={timeSeriesData}
                x="date"
                xScale={scaleUtc()}
                series={[
                  {
                    key: "revenue",
                    label: "Revenue",
                    color: chartConfig.revenue.color,
                  },
                  {
                    key: "leads",
                    label: "Leads",
                    color: chartConfig.leads.color,
                  }
                ]}
                props={{
                  area: {
                    curve: curveNatural,
                    "fill-opacity": 0.4,
                    line: { class: "stroke-2" }
                  },
                  xAxis: {
                    format: (v) => v.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  }
                }}
              >
                {#snippet tooltip()}
                  <Chart.Tooltip
                    labelFormatter={(v: Date) => v.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric"
                    })}
                    indicator="dot"
                  />
                {/snippet}
              </AreaChart>
            </Chart.Container>
          </Card.Content>
        </Card.Root>

        <!-- Revenue Forecasting -->
        <Card.Root>
          <Card.Header>
            <Card.Title>Revenue Forecasting</Card.Title>
            <Card.Description>Projected revenue with confidence intervals</Card.Description>
          </Card.Header>
          <Card.Content>
            <Chart.Container config={chartConfig} class="h-[300px]">
              <LineChart
                data={timeSeriesData}
                x="date"
                xScale={scaleUtc()}
                series={[
                  {
                    key: "revenue",
                    label: "Actual",
                    color: chartConfig.revenue.color,
                  },
                  {
                    key: "forecast",
                    label: "Forecast",
                    color: chartConfig.forecast.color,
                  },
                  {
                    key: "conservative",
                    label: "Conservative",
                    color: chartConfig.conservative.color,
                  }
                ]}
                props={{
                  line: { class: "stroke-2" },
                  xAxis: {
                    format: (v) => v.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  }
                }}
              >
                {#snippet tooltip()}
                  <Chart.Tooltip
                    labelFormatter={(v: Date) => v.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric"
                    })}
                    indicator="line"
                  />
                {/snippet}
              </LineChart>
            </Chart.Container>
          </Card.Content>
        </Card.Root>
      </div>

      <!-- AI Insights -->
      <Card.Root>
        <Card.Header>
          <Card.Title class="flex items-center gap-2">
            <Sparkles class="h-5 w-5" />
            AI-Powered Insights
          </Card.Title>
          <Card.Description>Actionable recommendations based on your data</Card.Description>
        </Card.Header>
        <Card.Content>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each aiInsights as insight}
            {@const Icon = getInsightIcon(insight.type)}
              <div class="border rounded-lg p-4">
                <div class="flex items-start gap-3">
                  <div class={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                    <Icon class="h-4 w-4" />
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <h4 class="font-semibold">{insight.title}</h4>
                      <Badge variant="outline" class="text-xs">
                        {insight.impact} impact
                      </Badge>
                    </div>
                    <p class="text-sm text-muted-foreground mb-2">{insight.description}</p>
                    <p class="text-sm font-medium">{insight.action}</p>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </Card.Content>
      </Card.Root>
    </Tabs.Content>

    <!-- Performance Tab -->
    <Tabs.Content value="performance" class="space-y-6">
      <!-- Activity Heatmap -->
      <Card.Root>
        <Card.Header>
          <Card.Title>Activity Heatmap</Card.Title>
          <Card.Description>Sales activities by day and hour</Card.Description>
        </Card.Header>
        <Card.Content>
          <Chart.Container config={chartConfig} class="h-[400px]">
            <BarChart
              data={activityData.filter(d => d.day === 'Mon')}
              x="hour"
              xScale={scaleBand()}
              series={[
                {
                  key: "activities",
                  label: "Activities",
                  color: chartConfig.activities.color,
                },
                {
                  key: "emails",
                  label: "Emails",
                  color: chartConfig.emails.color,
                },
                {
                  key: "calls",
                  label: "Calls",
                  color: chartConfig.calls.color,
                }
              ]}
              seriesLayout="stack"
              props={{
                xAxis: {
                  format: (v) => `${v}:00`
                }
              }}
            >
              {#snippet tooltip()}
                <Chart.Tooltip
                  labelFormatter={(v) => `${v}:00`}
                  indicator="dot"
                />
              {/snippet}
            </BarChart>
          </Chart.Container>
        </Card.Content>
      </Card.Root>
    </Tabs.Content>

    <!-- Funnel Tab -->
    <Tabs.Content value="funnel" class="space-y-6">
      <!-- Lead Conversion Funnel -->
      <Card.Root>
        <Card.Header>
          <Card.Title>Lead Conversion Funnel</Card.Title>
          <Card.Description>Conversion rates at each stage of the sales process</Card.Description>
        </Card.Header>
        <Card.Content>
          <Chart.Container config={chartConfig} class="h-[400px]">
            <BarChart
              data={funnelData}
              x="stage"
              xScale={scaleBand()}
              series={[
                {
                  key: "count",
                  label: "Count",
                  color: chartConfig.leads.color,
                }
              ]}
              props={{
                xAxis: {
                  format: (v) => v
                }
              }}
            >
              {#snippet tooltip()}
                <Chart.Tooltip
                  labelFormatter={(v) => v}
                  indicator="dot"
                />
              {/snippet}
            </BarChart>
          </Chart.Container>
        </Card.Content>
      </Card.Root>
    </Tabs.Content>

    <!-- Team Tab -->
    <Tabs.Content value="team" class="space-y-6">
      <!-- Team Performance -->
      <Card.Root>
        <Card.Header>
          <Card.Title>Team Performance Comparison</Card.Title>
          <Card.Description>Revenue and deals closed by team member</Card.Description>
        </Card.Header>
        <Card.Content>
          <Chart.Container config={chartConfig} class="h-[400px]">
            <BarChart
              data={teamData}
              x="name"
              xScale={scaleBand()}
              series={[
                {
                  key: "revenue",
                  label: "Revenue",
                  color: chartConfig.revenue.color,
                },
                {
                  key: "deals",
                  label: "Deals",
                  color: chartConfig.deals.color,
                }
              ]}
              props={{
                xAxis: {
                  format: (v) => v.split(' ')[0]
                }
              }}
            >
              {#snippet tooltip()}
                <Chart.Tooltip
                  labelFormatter={(v) => v}
                  indicator="dot"
                />
              {/snippet}
            </BarChart>
          </Chart.Container>
        </Card.Content>
      </Card.Root>
    </Tabs.Content>

    <!-- Goals Tab -->
    <Tabs.Content value="goals" class="space-y-6">
      <!-- Goal Tracking -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {#each goals as goal}
          <Card.Root class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold">{goal.name}</h3>
              <Badge class={getGoalStatus(goal.status)}>
                {goal.status.replace('-', ' ')}
              </Badge>
            </div>
            
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round((goal.current / goal.target) * 100)}%</span>
              </div>
              <Progress value={(goal.current / goal.target) * 100} class="h-2" />
              <div class="flex justify-between text-sm text-muted-foreground">
                <span>{formatNumber(goal.current)}</span>
                <span>{formatNumber(goal.target)}</span>
              </div>
            </div>
          </Card.Root>
        {/each}
      </div>
    </Tabs.Content>
  </Tabs.Root>

  <!-- Export Dialog -->
  <Dialog.Root bind:open={showExportDialog}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Export Analytics Report</Dialog.Title>
        <Dialog.Description>
          Choose your export format and options
        </Dialog.Description>
      </Dialog.Header>

      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium">Export Format</label>
          <Select.Root bind:value={exportFormat}>
            <Select.Trigger class="w-full mt-1">
              {exportFormat.toUpperCase()}
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="pdf">PDF Report</Select.Item>
              <Select.Item value="csv">CSV Data</Select.Item>
              <Select.Item value="excel">Excel Spreadsheet</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>

        <div class="space-y-2">
          <label class="flex items-center space-x-2">
            <input type="checkbox" bind:checked={includeCharts} />
            <span class="text-sm">Include charts and visualizations</span>
          </label>
          <label class="flex items-center space-x-2">
            <input type="checkbox" bind:checked={includeInsights} />
            <span class="text-sm">Include AI insights and recommendations</span>
          </label>
        </div>
      </div>

      <Dialog.Footer>
        <Button variant="outline" onclick={() => showExportDialog = false}>
          Cancel
        </Button>
        <Button onclick={exportReport}>
          Export Report
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>

  <!-- Schedule Dialog -->
  <Dialog.Root bind:open={showScheduleDialog}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Schedule Automated Reports</Dialog.Title>
        <Dialog.Description>
          Set up automatic report delivery
        </Dialog.Description>
      </Dialog.Header>

      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium">Frequency</label>
          <Select.Root bind:value={scheduleFrequency}>
            <Select.Trigger class="w-full mt-1">
              {scheduleFrequency.charAt(0).toUpperCase() + scheduleFrequency.slice(1)}
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="daily">Daily</Select.Item>
              <Select.Item value="weekly">Weekly</Select.Item>
              <Select.Item value="monthly">Monthly</Select.Item>
              <Select.Item value="quarterly">Quarterly</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>

        <div>
          <label class="text-sm font-medium">Format</label>
          <Select.Root bind:value={scheduleFormat}>
            <Select.Trigger class="w-full mt-1">
              {scheduleFormat.toUpperCase()}
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="pdf">PDF Report</Select.Item>
              <Select.Item value="excel">Excel Spreadsheet</Select.Item>
              <Select.Item value="csv">CSV Data</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>

        <div>
          <label class="text-sm font-medium">Recipients (comma-separated emails)</label>
          <Input
            type="email"
            placeholder="user@example.com, team@example.com"
            bind:value={scheduleRecipients}
            class="mt-1"
          />
        </div>
      </div>

      <Dialog.Footer>
        <Button variant="outline" onclick={() => showScheduleDialog = false}>
          Cancel
        </Button>
        <Button onclick={scheduleReport} disabled={!scheduleRecipients.trim()}>
          Schedule Reports
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
</div>