<script lang="ts">
  export let title: string;
  export let description: string;
  export let icon: string;
</script>

<div class="group relative bg-card rounded-lg p-6 shadow-md transition-all hover:shadow-lg">
  <div class="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-lg bg-primary/5 transition group-hover:block"></div>
  <div class="relative">
    <div class="inline-block rounded-lg bg-primary/10 p-3">
      <span class={`${icon} h-6 w-6 text-primary`}></span>
    </div>
    <h3 class="mt-4 text-xl font-semibold text-foreground">{title}</h3>
    <p class="mt-2 text-muted-foreground">{description}</p>
  </div>
</div>