<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Label } from '$lib/components/ui/label';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import { onMount } from 'svelte';

  let billingCycle = $state('monthly');
  let showSpecialOffer = $state(true);
  let calculatorValues = $state({
    currentRevenue: 100000,
    salesReps: 5,
    avgDealSize: 5000,
    dealsPerMonth: 10
  });

  const pricingTiers = [
    {
      name: 'Starter',
      monthlyPrice: 49,
      yearlyPrice: 39,
      description: 'Perfect for small teams getting started with AI-powered sales.',
      features: [
        'Basic AI lead scoring',
        '2 team members',
        'Email support',
        'Basic analytics',
        'Standard integrations',
        'Mobile app access'
      ],
      highlighted: false
    },
    {
      name: 'Professional',
      monthlyPrice: 99,
      yearlyPrice: 79,
      description: 'Advanced features for growing sales teams.',
      features: [
        'Advanced AI lead scoring',
        '10 team members',
        'Priority phone support',
        'Advanced analytics',
        'Custom integrations',
        'API access',
        'Sales forecasting',
        'Team performance tracking'
      ],
      highlighted: true
    },
    {
      name: 'Enterprise',
      monthlyPrice: 199,
      yearlyPrice: 159,
      description: 'Custom solutions for large organizations.',
      features: [
        'Custom AI models',
        'Unlimited team members',
        'Dedicated support',
        'Custom analytics',
        'Enterprise integrations',
        'Full API access',
        'Advanced security',
        'Custom training',
        'SLA guarantee'
      ],
      highlighted: false
    }
  ];

  const featureComparison = [
    { name: 'AI Lead Scoring', starter: true, professional: true, enterprise: true },
    { name: 'Team Members', starter: '2', professional: '10', enterprise: 'Unlimited' },
    { name: 'Email Support', starter: true, professional: true, enterprise: true },
    { name: 'Phone Support', starter: false, professional: true, enterprise: true },
    { name: 'Dedicated Support', starter: false, professional: false, enterprise: true },
    { name: 'Basic Analytics', starter: true, professional: true, enterprise: true },
    { name: 'Advanced Analytics', starter: false, professional: true, enterprise: true },
    { name: 'Custom Analytics', starter: false, professional: false, enterprise: true },
    { name: 'Standard Integrations', starter: true, professional: true, enterprise: true },
    { name: 'Custom Integrations', starter: false, professional: true, enterprise: true },
    { name: 'API Access', starter: false, professional: true, enterprise: true },
    { name: 'Mobile App', starter: true, professional: true, enterprise: true },
    { name: 'Sales Forecasting', starter: false, professional: true, enterprise: true },
    { name: 'Custom AI Models', starter: false, professional: false, enterprise: true },
    { name: 'SLA Guarantee', starter: false, professional: false, enterprise: true }
  ];

  const faqs = [
    {
      question: 'How does billing work?',
      answer: 'We bill monthly or annually, with a 20% discount for annual plans. You can upgrade, downgrade, or cancel at any time.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! We offer a 14-day free trial on all plans. No credit card required.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and wire transfers for enterprise customers.'
    },
    {
      question: 'Can I change plans later?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.'
    },
    {
      question: 'Do you offer refunds?',
      answer: "We offer a 30-day money-back guarantee. If you\'re not satisfied, we'll refund your payment."
    }
  ];

  function calculateROI() {
    const potentialIncrease = 0.35; // 35% average increase
    const currentMonthlyRevenue = 
      calculatorValues.dealsPerMonth * 
      calculatorValues.avgDealSize * 
      calculatorValues.salesReps;
    
    const potentialMonthlyRevenue = currentMonthlyRevenue * (1 + potentialIncrease);
    const annualIncrease = (potentialMonthlyRevenue - currentMonthlyRevenue) * 12;

    return {
      monthlyIncrease: potentialMonthlyRevenue - currentMonthlyRevenue,
      annualIncrease
    };
  }

   const roi = $derived.by(calculateROI)
  $effect(() => {
    // Auto-hide special offer after 10 seconds
    const timer = setTimeout(() => {
      showSpecialOffer = false;
    }, 10000);

    return () => clearTimeout(timer);
  });
