<script lang="ts">
  import { Button } from '$lib/components/ui/button';
</script>

<div class="relative isolate overflow-hidden bg-background">
  <div class="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
    <div class="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
      <h1 class="mt-10 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
        Transform Your Sales with AI
      </h1>
      <p class="mt-6 text-lg leading-8 text-muted-foreground">
        Leverage the power of artificial intelligence to boost your sales performance, automate repetitive tasks,
        and gain valuable insights into your customer interactions.
      </p>
      <div class="mt-10 flex items-center gap-x-6">
        <Button href="/dashboard" size="lg">Get Started</Button>
        <Button href="/features" variant="outline" size="lg">Learn More</Button>
      </div>
    </div>
    <div class="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
      <div class="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
        <img
          src="https://images.pexels.com/photos/7567434/pexels-photo-7567434.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt="AI Sales Dashboard"
          class="w-[76rem] rounded-md bg-background/5 shadow-2xl ring-1 ring-foreground/10"
        />
      </div>
    </div>
  </div>
</div>