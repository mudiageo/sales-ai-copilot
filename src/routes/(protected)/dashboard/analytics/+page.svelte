<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import * as Select from '$lib/components/ui/select';
  import * as Card from '$lib/components/ui/card';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as Tabs from '$lib/components/ui/tabs';
  import { Badge } from '$lib/components/ui/badge';
  import { Progress } from '$lib/components/ui/progress';
  import { Label } from '$lib/components/ui/label';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { toast } from 'svelte-sonner';
  import Calendar from "@lucide/svelte/icons/calendar";
  import Download from "@lucide/svelte/icons/download";
  import Filter from "@lucide/svelte/icons/filter";
  import TrendingUp from "@lucide/svelte/icons/trending-up";
  import TrendingDown from "@lucide/svelte/icons/trending-down";
  import Target from "@lucide/svelte/icons/target";
  import Users from "@lucide/svelte/icons/users";
  import DollarSign from "@lucide/svelte/icons/dollar-sign";
  import Activity from "@lucide/svelte/icons/activity";
  import Mail from "@lucide/svelte/icons/mail";
  import Phone from "@lucide/svelte/icons/phone";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import FileText from "@lucide/svelte/icons/file-text";
  import Settings from "@lucide/svelte/icons/settings";
  import RefreshCw from "@lucide/svelte/icons/refresh-cw";

  // State management
  let dateRange = $state('30d');
  let selectedTeamMembers = $state<string[]>([]);
  let selectedMetrics = $state<string[]>(['revenue', 'leads', 'conversion']);
  let comparisonPeriod = $state('previous');
  let showFilters = $state(false);
  let showExportDialog = $state(false);
  let showScheduleDialog = $state(false);
  let isGeneratingInsights = $state(false);

  // Chart instances
  let salesTrendChart: Chart;
  let conversionFunnelChart: Chart;
  let activityHeatmapChart: Chart;
  let revenueForecastChart: Chart;
  let teamPerformanceChart: Chart;
  let goalProgressChart: Chart;

  // Mock data
  const teamMembers = [
    'Sarah Chen', 'Michael Rodriguez', 'Emily Taylor', 'David Kim', 'Lisa Wong', 'James Wilson'
  ];

  const metrics = [
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'conversion', label: 'Conversion Rate', icon: TrendingUp },
    { id: 'activities', label: 'Activities', icon: Activity },
    { id: 'emails', label: 'Emails Sent', icon: Mail },
    { id: 'calls', label: 'Calls Made', icon: Phone }
  ];

  const kpiData = {
    totalRevenue: { value: 2847500, change: 12.5, trend: 'up' },
    totalLeads: { value: 1247, change: -3.2, trend: 'down' },
    conversionRate: { value: 32.5, change: 8.7, trend: 'up' },
    avgDealSize: { value: 15750, change: 5.3, trend: 'up' },
    salesCycle: { value: 28, change: -12.1, trend: 'up' },
    winRate: { value: 68.2, change: 4.8, trend: 'up' }
  };

  const goals = [
    { name: 'Monthly Revenue', target: 3000000, current: 2847500, progress: 94.9 },
    { name: 'New Leads', target: 1500, current: 1247, progress: 83.1 },
    { name: 'Conversion Rate', target: 35, current: 32.5, progress: 92.9 },
    { name: 'Team Activities', target: 2000, current: 1856, progress: 92.8 }
  ];

  const aiInsights = [
    {
      type: 'opportunity',
      title: 'Conversion Rate Optimization',
      description: 'Your conversion rate has increased 8.7% this month. Consider scaling successful campaigns.',
      impact: 'High',
      action: 'Review top-performing email sequences'
    },
    {
      type: 'warning',
      title: 'Lead Generation Decline',
      description: 'Lead generation is down 3.2% compared to last month. Marketing channels need attention.',
      impact: 'Medium',
      action: 'Analyze traffic sources and campaign performance'
    },
    {
      type: 'insight',
      title: 'Sales Cycle Improvement',
      description: 'Average sales cycle has decreased by 12.1%. Your team is closing deals faster.',
      impact: 'High',
      action: 'Document and replicate successful processes'
    },
    {
      type: 'recommendation',
      title: 'Team Performance Gap',
      description: 'Top performers are 40% more effective. Consider peer mentoring programs.',
      impact: 'Medium',
      action: 'Implement knowledge sharing sessions'
    }
  ];

  // Generate mock data for charts
  function generateSalesTrendData() {
    const days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    return {
      labels: days,
      datasets: [
        {
          label: 'Revenue',
          data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 50000) + 80000),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Previous Period',
          data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 45000) + 75000),
          borderColor: 'rgb(156, 163, 175)',
          backgroundColor: 'rgba(156, 163, 175, 0.1)',
          borderDash: [5, 5],
          tension: 0.4,
          fill: false
        }
      ]
    };
  }

  function generateConversionFunnelData() {
    return {
      labels: ['Visitors', 'Leads', 'Qualified', 'Opportunities', 'Customers'],
      datasets: [{
        label: 'Conversion Funnel',
        data: [10000, 1247, 856, 342, 234],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  }

  function generateActivityHeatmapData() {
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return {
      labels: hours,
      datasets: days.map((day, dayIndex) => ({
        label: day,
        data: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)),
        backgroundColor: `hsla(${dayIndex * 50}, 70%, 50%, 0.8)`
      }))
    };
  }

  function generateRevenueForecastData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      labels: months,
      datasets: [
        {
          label: 'Actual Revenue',
          data: [2200000, 2400000, 2600000, 2800000, 2847500, null, null, null, null, null, null, null],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        },
        {
          label: 'Forecasted Revenue',
          data: [null, null, null, null, 2847500, 3100000, 3250000, 3400000, 3550000, 3700000, 3850000, 4000000],
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderDash: [5, 5],
          tension: 0.4
        },
        {
          label: 'Conservative Estimate',
          data: [null, null, null, null, 2847500, 2950000, 3050000, 3150000, 3250000, 3350000, 3450000, 3550000],
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderDash: [2, 2],
          tension: 0.4
        }
      ]
    };
  }

  function generateTeamPerformanceData() {
    return {
      labels: teamMembers,
      datasets: [
        {
          label: 'Revenue Generated',
          data: [485000, 420000, 380000, 350000, 320000, 290000],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1
        },
        {
          label: 'Deals Closed',
          data: [32, 28, 25, 23, 21, 19],
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1,
          yAxisID: 'y1'
        }
      ]
    };
  }

  onMount(() => {
    initializeCharts();
    return () => {
      // Cleanup charts
      [salesTrendChart, conversionFunnelChart, activityHeatmapChart, revenueForecastChart, teamPerformanceChart, goalProgressChart].forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  });

  function initializeCharts() {
    // Sales Trend Chart
    const salesCtx = document.getElementById('salesTrendChart') as HTMLCanvasElement;
    salesTrendChart = new Chart(salesCtx, {
      type: 'line',
      data: generateSalesTrendData(),
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Sales Performance Trends' },
          legend: { position: 'top' }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + (value / 1000).toFixed(0) + 'K';
              }
            }
          }
        }
      }
    });

    // Conversion Funnel Chart
    const funnelCtx = document.getElementById('conversionFunnelChart') as HTMLCanvasElement;
    conversionFunnelChart = new Chart(funnelCtx, {
      type: 'bar',
      data: generateConversionFunnelData(),
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Lead Conversion Funnel' },
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    // Activity Heatmap Chart
    const heatmapCtx = document.getElementById('activityHeatmapChart') as HTMLCanvasElement;
    activityHeatmapChart = new Chart(heatmapCtx, {
      type: 'bar',
      data: generateActivityHeatmapData(),
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Activity Heatmap (Hours vs Days)' }
        },
        scales: {
          x: { stacked: true },
          y: { stacked: true }
        }
      }
    });

    // Revenue Forecast Chart
    const forecastCtx = document.getElementById('revenueForecastChart') as HTMLCanvasElement;
    revenueForecastChart = new Chart(forecastCtx, {
      type: 'line',
      data: generateRevenueForecastData(),
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Revenue Forecasting' },
          legend: { position: 'top' }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + (value / 1000000).toFixed(1) + 'M';
              }
            }
          }
        }
      }
    });

    // Team Performance Chart
    const teamCtx = document.getElementById('teamPerformanceChart') as HTMLCanvasElement;
    teamPerformanceChart = new Chart(teamCtx, {
      type: 'bar',
      data: generateTeamPerformanceData(),
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Team Performance Comparison' }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: {
              callback: function(value) {
                return '$' + (value / 1000).toFixed(0) + 'K';
              }
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: { drawOnChartArea: false }
          }
        }
      }
    });
  }

  function refreshData() {
    // Simulate data refresh
    toast.success('Data refreshed successfully');
    
    // Update charts with new data
    salesTrendChart.data = generateSalesTrendData();
    salesTrendChart.update();
    
    conversionFunnelChart.data = generateConversionFunnelData();
    conversionFunnelChart.update();
    
    activityHeatmapChart.data = generateActivityHeatmapData();
    activityHeatmapChart.update();
    
    revenueForecastChart.data = generateRevenueForecastData();
    revenueForecastChart.update();
    
    teamPerformanceChart.data = generateTeamPerformanceData();
    teamPerformanceChart.update();
  }

  async function generateAIInsights() {
    isGeneratingInsights = true;
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success('AI insights generated successfully');
    isGeneratingInsights = false;
  }

  function exportData(format: 'pdf' | 'csv' | 'excel') {
    // Simulate export functionality
    const filename = `analytics-report-${new Date().toISOString().split('T')[0]}.${format}`;
    
    if (format === 'csv') {
      const csvData = generateCSVData();
      downloadFile(csvData, filename, 'text/csv');
    } else if (format === 'excel') {
      // Simulate Excel export
      toast.success(`Excel report "${filename}" exported successfully`);
    } else if (format === 'pdf') {
      // Simulate PDF export
      toast.success(`PDF report "${filename}" exported successfully`);
    }
    
    showExportDialog = false;
  }

  function generateCSVData() {
    const headers = ['Date', 'Revenue', 'Leads', 'Conversion Rate', 'Activities'];
    const rows = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return [
        date.toISOString().split('T')[0],
        Math.floor(Math.random() * 50000) + 80000,
        Math.floor(Math.random() * 50) + 30,
        (Math.random() * 10 + 25).toFixed(1),
        Math.floor(Math.random() * 100) + 50
      ];
    });
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function scheduleReport(frequency: string, format: string, recipients: string[]) {
    // Simulate report scheduling
    toast.success(`${frequency} ${format.toUpperCase()} reports scheduled for ${recipients.length} recipient(s)`);
    showScheduleDialog = false;
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  function formatPercentage(value: number) {
    return `${value.toFixed(1)}%`;
  }

  function getInsightIcon(type: string) {
    switch (type) {
      case 'opportunity': return TrendingUp;
      case 'warning': return TrendingDown;
      case 'insight': return Sparkles;
      case 'recommendation': return Target;
      default: return Activity;
    }
  }

  function getInsightColor(type: string) {
    switch (type) {
      case 'opportunity': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-red-600 bg-red-100';
      case 'insight': return 'text-blue-600 bg-blue-100';
      case 'recommendation': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  function getImpactColor(impact: string) {
    switch (impact) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold">Analytics Dashboard</h1>
      <p class="text-muted-foreground">Comprehensive sales performance analytics and insights</p>
    </div>
    <div class="flex items-center gap-4">
      <Button variant="outline" onclick={() => showFilters = true}>
        <Filter class="h-4 w-4 mr-2" />
        Filters
      </Button>
      <Button variant="outline" onclick={refreshData}>
        <RefreshCw class="h-4 w-4 mr-2" />
        Refresh
      </Button>
      <Button variant="outline" onclick={() => showExportDialog = true}>
        <Download class="h-4 w-4 mr-2" />
        Export
      </Button>
      <Button onclick={generateAIInsights} disabled={isGeneratingInsights}>
        <Sparkles class="h-4 w-4 mr-2" />
        {isGeneratingInsights ? 'Generating...' : 'AI Insights'}
      </Button>
    </div>
  </div>

  <!-- Date Range Selector -->
  <Card.Root class="p-4">
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <Calendar class="h-4 w-4" />
        <Label>Date Range:</Label>
      </div>
      <Select.Root bind:value={dateRange}>
        <Select.Trigger class="w-[200px]">
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

      <div class="flex items-center gap-2 ml-8">
        <Label>Compare to:</Label>
        <Select.Root bind:value={comparisonPeriod}>
          <Select.Trigger class="w-[200px]">
            {comparisonPeriod === 'previous' ? 'Previous period' :
             comparisonPeriod === 'year' ? 'Same period last year' : 'No comparison'}
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="previous">Previous period</Select.Item>
            <Select.Item value="year">Same period last year</Select.Item>
            <Select.Item value="none">No comparison</Select.Item>
          </Select.Content>
        </Select.Root>
      </div>
    </div>
  </Card.Root>

  <!-- KPI Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
    {#each Object.entries(kpiData) as [key, data]}
      <Card.Root class="p-6">
        <div class="flex flex-col">
          <span class="text-sm font-medium text-muted-foreground capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </span>
          <span class="text-2xl font-bold">
            {key.includes('Rate') || key.includes('Win') ? formatPercentage(data.value) :
             key.includes('Revenue') || key.includes('Deal') ? formatCurrency(data.value) :
             data.value.toLocaleString()}
          </span>
          <div class="flex items-center mt-2">
            {#if data.trend === 'up'}
              <TrendingUp class="h-4 w-4 text-green-600 mr-1" />
              <span class="text-sm text-green-600">+{formatPercentage(data.change)}</span>
            {:else}
              <TrendingDown class="h-4 w-4 text-red-600 mr-1" />
              <span class="text-sm text-red-600">{formatPercentage(data.change)}</span>
            {/if}
          </div>
        </div>
      </Card.Root>
    {/each}
  </div>

  <!-- Main Charts -->
  <Tabs.Root value="overview" class="space-y-6">
    <Tabs.List class="grid w-full grid-cols-5">
      <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
      <Tabs.Trigger value="sales">Sales Trends</Tabs.Trigger>
      <Tabs.Trigger value="conversion">Conversion</Tabs.Trigger>
      <Tabs.Trigger value="forecast">Forecast</Tabs.Trigger>
      <Tabs.Trigger value="team">Team</Tabs.Trigger>
    </Tabs.List>

    <Tabs.Content value="overview" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card.Root class="p-6">
          <canvas id="salesTrendChart"></canvas>
        </Card.Root>
        <Card.Root class="p-6">
          <canvas id="conversionFunnelChart"></canvas>
        </Card.Root>
      </div>
    </Tabs.Content>

    <Tabs.Content value="sales" class="space-y-6">
      <Card.Root class="p-6">
        <canvas id="salesTrendChart"></canvas>
      </Card.Root>
      <Card.Root class="p-6">
        <canvas id="activityHeatmapChart"></canvas>
      </Card.Root>
    </Tabs.Content>

    <Tabs.Content value="conversion" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card.Root class="p-6">
          <canvas id="conversionFunnelChart"></canvas>
        </Card.Root>
        <Card.Root class="p-6">
          <h3 class="text-lg font-semibold mb-4">Conversion Metrics</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span>Visitor to Lead</span>
              <span class="font-semibold">12.47%</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Lead to Qualified</span>
              <span class="font-semibold">68.6%</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Qualified to Opportunity</span>
              <span class="font-semibold">39.9%</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Opportunity to Customer</span>
              <span class="font-semibold">68.4%</span>
            </div>
          </div>
        </Card.Root>
      </div>
    </Tabs.Content>

    <Tabs.Content value="forecast" class="space-y-6">
      <Card.Root class="p-6">
        <canvas id="revenueForecastChart"></canvas>
      </Card.Root>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card.Root class="p-6">
          <h3 class="text-lg font-semibold mb-2">Next Month Forecast</h3>
          <p class="text-2xl font-bold text-green-600">{formatCurrency(3100000)}</p>
          <p class="text-sm text-muted-foreground">+8.9% from current month</p>
        </Card.Root>
        <Card.Root class="p-6">
          <h3 class="text-lg font-semibold mb-2">Quarter Forecast</h3>
          <p class="text-2xl font-bold text-blue-600">{formatCurrency(9750000)}</p>
          <p class="text-sm text-muted-foreground">95% confidence interval</p>
        </Card.Root>
        <Card.Root class="p-6">
          <h3 class="text-lg font-semibold mb-2">Year-End Projection</h3>
          <p class="text-2xl font-bold text-purple-600">{formatCurrency(42000000)}</p>
          <p class="text-sm text-muted-foreground">Based on current trends</p>
        </Card.Root>
      </div>
    </Tabs.Content>

    <Tabs.Content value="team" class="space-y-6">
      <Card.Root class="p-6">
        <canvas id="teamPerformanceChart"></canvas>
      </Card.Root>
    </Tabs.Content>
  </Tabs.Root>

  <!-- Goals and AI Insights -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Goal Tracking -->
    <Card.Root class="p-6">
      <h3 class="text-lg font-semibold mb-6 flex items-center gap-2">
        <Target class="h-5 w-5" />
        Goal Progress
      </h3>
      <div class="space-y-6">
        {#each goals as goal}
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="font-medium">{goal.name}</span>
              <span class="text-sm text-muted-foreground">
                {goal.current.toLocaleString()} / {goal.target.toLocaleString()}
              </span>
            </div>
            <Progress value={goal.progress} class="h-2" />
            <div class="flex justify-between items-center mt-1">
              <span class="text-sm text-muted-foreground">{formatPercentage(goal.progress)} complete</span>
              <Badge variant={goal.progress >= 90 ? 'default' : goal.progress >= 75 ? 'secondary' : 'destructive'}>
                {goal.progress >= 90 ? 'On Track' : goal.progress >= 75 ? 'At Risk' : 'Behind'}
              </Badge>
            </div>
          </div>
        {/each}
      </div>
    </Card.Root>

    <!-- AI Insights -->
    <Card.Root class="p-6">
      <h3 class="text-lg font-semibold mb-6 flex items-center gap-2">
        <Sparkles class="h-5 w-5" />
        AI-Powered Insights
      </h3>
      <div class="space-y-4">
        {#each aiInsights as insight}
        {@const Icon = getInsightIcon(insight.type)}
          <div class="border rounded-lg p-4">
            <div class="flex items-start gap-3">
              <div class={`p-2 rounded-full ${getInsightColor(insight.type)}`}>
                <Icon class="h-4 w-4" />
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-semibold">{insight.title}</h4>
                  <Badge variant="outline" class={getImpactColor(insight.impact)}>
                    {insight.impact} Impact
                  </Badge>
                </div>
                <p class="text-sm text-muted-foreground mb-2">{insight.description}</p>
                <p class="text-sm font-medium text-primary">{insight.action}</p>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </Card.Root>
  </div>

  <!-- Filters Dialog -->
  <Dialog.Root bind:open={showFilters}>
    <Dialog.Content class="max-w-2xl">
      <Dialog.Header>
        <Dialog.Title>Advanced Filters</Dialog.Title>
        <Dialog.Description>
          Customize your analytics view with advanced filtering options
        </Dialog.Description>
      </Dialog.Header>

      <div class="space-y-6">
        <!-- Team Members -->
        <div>
          <Label class="text-base font-semibold">Team Members</Label>
          <div class="grid grid-cols-2 gap-2 mt-2">
            {#each teamMembers as member}
              <div class="flex items-center space-x-2">
                <Checkbox
                  id={member}
                  checked={selectedTeamMembers.includes(member)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      selectedTeamMembers = [...selectedTeamMembers, member];
                    } else {
                      selectedTeamMembers = selectedTeamMembers.filter(m => m !== member);
                    }
                  }}
                />
                <Label for={member} class="text-sm">{member}</Label>
              </div>
            {/each}
          </div>
        </div>

        <!-- Metrics -->
        <div>
          <Label class="text-base font-semibold">Metrics to Display</Label>
          <div class="grid grid-cols-2 gap-2 mt-2">
            {#each metrics as metric}
              <div class="flex items-center space-x-2">
                <Checkbox
                  id={metric.id}
                  checked={selectedMetrics.includes(metric.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      selectedMetrics = [...selectedMetrics, metric.id];
                    } else {
                      selectedMetrics = selectedMetrics.filter(m => m !== metric.id);
                    }
                  }}
                />
                <Label for={metric.id} class="text-sm flex items-center gap-2">
                  <metric.icon class="h-4 w-4" />
                  {metric.label}
                </Label>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <Dialog.Footer>
        <Button variant="outline" onclick={() => showFilters = false}>
          Cancel
        </Button>
        <Button onclick={() => { showFilters = false; refreshData(); }}>
          Apply Filters
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>

  <!-- Export Dialog -->
  <Dialog.Root bind:open={showExportDialog}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Export Analytics Data</Dialog.Title>
        <Dialog.Description>
          Choose your preferred export format and options
        </Dialog.Description>
      </Dialog.Header>

      <div class="space-y-4">
        <div class="grid grid-cols-3 gap-4">
          <Button variant="outline" onclick={() => exportData('pdf')}>
            <FileText class="h-4 w-4 mr-2" />
            PDF Report
          </Button>
          <Button variant="outline" onclick={() => exportData('csv')}>
            <Download class="h-4 w-4 mr-2" />
            CSV Data
          </Button>
          <Button variant="outline" onclick={() => exportData('excel')}>
            <FileText class="h-4 w-4 mr-2" />
            Excel File
          </Button>
        </div>

        <div class="flex items-center justify-between">
          <span>Include charts and visualizations</span>
          <Checkbox checked={true} />
        </div>

        <div class="flex items-center justify-between">
          <span>Include AI insights</span>
          <Checkbox checked={true} />
        </div>

        <Button onclick={() => showScheduleDialog = true} class="w-full">
          <Settings class="h-4 w-4 mr-2" />
          Schedule Automated Reports
        </Button>
      </div>

      <Dialog.Footer>
        <Button variant="outline" onclick={() => showExportDialog = false}>
          Cancel
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
          Set up automated report delivery to your team
        </Dialog.Description>
      </Dialog.Header>

      <div class="space-y-4">
        <div>
          <Label>Frequency</Label>
          <Select.Root>
            <Select.Trigger>
              <Select.Value placeholder="Select frequency" />
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
          <Label>Format</Label>
          <Select.Root>
            <Select.Trigger>
              <Select.Value placeholder="Select format" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="pdf">PDF Report</Select.Item>
              <Select.Item value="excel">Excel Spreadsheet</Select.Item>
              <Select.Item value="csv">CSV Data</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>

        <div>
          <Label>Recipients</Label>
          <Input placeholder="Enter email addresses (comma separated)" />
        </div>
      </div>

      <Dialog.Footer>
        <Button variant="outline" onclick={() => showScheduleDialog = false}>
          Cancel
        </Button>
        <Button onclick={() => scheduleReport('weekly', 'pdf', ['team@company.com'])}>
          Schedule Reports
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
</div>