</script>

<svelte:head>
  <title>Pricing - AI Sales Copilot</title>
  <meta name="description" content="Choose the perfect plan for your sales team. Start with our Starter plan or scale up to Enterprise." />
</svelte:head>

<div class="min-h-screen bg-background">
  {#if showSpecialOffer}
    <div class="bg-primary text-primary-foreground py-2 text-center relative">
      <p class="text-sm font-medium">
        🎉 Special offer: Get 3 months free with annual billing! Limited time only.
      </p>
      <Button
        class="absolute right-4 top-1/2 -translate-y-1/2 text-primary-foreground/80 hover:text-primary-foreground"
        onclick={() => showSpecialOffer = false}
      >
        <span class="sr-only">Close</span>
        <span class="i-lucide-x h-4 w-4"></span>
      </Button>
    </div>
  {/if}

  <main class="container mx-auto px-4 py-16">
    <div class="text-center mb-16">
      <h1 class="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
      <p class="text-xl text-muted-foreground mb-8">
        Choose the perfect plan for your team
      </p>

      <div class="flex items-center justify-center gap-4">
        <span class={billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}>
          Monthly
        </span>
        <Button
          class="relative w-12 h-6 bg-primary rounded-full transition-colors"
          onclick={() => billingCycle = billingCycle === 'monthly' ? 'yearly' : 'monthly'}
        >
          <span
            class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"
            style={`transform: translateX(${billingCycle === 'yearly' ? '24px' : '0'})`}
          ></span>
        </Button>
        <span class={billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}>
          Yearly (Save 20%)
        </span>
      </div>
    </div>

    <!-- Pricing Tiers -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
      {#each pricingTiers as tier}
        <div class={`relative rounded-xl border ${tier.highlighted ? 'border-primary' : 'border-border'} bg-card p-8`}>
          {#if tier.highlighted}
            <div class="absolute -top-4 right-8 bg-primary text-primary-foreground px-4 py-1 text-sm font-medium rounded-full">
              Most Popular
            </div>
          {/if}

          <h2 class="text-2xl font-bold mb-2">{tier.name}</h2>
          <p class="text-muted-foreground mb-4">{tier.description}</p>

          <div class="mb-6">
            <div class="flex items-end gap-2">
              <span class="text-4xl font-bold">
                ${billingCycle === 'monthly' ? tier.monthlyPrice : tier.yearlyPrice}
              </span>
              <span class="text-muted-foreground">/month</span>
            </div>
            {#if billingCycle === 'yearly'}
              <p class="text-sm text-primary mt-1">Save ${(tier.monthlyPrice - tier.yearlyPrice) * 12}/year</p>
            {/if}
          </div>

          <ul class="space-y-3 mb-8">
            {#each tier.features as feature}
              <li class="flex items-center gap-2">
                <span class="i-lucide-check text-primary"></span>
                <span>{feature}</span>
              </li>
            {/each}
          </ul>

          <Button
            variant={tier.highlighted ? 'default' : 'outline'}
            class="w-full"
            size="lg"
          >
            {tier.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
          </Button>
        </div>
      {/each}
    </div>

    <!-- ROI Calculator -->
    <div class="max-w-3xl mx-auto mb-16 bg-card border rounded-xl p-8">
      <h2 class="text-2xl font-bold mb-6">ROI Calculator</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="space-y-4">
          <div>
            <Label class="block text-sm font-medium mb-2">
              Current Monthly Revenue
            </Label>
            <input
              type="number"
              bind:value={calculatorValues.currentRevenue}
              class="w-full p-2 rounded-md border"
            />
          </div>
          <div>
            <Label class="block text-sm font-medium mb-2">
              Number of Sales Reps
            </Label>
            <input
              type="number"
              bind:value={calculatorValues.salesReps}
              class="w-full p-2 rounded-md border"
            />
          </div>
          <div>
            <Label class="block text-sm font-medium mb-2">
              Average Deal Size
            </Label>
            <input
              type="number"
              bind:value={calculatorValues.avgDealSize}
              class="w-full p-2 rounded-md border"
            />
          </div>
          <div>
            <Label class="block text-sm font-medium mb-2">
              Deals per Month per Rep
            </Label>
            <input
              type="number"
              bind:value={calculatorValues.dealsPerMonth}
              class="w-full p-2 rounded-md border"
            />
          </div>
        </div>

        <div class="bg-muted/50 rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4">Potential Revenue Increase</h3>
       
          <div class="space-y-4">
            <div>
              <div class="text-sm text-muted-foreground">Monthly Increase</div>
              <div class="text-2xl font-bold text-primary">
                ${roi.monthlyIncrease.toLocaleString()}
              </div>
            </div>
            <div>
              <div class="text-sm text-muted-foreground">Annual Increase</div>
              <div class="text-2xl font-bold text-primary">
                ${roi.annualIncrease.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Feature Comparison -->
    <div class="mb-16">
      <h2 class="text-2xl font-bold text-center mb-8">Feature Comparison</h2>
      <div class="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Feature</TableHead>
              <TableHead>Starter</TableHead>
              <TableHead>Professional</TableHead>
              <TableHead>Enterprise</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {#each featureComparison as feature}
              <TableRow>
                <TableCell>{feature.name}</TableCell>
                <TableCell>
                  {#if typeof feature.starter === 'boolean'}
                    <span class={feature.starter ? 'i-lucide-check text-primary' : 'i-lucide-x text-muted-foreground'}></span>
                  {:else}
                    {feature.starter}
                  {/if}
                </TableCell>
                <TableCell>
                  {#if typeof feature.professional === 'boolean'}
                    <span class={feature.professional ? 'i-lucide-check text-primary' : 'i-lucide-x text-muted-foreground'}></span>
                  {:else}
                    {feature.professional}
                  {/if}
                </TableCell>
                <TableCell>
                  {#if typeof feature.enterprise === 'boolean'}
                    <span class={feature.enterprise ? 'i-lucide-check text-primary' : 'i-lucide-x text-muted-foreground'}></span>
                  {:else}
                    {feature.enterprise}
                  {/if}
                </TableCell>
              </TableRow>
            {/each}
          </TableBody>
        </Table>
      </div>
    </div>

    <!-- Trust Signals -->
    <div class="text-center mb-16">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
        <div class="flex flex-col items-center">
          <span class="i-lucide-shield-check h-8 w-8 text-primary mb-2"></span>
          <div class="font-medium">SOC 2 Certified</div>
        </div>
        <div class="flex flex-col items-center">
          <span class="i-lucide-timer h-8 w-8 text-primary mb-2"></span>
          <div class="font-medium">99.9% Uptime</div>
        </div>
        <div class="flex flex-col items-center">
          <span class="i-lucide-refresh-ccw h-8 w-8 text-primary mb-2"></span>
          <div class="font-medium">30-Day Guarantee</div>
        </div>
        <div class="flex flex-col items-center">
          <span class="i-lucide-lock h-8 w-8 text-primary mb-2"></span>
          <div class="font-medium">GDPR Compliant</div>
        </div>
      </div>
    </div>

    <!-- FAQ -->
    <div class="max-w-3xl mx-auto mb-16">
      <h2 class="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
      <div class="space-y-6">
        {#each faqs as faq}
          <div class="bg-card border rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-2">{faq.question}</h3>
            <p class="text-muted-foreground">{faq.answer}</p>
          </div>
        {/each}
      </div>
    </div>

    <!-- Enterprise CTA -->
    <div class="text-center bg-muted/50 rounded-xl p-8 mb-16">
      <h2 class="text-2xl font-bold mb-4">Need a Custom Solution?</h2>
      <p class="text-muted-foreground mb-6">
        Let's discuss how we can help your enterprise sales team succeed.
      </p>
      <Button size="lg" variant="default">Contact Sales</Button>
    </div>
  </main>
</div>