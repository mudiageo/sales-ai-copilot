<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import { onMount } from 'svelte';

  const features = [
    {
      id: 'lead-intelligence',
      title: 'Lead Intelligence & Qualification',
      icon: 'i-lucide-users',
      description: 'Leverage AI to automatically score and qualify leads based on behavior patterns, engagement metrics, and historical data.',
      benefits: [
        'Reduce time spent on unqualified leads',
        'Increase conversion rates by 45%',
        'Prioritize high-value opportunities',
        'Predict customer lifetime value'
      ],
      roi: {
        metric: '45%',
        label: 'Higher Lead Conversion Rate'
      },
      image: 'https://images.pexels.com/photos/7567434/pexels-photo-7567434.jpeg'
    },
    {
      id: 'sales-coaching',
      title: 'Real-Time Sales Coaching',
      icon: 'i-lucide-presentation',
      description: 'Get instant feedback and suggestions during customer interactions with our AI-powered coaching system.',
      benefits: [
        'Improve call performance in real-time',
        'Learn from top performer patterns',
        'Reduce ramp-up time by 60%',
        'Consistent messaging across team'
      ],
      roi: {
        metric: '60%',
        label: 'Faster Sales Rep Onboarding'
      },
      image: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg'
    },
    {
      id: 'follow-up',
      title: 'Automated Follow-Up Engine',
      icon: 'i-lucide-mail',
      description: 'Never miss a follow-up with intelligent automation that knows when and how to engage prospects.',
      benefits: [
        'Increase response rates by 35%',
        'Save 15 hours per week per rep',
        'Personalized at scale',
        'Perfect timing optimization'
      ],
      roi: {
        metric: '35%',
        label: 'Higher Response Rates'
      },
      image: 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg'
    },
    {
      id: 'process-optimization',
      title: 'Sales Process Optimization',
      icon: 'i-lucide-settings',
      description: 'Continuously optimize your sales process with AI-driven insights and recommendations.',
      benefits: [
        'Reduce sales cycle by 30%',
        'Identify bottlenecks instantly',
        'Automate routine tasks',
        'Data-driven process improvements'
      ],
      roi: {
        metric: '30%',
        label: 'Shorter Sales Cycles'
      },
      image: 'https://images.pexels.com/photos/7681091/pexels-photo-7681091.jpeg'
    },
    {
      id: 'analytics',
      title: 'Analytics & Reporting',
      icon: 'i-lucide-bar-chart',
      description: 'Get deep insights into your sales performance with advanced analytics and predictive forecasting.',
      benefits: [
        'Accurate revenue forecasting',
        'Custom report builder',
        'Real-time dashboards',
        'Trend analysis'
      ],
      roi: {
        metric: '95%',
        label: 'Forecast Accuracy'
      },
      image: 'https://images.pexels.com/photos/7681089/pexels-photo-7681089.jpeg'
    },
    {
      id: 'integrations',
      title: 'Seamless Integrations',
      icon: 'i-lucide-plug',
      description: 'Connect with your favorite tools and CRM systems for a unified sales workflow.',
      benefits: [
        'Quick setup in minutes',
        'Bi-directional sync',
        '30+ integrations',
        'Custom API access'
      ],
      roi: {
        metric: '100%',
        label: 'Data Sync Accuracy'
      },
      image: 'https://images.pexels.com/photos/7688160/pexels-photo-7688160.jpeg'
    }
  ];

  const competitors = [
    {
      feature: 'AI Lead Scoring',
      us: true,
      competitor1: true,
      competitor2: false
    },
    {
      feature: 'Real-Time Coaching',
      us: true,
      competitor1: false,
      competitor2: false
    },
    {
      feature: 'Smart Follow-ups',
      us: true,
      competitor1: true,
      competitor2: true
    },
    {
      feature: 'Process Automation',
      us: true,
      competitor1: false,
      competitor2: true
    },
    {
      feature: 'Advanced Analytics',
      us: true,
      competitor1: true,
      competitor2: false
    },
    {
      feature: 'Custom Reporting',
      us: true,
      competitor1: false,
      competitor2: true
    }
  ];

  const integrations = [
    {
      name: 'Salesforce',
      logo: 'https://www.svgrepo.com/show/303161/salesforce-2-logo.svg'
    },
    {
      name: 'HubSpot',
      logo: 'https://www.svgrepo.com/show/303265/hubspot-logo.svg'
    },
    {
      name: 'Pipedrive',
      logo: 'https://www.svgrepo.com/show/354225/pipedrive.svg'
    },
    {
      name: 'Zoho',
      logo: 'https://www.svgrepo.com/show/354665/zoho.svg'
    }
  ];

  let demoEmail = '';
  let demoScore = 0;
  let demoLoading = false;

  const runDemo = () => {
    if (!demoEmail) return;
    demoLoading = true;
    setTimeout(() => {
      demoScore = Math.floor(Math.random() * 40) + 60;
      demoLoading = false;
    }, 1500);
  };

  let intersectionObserver: IntersectionObserver;

  onMount(() => {
    intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-visible');
        }
      });
    }, {
      threshold: 0.1
    });

    document.querySelectorAll('.fade-in').forEach((element) => {
      intersectionObserver.observe(element);
    });

    return () => {
      intersectionObserver.disconnect();
    };
  });
</script>

