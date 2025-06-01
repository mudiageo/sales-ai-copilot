<script lang="ts">
  import { Button } from '$lib/components/ui/button';

  export let tier: {
    name: string;
    price: string;
    description: string;
    features: string[];
    highlighted?: boolean;
  };
</script>

<div
  class="relative rounded-2xl border bg-card p-8 shadow-sm {tier.highlighted ? 'border-primary' : 'border-border'}"
>
  {#if tier.highlighted}
    <div class="absolute -top-4 right-8 inline-flex items-center rounded-full bg-primary px-4 py-1 text-sm text-primary-foreground">
      Most Popular
    </div>
  {/if}
  <div class="mb-8">
    <h3 class="text-xl font-semibold text-foreground">{tier.name}</h3>
    <p class="mt-4 text-sm text-muted-foreground">{tier.description}</p>
    <p class="mt-6">
      <span class="text-4xl font-bold tracking-tight text-foreground">{tier.price}</span>
      {#if tier.price !== 'Custom'}
        <span class="text-sm text-muted-foreground">/month</span>
      {/if}
    </p>
  </div>
  <ul class="space-y-4">
    {#each tier.features as feature}
      <li class="flex items-center">
        <span class="i-lucide-check h-5 w-5 text-primary"></span>
        <span class="ml-3 text-sm text-foreground">{feature}</span>
      </li>
    {/each}
  </ul>
  <Button
    href="/contact"
    variant={tier.highlighted ? 'default' : 'outline'}
    class="mt-8 w-full"
  >
    Get Started
  </Button>
</div>