<script lang="ts">
  export let size: 'sm' | 'md' | 'lg' = 'md';
  
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };
</script>

<div class="flex items-center justify-center">
  <div class={`${sizes[size]} animate-spin rounded-full border-4 border-primary border-t-transparent`}></div>
</div>