<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let {
    hasMore = true,
    loading = false,
    threshold = 100,
    onLoadMore
  }: {
    hasMore?: boolean;
    loading?: boolean;
    threshold?: number;
    onLoadMore: () => Promise<void>;
  } = $props();

  let container: HTMLElement;
  let observer: IntersectionObserver;

  onMount(() => {
    if (!browser) return;

    // Create intersection observer for infinite scroll
    observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !loading) {
          try {
            await onLoadMore();
          } catch (error) {
            console.error('Failed to load more items:', error);
          }
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0.1
      }
    );

    if (container) {
      observer.observe(container);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  });
</script>

<div bind:this={container} class="infinite-scroll-trigger">
  {#if loading}
    <div class="loading-indicator">
      <div class="loading-spinner">
        <svg class="animate-spin w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25" />
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" class="opacity-75" />
        </svg>
      </div>
      <span class="loading-text">Loading more...</span>
    </div>
  {:else if !hasMore}
    <div class="end-indicator">
      <span class="end-text">No more items to load</span>
    </div>
  {/if}
</div>

<style>
  .infinite-scroll-trigger {
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60px;
  }

  .loading-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: hsl(var(--muted-foreground));
  }

  .loading-spinner {
    color: hsl(var(--primary));
  }

  .loading-text {
    font-size: 14px;
    font-weight: 500;
  }

  .end-indicator {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }

  .end-text {
    font-size: 14px;
    color: hsl(var(--muted-foreground));
    text-align: center;
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .infinite-scroll-trigger {
      padding: 16px;
      min-height: 50px;
    }

    .loading-text,
    .end-text {
      font-size: 13px;
    }
  }
</style>