<!-- Hero Section -->
<section class="relative py-20 bg-gradient-to-b from-primary/5 to-background">
  <div class="container mx-auto px-4">
    <div class="text-center max-w-3xl mx-auto">
      <h1 class="text-4xl md:text-5xl font-bold mb-6">
        Powerful Features to Transform Your Sales
      </h1>
      <p class="text-xl text-muted-foreground mb-8">
        Discover how AI Sales Copilot helps you close more deals, faster.
      </p>
      <Button size="lg">Start Free Trial</Button>
    </div>
  </div>
</section>

<!-- Features Grid -->
<section class="py-20">
  <div class="container mx-auto px-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-16">
      {#each features as feature}
        <div class="fade-in">
          <div class="flex items-center gap-4 mb-6">
            <div class="bg-primary/10 p-3 rounded-lg">
              <span class={`${feature.icon} h-6 w-6 text-primary`}></span>
            </div>
            <h2 class="text-2xl font-bold">{feature.title}</h2>
          </div>
          
          <img
            src={feature.image}
            alt={feature.title}
            class="w-full rounded-lg shadow-lg mb-6 aspect-video object-cover"
          />
          
          <p class="text-muted-foreground mb-6">
            {feature.description}
          </p>
          
          <div class="bg-muted/50 rounded-lg p-6 mb-6">
            <h3 class="font-semibold mb-4">Key Benefits</h3>
            <ul class="space-y-2">
              {#each feature.benefits as benefit}
                <li class="flex items-center gap-2">
                  <span class="i-lucide-check text-primary"></span>
                  {benefit}
                </li>
              {/each}
            </ul>
          </div>
          
          <div class="bg-primary/5 rounded-lg p-6 text-center">
            <div class="text-3xl font-bold text-primary mb-2">
              {feature.roi.metric}
            </div>
            <div class="text-sm text-muted-foreground">
              {feature.roi.label}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Interactive Demo -->
<section class="py-20 bg-muted/50">
  <div class="container mx-auto px-4">
    <div class="text-center max-w-2xl mx-auto mb-12">
      <h2 class="text-3xl font-bold mb-4">Try Our Lead Scoring Demo</h2>
      <p class="text-muted-foreground">
        See how our AI instantly evaluates lead quality based on email patterns.
      </p>
    </div>
    
    <div class="max-w-md mx-auto">
      <div class="bg-card rounded-lg p-6 shadow-lg">
        <div class="mb-4">
          <label for="demo-email" class="block text-sm font-medium mb-2">
            Enter a business email
          </label>
          <input
            type="email"
            id="demo-email"
            bind:value={demoEmail}
            class="w-full p-2 rounded-md border"
            placeholder="john@company.com"
          />
        </div>
        
        <Button
          class="w-full"
          on:click={runDemo}
          disabled={demoLoading || !demoEmail}
        >
          {demoLoading ? 'Analyzing...' : 'Score Lead'}
        </Button>
        
        {#if demoScore > 0}
          <div class="mt-6 text-center">
            <div class="text-4xl font-bold text-primary mb-2">
              {demoScore}/100
            </div>
            <p class="text-sm text-muted-foreground">
              Lead Quality Score
            </p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>

<!-- Comparison Table -->
<section class="py-20">
  <div class="container mx-auto px-4">
    <div class="text-center max-w-2xl mx-auto mb-12">
      <h2 class="text-3xl font-bold mb-4">Feature Comparison</h2>
      <p class="text-muted-foreground">
        See how we stack up against the competition
      </p>
    </div>
    
    <div class="max-w-3xl mx-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Feature</TableHead>
            <TableHead>AI Sales Copilot</TableHead>
            <TableHead>Competitor A</TableHead>
            <TableHead>Competitor B</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each competitors as item}
            <TableRow>
              <TableCell>{item.feature}</TableCell>
              <TableCell>
                {#if item.us}
                  <span class="i-lucide-check text-primary"></span>
                {:else}
                  <span class="i-lucide-x text-muted-foreground"></span>
                {/if}
              </TableCell>
              <TableCell>
                {#if item.competitor1}
                  <span class="i-lucide-check text-primary"></span>
                {:else}
                  <span class="i-lucide-x text-muted-foreground"></span>
                {/if}
              </TableCell>
              <TableCell>
                {#if item.competitor2}
                  <span class="i-lucide-check text-primary"></span>
                {:else}
                  <span class="i-lucide-x text-muted-foreground"></span>
                {/if}
              </TableCell>
            </TableRow>
          {/each}
        </TableBody>
      </Table>
    </div>
  </div>
</section>

<!-- Integrations -->
<section class="py-20 bg-muted/50">
  <div class="container mx-auto px-4">
    <div class="text-center max-w-2xl mx-auto mb-12">
      <h2 class="text-3xl font-bold mb-4">Works With Your Tools</h2>
      <p class="text-muted-foreground">
        Seamlessly integrate with your favorite CRM and sales tools
      </p>
    </div>
    
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
      {#each integrations as integration}
        <div class="bg-background rounded-lg p-6 flex items-center justify-center">
          <img
            src={integration.logo}
            alt={integration.name}
            class="h-12 w-auto grayscale hover:grayscale-0 transition-all"
          />
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- CTA -->
<section class="py-20">
  <div class="container mx-auto px-4 text-center">
    <h2 class="text-3xl font-bold mb-6">Ready to Transform Your Sales?</h2>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <Button size="lg">Start Free Trial</Button>
      <Button variant="outline" size="lg">Schedule Demo</Button>
    </div>
  </div>
</section>

<style>
  .fade-in {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  }

  .fade-in-visible {
    opacity: 1;
    transform: translateY(0);
  }
</style>