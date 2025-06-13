<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import Download from "@lucide/svelte/icons/download";
  import TrendingUp from "@lucide/svelte/icons/trending-up";
  import TrendingDown from "@lucide/svelte/icons/trending-down";
  import Target from "@lucide/svelte/icons/target";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import Users from "@lucide/svelte/icons/users";
  import DollarSign from "@lucide/svelte/icons/dollar-sign";
  import Activity from "@lucide/svelte/icons/activity";
  import Calendar from "@lucide/svelte/icons/calendar";

  // Mock analytics data
  const metrics = {
    totalRevenue: 2500000,
    totalLeads: 1247,
    conversionRate: 32.5,
    avgDealSize: 15000,
    salesCycle: 28,
    winRate: 65
  };

  const teamPerformance = [
    { name: 'Sarah Chen', deals: 42, revenue: 850000 },
    { name: 'Michael Rodriguez', deals: 38, revenue: 720000 },
    { name: 'Emily Taylor', deals: 35, revenue: 680000 },
    { name: 'David Kim', deals: 31, revenue: 590000 }
  ];

  const aiInsights = [
    {
      type: 'opportunity',
      title: 'High-Value Lead Segment Identified',
      description: 'Enterprise leads from technology sector show 40% higher conversion rates',
      impact: 'high'
    },
    {
      type: 'warning',
      title: 'Conversion Rate Declining',
      description: 'Lead to opportunity conversion dropped 15% this month',
      impact: 'medium'
    },
    {
      type: 'insight',
      title: 'Optimal Contact Time Discovered',
      description: 'Calls made between 10-11 AM have 25% higher success rate',
      impact: 'medium'
    }
  ];

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

  function getInsightColor(type: string) {
    switch (type) {
      case 'opportunity': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'insight': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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
      <Button variant="outline">
        <Download class="h-4 w-4 mr-2" />
        Export Report
      </Button>
    </div>
  </div>

  <!-- KPI Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
    <Card class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Total Revenue</p>
          <p class="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
          <div class="flex items-center mt-2">
            <TrendingUp class="h-4 w-4 text-green-600 mr-1" />
            <span class="text-sm text-green-600">+12.5%</span>
          </div>
        </div>
        <DollarSign class="h-8 w-8 text-muted-foreground" />
      </div>
    </Card>

    <Card class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Total Leads</p>
          <p class="text-2xl font-bold">{formatNumber(metrics.totalLeads)}</p>
          <div class="flex items-center mt-2">
            <TrendingUp class="h-4 w-4 text-green-600 mr-1" />
            <span class="text-sm text-green-600">+8.3%</span>
          </div>
        </div>
        <Users class="h-8 w-8 text-muted-foreground" />
      </div>
    </Card>

    <Card class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Conversion Rate</p>
          <p class="text-2xl font-bold">{metrics.conversionRate}%</p>
          <div class="flex items-center mt-2">
            <TrendingDown class="h-4 w-4 text-red-600 mr-1" />
            <span class="text-sm text-red-600">-2.1%</span>
          </div>
        </div>
        <Target class="h-8 w-8 text-muted-foreground" />
      </div>
    </Card>

    <Card class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Avg Deal Size</p>
          <p class="text-2xl font-bold">{formatCurrency(metrics.avgDealSize)}</p>
          <div class="flex items-center mt-2">
            <TrendingUp class="h-4 w-4 text-green-600 mr-1" />
            <span class="text-sm text-green-600">+15.7%</span>
          </div>
        </div>
        <DollarSign class="h-8 w-8 text-muted-foreground" />
      </div>
    </Card>

    <Card class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Sales Cycle</p>
          <p class="text-2xl font-bold">{metrics.salesCycle} days</p>
          <div class="flex items-center mt-2">
            <TrendingDown class="h-4 w-4 text-green-600 mr-1" />
            <span class="text-sm text-green-600">-3 days</span>
          </div>
        </div>
        <Calendar class="h-8 w-8 text-muted-foreground" />
      </div>
    </Card>

    <Card class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Win Rate</p>
          <p class="text-2xl font-bold">{metrics.winRate}%</p>
          <div class="flex items-center mt-2">
            <TrendingUp class="h-4 w-4 text-green-600 mr-1" />
            <span class="text-sm text-green-600">+5.2%</span>
          </div>
        </div>
        <Target class="h-8 w-8 text-muted-foreground" />
      </div>
    </Card>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Charts Placeholder -->
    <Card class="p-6">
      <h2 class="text-lg font-semibold mb-4">Sales Performance Trends</h2>
      <div class="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
        <p class="text-muted-foreground">Chart visualization would be here</p>
      </div>
    </Card>

    <Card class="p-6">
      <h2 class="text-lg font-semibold mb-4">Revenue Forecasting</h2>
      <div class="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
        <p class="text-muted-foreground">Forecast chart would be here</p>
      </div>
    </Card>
  </div>

  <!-- Team Performance -->
  <Card class="p-6">
    <h2 class="text-lg font-semibold mb-6">Team Performance</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {#each teamPerformance as member}
        <div class="p-4 border rounded-lg">
          <h3 class="font-medium">{member.name}</h3>
          <div class="mt-2 space-y-1">
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Deals:</span>
              <span>{member.deals}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Revenue:</span>
              <span>{formatCurrency(member.revenue)}</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </Card>

  <!-- AI Insights -->
  <Card class="p-6">
    <h2 class="text-lg font-semibold mb-6 flex items-center gap-2">
      <Sparkles class="h-5 w-5" />
      AI-Powered Insights
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      {#each aiInsights as insight}
        <div class="border rounded-lg p-4">
          <div class="flex items-start gap-3">
            <div class={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
              <Sparkles class="h-4 w-4" />
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <h4 class="font-semibold">{insight.title}</h4>
                <Badge variant="outline" class="text-xs">
                  {insight.impact} impact
                </Badge>
              </div>
              <p class="text-sm text-muted-foreground">{insight.description}</p>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </Card>
</div>