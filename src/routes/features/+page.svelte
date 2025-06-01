<script lang="ts">
  import FeatureCard from '$lib/components/FeatureCard.svelte';

  const features = [
    {
      title: 'AI-Powered Analytics',
      description: 'Get deep insights into your sales performance with machine learning algorithms',
      icon: 'i-lucide-bar-chart-2'
    },
    {
      title: 'Smart Lead Scoring',
      description: 'Automatically prioritize leads based on likelihood to convert',
      icon: 'i-lucide-target'
    },
    {
      title: 'Voice Intelligence',
      description: 'Convert customer calls into actionable insights',
      icon: 'i-lucide-mic'
    },
    {
      title: 'Automated Follow-ups',
      description: 'Never miss a follow-up with AI-powered scheduling',
      icon: 'i-lucide-calendar'
    },
    {
      title: 'Sales Forecasting',
      description: 'Predict future sales with advanced ML models',
      icon: 'i-lucide-trending-up'
    },
    {
      title: 'Team Collaboration',
      description: 'Work together seamlessly with built-in collaboration tools',
      icon: 'i-lucide-users'
    }
  ];
</script>

<div class="min-h-screen bg-background">
  <main class="container mx-auto px-4 py-16">
    <h1 class="text-4xl font-bold text-center mb-8">Features</h1>
    <p class="text-xl text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
      Discover how AI Sales Copilot can transform your sales process with cutting-edge features
    </p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each features as feature}
        <FeatureCard {...feature} />
      {/each}
    </div>
  </main>
</div>