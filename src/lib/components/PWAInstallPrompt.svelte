<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import { pwaManager, pwaUtils } from '$lib/utils/pwa';
  import { toast } from 'svelte-sonner';
  import Download from "@lucide/svelte/icons/download";
  import Smartphone from "@lucide/svelte/icons/smartphone";
  import X from "@lucide/svelte/icons/x";

  let showInstallPrompt = $state(false);
  let showInstructions = $state(false);
  let pwaState = $state({
    isInstallable: false,
    isInstalled: false,
    isStandalone: false
  });

  onMount(() => {
    const unsubscribe = pwaManager.getState().subscribe(state => {
      pwaState = state;
      
      // Show install prompt if app is installable and not already installed
      if (state.isInstallable && !state.isInstalled && !localStorage.getItem('pwa-install-dismissed')) {
        // Delay showing prompt to avoid interrupting user
        setTimeout(() => {
          showInstallPrompt = true;
        }, 3000);
      }
    });

    return unsubscribe;
  });

  async function installApp() {
    try {
      const installed = await pwaManager.installApp();
      if (installed) {
        showInstallPrompt = false;
        toast.success('App installed successfully!');
      } else {
        // Show manual instructions if automatic install failed
        showInstructions = true;
      }
    } catch (error) {
      console.error('Install failed:', error);
      showInstructions = true;
    }
  }

  function dismissPrompt() {
    showInstallPrompt = false;
    localStorage.setItem('pwa-install-dismissed', 'true');
  }

  function showManualInstructions() {
    showInstallPrompt = false;
    showInstructions = true;
  }

  let installInstructions = $derived(pwaUtils.getInstallInstructions());
</script>

<!-- Install Prompt Banner -->
{#if showInstallPrompt && !pwaState.isInstalled}
  <div class="install-banner fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground p-4 shadow-lg">
    <div class="flex items-center justify-between max-w-md mx-auto">
      <div class="flex items-center gap-3">
        <Smartphone class="h-5 w-5" />
        <div>
          <p class="font-medium text-sm">Install AI Sales Copilot</p>
          <p class="text-xs opacity-90">Get the full app experience</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="secondary" size="sm" onclick={installApp}>
          Install
        </Button>
        <Button variant="ghost" size="icon" onclick={dismissPrompt}>
          <X class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
{/if}

<!-- Install Instructions Dialog -->
<Dialog.Root bind:open={showInstructions}>
  <Dialog.Content class="max-w-sm">
    <Dialog.Header>
      <Dialog.Title class="flex items-center gap-2">
        <Download class="h-5 w-5" />
        Install App
      </Dialog.Title>
      <Dialog.Description>
        Follow these steps to install AI Sales Copilot on your device
      </Dialog.Description>
    </Dialog.Header>

    <div class="space-y-4">
      <div class="text-center">
        <Smartphone class="h-12 w-12 mx-auto mb-2 text-primary" />
        <p class="font-medium">{installInstructions.browser}</p>
      </div>

      <ol class="space-y-3">
        {#each installInstructions.steps as step, index}
          <li class="flex gap-3">
            <span class="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
              {index + 1}
            </span>
            <span class="text-sm">{step}</span>
          </li>
        {/each}
      </ol>

      <div class="bg-muted p-3 rounded-lg">
        <p class="text-xs text-muted-foreground">
          <strong>Benefits of installing:</strong>
          <br />• Faster loading and offline access
          <br />• Push notifications for important updates
          <br />• Native app experience
          <br />• Quick access from home screen
        </p>
      </div>
    </div>

    <Dialog.Footer>
      <Button variant="outline" onclick={() => showInstructions = false}>
        Maybe Later
      </Button>
      <Button onclick={() => showInstructions = false}>
        Got It
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- Floating Install Button (for supported browsers) -->
{#if pwaState.isInstallable && !pwaState.isInstalled && !showInstallPrompt}
  <Button
    class="fixed bottom-20 right-4 z-40 rounded-full shadow-lg"
    size="icon"
    onclick={installApp}
    title="Install App"
  >
    <Download class="h-5 w-5" />
  </Button>
{/if}

<style>
  .install-banner {
    animation: slideDown 0.3s ease-out;
  }

  @keyframes slideDown {
    from {
      transform: translateY(-100%);
    }
    to {
      transform: translateY(0);
    }
  }

  /* Adjust content padding when banner is shown */
  :global(body:has(.install-banner)) {
    padding-top: 80px;
  }
</style>