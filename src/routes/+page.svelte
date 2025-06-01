<script lang="ts">
  import Hero from '$lib/components/Hero.svelte';
  import FeatureCard from '$lib/components/FeatureCard.svelte';
</script>

<div class="min-h-screen bg-background">
  <Hero />
  
  <main class="container mx-auto px-4 py-16">
    <h2 class="text-3xl font-bold text-center mb-12">Key Features</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <FeatureCard
        title="Smart Analytics"
        description="Get real-time insights into your sales performance with AI-powered analytics"
        icon="i-lucide-bar-chart"
      />
      <FeatureCard
        title="AI Assistant"
        description="Let AI help you close more deals efficiently with intelligent suggestions"
        icon="i-lucide-bot"
      />
      <FeatureCard
        title="Voice Intelligence"
        description="Convert speech to actionable sales data with advanced voice recognition"
        icon="i-lucide-mic"
      />
    </div>
  </main>
</div>