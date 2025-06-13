<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let { 
    onSwipeLeft, 
    onSwipeRight, 
    onSwipeUp, 
    onSwipeDown,
    onPullToRefresh,
    threshold = 50,
    refreshThreshold = 100
  }: {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    onPullToRefresh?: () => Promise<void>;
    threshold?: number;
    refreshThreshold?: number;
  } = $props();

  let container: HTMLElement;
  let startX = 0;
  let startY = 0;
  let startTime = 0;
  let isRefreshing = false;
  let pullDistance = 0;
  let showRefreshIndicator = false;

  onMount(() => {
    if (!browser) return;

    let touchStartHandler = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
      pullDistance = 0;
    };

    let touchMoveHandler = (e: TouchEvent) => {
      if (isRefreshing) return;

      const touch = e.touches[0];
      const deltaY = touch.clientY - startY;

      // Handle pull-to-refresh
      if (onPullToRefresh && deltaY > 0 && window.scrollY === 0) {
        e.preventDefault();
        pullDistance = Math.min(deltaY, refreshThreshold * 1.5);
        showRefreshIndicator = pullDistance > refreshThreshold / 2;
        
        // Update refresh indicator position
        if (container) {
          container.style.transform = `translateY(${Math.min(pullDistance / 3, 50)}px)`;
        }
      }
    };

    let touchEndHandler = async (e: TouchEvent) => {
      if (isRefreshing) return;

      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      const endTime = Date.now();

      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;

      // Reset transform
      if (container) {
        container.style.transform = '';
      }

      // Handle pull-to-refresh
      if (onPullToRefresh && pullDistance > refreshThreshold && window.scrollY === 0) {
        isRefreshing = true;
        showRefreshIndicator = true;
        
        try {
          await onPullToRefresh();
        } finally {
          isRefreshing = false;
          showRefreshIndicator = false;
          pullDistance = 0;
        }
        return;
      }

      // Reset pull state
      showRefreshIndicator = false;
      pullDistance = 0;

      // Ignore if touch was too slow or too short
      if (deltaTime > 500 || (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold)) {
        return;
      }

      // Determine swipe direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > threshold && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < -threshold && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > threshold && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < -threshold && onSwipeUp) {
          onSwipeUp();
        }
      }
    };

    // Add event listeners
    container.addEventListener('touchstart', touchStartHandler, { passive: false });
    container.addEventListener('touchmove', touchMoveHandler, { passive: false });
    container.addEventListener('touchend', touchEndHandler, { passive: false });

    return () => {
      container?.removeEventListener('touchstart', touchStartHandler);
      container?.removeEventListener('touchmove', touchMoveHandler);
      container?.removeEventListener('touchend', touchEndHandler);
    };
  });
</script>

<div bind:this={container} class="gesture-container">
  <!-- Pull-to-refresh indicator -->
  {#if showRefreshIndicator}
    <div class="refresh-indicator">
      <div class="refresh-spinner" class:spinning={isRefreshing}>
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
      <span class="refresh-text">
        {isRefreshing ? 'Refreshing...' : pullDistance > refreshThreshold ? 'Release to refresh' : 'Pull to refresh'}
      </span>
    </div>
  {/if}

  <slot />
</div>

<style>
  .gesture-container {
    position: relative;
    height: 100%;
    overflow: hidden;
    transition: transform 0.2s ease-out;
  }

  .refresh-indicator {
    position: absolute;
    top: -60px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    background: hsl(var(--background));
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 100;
    transition: all 0.3s ease;
  }

  .refresh-spinner {
    color: hsl(var(--primary));
    transition: transform 0.3s ease;
  }

  .refresh-spinner.spinning {
    animation: spin 1s linear infinite;
  }

  .refresh-text {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
    white-space: nowrap;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* Show refresh indicator when pulling */
  .gesture-container:has(.refresh-indicator) {
    overflow: visible;
  }
</style>