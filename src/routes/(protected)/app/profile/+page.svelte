<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Card } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Progress } from '$lib/components/ui/progress';
  import User from "@lucide/svelte/icons/user";
  import Edit from "@lucide/svelte/icons/edit";
  import Camera from "@lucide/svelte/icons/camera";
  import Trophy from "@lucide/svelte/icons/trophy";
  import Target from "@lucide/svelte/icons/target";
  import TrendingUp from "@lucide/svelte/icons/trending-up";
  import Calendar from "@lucide/svelte/icons/calendar";
  import Phone from "@lucide/svelte/icons/phone";
  import Mail from "@lucide/svelte/icons/mail";

  // Mock user data
  const userData = {
    name: 'John Doe',
    email: 'john.doe@company.com',
    title: 'Senior Sales Representative',
    department: 'Sales',
    phone: '+1 (555) 123-4567',
    joinDate: '2023-01-15',
    avatar: null
  };

  const performanceStats = {
    dealsWon: 42,
    revenue: 850000,
    conversionRate: 35.2,
    avgDealSize: 20238,
    rank: 2,
    totalReps: 15
  };

  const goals = [
    {
      name: 'Monthly Revenue',
      current: 85000,
      target: 100000,
      progress: 85
    },
    {
      name: 'Deals Closed',
      current: 8,
      target: 12,
      progress: 67
    },
    {
      name: 'New Leads',
      current: 45,
      target: 50,
      progress: 90
    }
  ];

  const recentActivity = [
    { type: 'deal', description: 'Closed deal with TechCorp Inc.', time: '2 hours ago', value: 25000 },
    { type: 'call', description: 'Follow-up call with InnovateX', time: '4 hours ago' },
    { type: 'email', description: 'Sent proposal to GrowthMax', time: '1 day ago' },
    { type: 'meeting', description: 'Demo with StartupXYZ', time: '2 days ago' }
  ];

  const achievements = [
    { name: 'Top Performer', description: 'Highest revenue this quarter', icon: Trophy },
    { name: 'Deal Closer', description: 'Closed 10+ deals this month', icon: Target },
    { name: 'Rising Star', description: '50% increase in performance', icon: TrendingUp }
  ];

  let isEditing = $state(false);
  let editedData = $state({ ...userData });

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function saveProfile() {
    // Save logic here
    Object.assign(userData, editedData);
    isEditing = false;
  }

  function cancelEdit() {
    editedData = { ...userData };
    isEditing = false;
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold">Profile</h1>
      <p class="text-muted-foreground">Manage your profile and view your performance</p>
    </div>
    <Button onclick={() => isEditing = !isEditing}>
      <Edit class="h-4 w-4 mr-2" />
      {isEditing ? 'Cancel' : 'Edit Profile'}
    </Button>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Profile Information -->
    <div class="lg:col-span-1 space-y-6">
      <Card class="p-6">
        <div class="text-center">
          <div class="relative inline-block mb-4">
            <div class="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
              <User class="h-12 w-12 text-primary-foreground" />
            </div>
            {#if isEditing}
              <Button size="icon" variant="outline" class="absolute -bottom-2 -right-2 rounded-full">
                <Camera class="h-4 w-4" />
              </Button>
            {/if}
          </div>

          {#if isEditing}
            <div class="space-y-4">
              <Input bind:value={editedData.name} placeholder="Full Name" />
              <Input bind:value={editedData.email} placeholder="Email" type="email" />
              <Input bind:value={editedData.title} placeholder="Job Title" />
              <Input bind:value={editedData.department} placeholder="Department" />
              <Input bind:value={editedData.phone} placeholder="Phone" />
              <div class="flex gap-2">
                <Button onclick={saveProfile} class="flex-1">Save</Button>
                <Button variant="outline" onclick={cancelEdit} class="flex-1">Cancel</Button>
              </div>
            </div>
          {:else}
            <h2 class="text-xl font-bold">{userData.name}</h2>
            <p class="text-muted-foreground">{userData.title}</p>
            <p class="text-sm text-muted-foreground">{userData.department}</p>

            <div class="mt-4 space-y-2 text-sm">
              <div class="flex items-center gap-2">
                <Mail class="h-4 w-4" />
                <span>{userData.email}</span>
              </div>
              <div class="flex items-center gap-2">
                <Phone class="h-4 w-4" />
                <span>{userData.phone}</span>
              </div>
              <div class="flex items-center gap-2">
                <Calendar class="h-4 w-4" />
                <span>Joined {formatDate(userData.joinDate)}</span>
              </div>
            </div>
          {/if}
        </div>
      </Card>

      <!-- Performance Stats -->
      <Card class="p-6">
        <h3 class="font-semibold mb-4">Performance Overview</h3>
        <div class="space-y-4">
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">Deals Won</span>
            <span class="font-medium">{performanceStats.dealsWon}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">Revenue</span>
            <span class="font-medium">{formatCurrency(performanceStats.revenue)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">Conversion Rate</span>
            <span class="font-medium">{performanceStats.conversionRate}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">Avg Deal Size</span>
            <span class="font-medium">{formatCurrency(performanceStats.avgDealSize)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">Team Rank</span>
            <Badge variant="outline">#{performanceStats.rank} of {performanceStats.totalReps}</Badge>
          </div>
        </div>
      </Card>

      <!-- Achievements -->
      <Card class="p-6">
        <h3 class="font-semibold mb-4">Achievements</h3>
        <div class="space-y-3">
          {#each achievements as achievement}
            <div class="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
              <achievement.icon class="h-6 w-6 text-primary" />
              <div>
                <p class="font-medium text-sm">{achievement.name}</p>
                <p class="text-xs text-muted-foreground">{achievement.description}</p>
              </div>
            </div>
          {/each}
        </div>
      </Card>
    </div>

    <!-- Main Content -->
    <div class="lg:col-span-2 space-y-6">
      <!-- Goals Progress -->
      <Card class="p-6">
        <h3 class="font-semibold mb-6">Goals Progress</h3>
        <div class="space-y-6">
          {#each goals as goal}
            <div>
              <div class="flex justify-between mb-2">
                <span class="font-medium">{goal.name}</span>
                <span class="text-sm text-muted-foreground">
                  {goal.current.toLocaleString()} / {goal.target.toLocaleString()}
                </span>
              </div>
              <Progress value={goal.progress} class="h-2" />
              <div class="text-right mt-1">
                <span class="text-sm font-medium">{goal.progress}%</span>
              </div>
            </div>
          {/each}
        </div>
      </Card>

      <!-- Recent Activity -->
      <Card class="p-6">
        <h3 class="font-semibold mb-6">Recent Activity</h3>
        <div class="space-y-4">
          {#each recentActivity as activity}
            <div class="flex items-start gap-3 p-4 border rounded-lg">
              {#if activity.type === 'deal'}
                <Target class="h-5 w-5 text-green-500 mt-0.5" />
              {:else if activity.type === 'call'}
                <Phone class="h-5 w-5 text-blue-500 mt-0.5" />
              {:else if activity.type === 'email'}
                <Mail class="h-5 w-5 text-purple-500 mt-0.5" />
              {:else}
                <Calendar class="h-5 w-5 text-orange-500 mt-0.5" />
              {/if}
              <div class="flex-1">
                <p class="font-medium">{activity.description}</p>
                <div class="flex items-center justify-between mt-1">
                  <span class="text-sm text-muted-foreground">{activity.time}</span>
                  {#if activity.value}
                    <Badge variant="outline" class="text-green-600">
                      {formatCurrency(activity.value)}
                    </Badge>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      </Card>
    </div>
  </div>
</div>