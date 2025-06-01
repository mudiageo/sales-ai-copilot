<script lang="ts">
  import PricingCard from '$lib/components/PricingCard.svelte';

  const pricingTiers = [
    {
      name: 'Starter',
      price: '$29',
      description: 'Perfect for small teams getting started with AI-powered sales.',
      features: [
        'Basic AI features',
        '5 team members',
        'Basic analytics',
        'Email support'
      ]
    },
    {
      name: 'Professional',
      price: '$99',
      description: 'Advanced features for growing sales teams.',
      features: [
        'Advanced AI features',
        '20 team members',
        'Advanced analytics',
        'Priority support',
        'Custom integrations'
      ],
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'Custom solutions for large organizations.',
      features: [
        'Custom AI solutions',
        'Unlimited team members',
        'Custom analytics',
        '24/7 support',
        'Dedicated account manager',
        'On-premise deployment'
      ]
    }
  ];
</script>

<div class="min-h-screen bg-background">
  <main class="container mx-auto px-4 py-16">
    <h1 class="text-4xl font-bold text-center mb-12">Pricing Plans</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {#each pricingTiers as tier}
        <PricingCard {tier} />
      {/each}
    </div>
  </main>
</div>