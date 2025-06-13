<script lang="ts">
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { cameraManager } from '$lib/utils/camera';
  import { geolocationManager } from '$lib/utils/geolocation';
  import { notificationManager } from '$lib/utils/notifications';
  import { toast } from 'svelte-sonner';
  
  // Icons
  import Home from "@lucide/svelte/icons/home";
  import Users from "@lucide/svelte/icons/users";
  import GitBranch from "@lucide/svelte/icons/git-branch";
  import Mic from "@lucide/svelte/icons/mic";
  import User from "@lucide/svelte/icons/user";
  import Camera from "@lucide/svelte/icons/camera";
  import MapPin from "@lucide/svelte/icons/map-pin";
  import Plus from "@lucide/svelte/icons/plus";

  let { currentView }: { currentView: string } = $props();

  // Navigation items for mobile
  const mobileNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/app', badge: 0 },
    { id: 'leads', label: 'Leads', icon: Users, href: '/app/leads', badge: 3 },
    { id: 'pipeline', label: 'Pipeline', icon: GitBranch, href: '/app/pipeline', badge: 0 },
    { id: 'coaching', label: 'Coach', icon: Mic, href: '/app/coaching', badge: 0 },
    { id: 'profile', label: 'Profile', icon: User, href: '/app/profile', badge: 0 }
  ];

  // Quick action items
  const quickActions = [
    { 
      id: 'scan-card', 
      label: 'Scan Card', 
      icon: Camera, 
      action: scanBusinessCard 
    },
    { 
      id: 'check-in', 
      label: 'Check In', 
      icon: MapPin, 
      action: checkIn 
    },
    { 
      id: 'new-lead', 
      label: 'New Lead', 
      icon: Plus, 
      action: createNewLead 
    }
  ];

  function navigateTo(href: string) {
    window.location.href = href;
  }

  async function scanBusinessCard() {
    try {
      const hasPermission = await cameraManager.requestPermissions();
      if (!hasPermission) {
        toast.error('Camera permission required to scan business cards');
        return;
      }

      toast.success('Opening camera for business card scanning...');
      const businessCard = await cameraManager.scanBusinessCard();
      
      if (businessCard) {
        // Navigate to leads page with scanned data
        const params = new URLSearchParams({
          action: 'new',
          name: businessCard.name || '',
          company: businessCard.company || '',
          title: businessCard.title || '',
          email: businessCard.email || '',
          phone: businessCard.phone || ''
        });
        window.location.href = `/app/leads?${params.toString()}`;
      }
    } catch (error) {
      console.error('Business card scanning failed:', error);
      toast.error('Failed to scan business card');
    }
  }

  async function checkIn() {
    try {
      const hasPermission = await geolocationManager.requestPermissions();
      if (!hasPermission) {
        toast.error('Location permission required for check-ins');
        return;
      }

      toast.success('Getting your location...');
      const checkInResult = await geolocationManager.checkIn();
      
      if (checkInResult) {
        toast.success(`Checked in at ${checkInResult.address || 'current location'}`);
        
        // Send notification to team
        await notificationManager.show({
          title: 'Team Check-in',
          body: `You checked in at ${checkInResult.address || 'a location'}`,
          tag: 'checkin'
        });
      } else {
        toast.error('Failed to get location for check-in');
      }
    } catch (error) {
      console.error('Check-in failed:', error);
      toast.error('Check-in failed');
    }
  }

  function createNewLead() {
    window.location.href = '/app/leads?action=new';
  }

  // Haptic feedback for mobile interactions
  async function hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
    if (window.Capacitor) {
      try {
        const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
        const style = type === 'light' ? ImpactStyle.Light : 
                    type === 'medium' ? ImpactStyle.Medium : ImpactStyle.Heavy;
        await Haptics.impact({ style });
      } catch (error) {
        console.log('Haptics not available:', error);
      }
    }
  }

  function handleNavClick(href: string) {
    hapticFeedback('light');
    navigateTo(href);
  }

  function handleQuickAction(action: () => void) {
    hapticFeedback('medium');
    action();
  }
</script>

<!-- Bottom Navigation -->
<nav class="bottom-nav bg-card border-t safe-area-bottom">
  <!-- Quick Actions Bar -->
  <div class="quick-actions flex justify-center gap-2 px-4 py-2 border-b">
    {#each quickActions as action}
      <Button
        variant="outline"
        size="sm"
        class="flex-1 flex-col gap-1 h-auto py-2"
        onclick={() => handleQuickAction(action.action)}
      >
        <action.icon class="h-4 w-4" />
        <span class="text-xs">{action.label}</span>
      </Button>
    {/each}
  </div>

  <!-- Main Navigation -->
  <div class="main-nav flex justify-around p-2">
    {#each mobileNavItems as item}
      <Button
        variant={currentView === item.id ? 'default' : 'ghost'}
        size="sm"
        class="flex-col gap-1 h-auto py-2 px-3 relative min-h-[60px]"
        onclick={() => handleNavClick(item.href)}
      >
        <item.icon class="h-5 w-5" />
        <span class="text-xs">{item.label}</span>
        
        {#if item.badge > 0}
          <Badge 
            variant="destructive" 
            class="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
          >
            {item.badge}
          </Badge>
        {/if}
      </Button>
    {/each}
  </div>
</nav>

<style>
  .safe-area-bottom {
    padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
  }

  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
    backdrop-filter: blur(8px);
    background-color: rgba(255, 255, 255, 0.95);
  }

  :global(.dark) .bottom-nav {
    background-color: rgba(0, 0, 0, 0.95);
  }

  .quick-actions {
    background: linear-gradient(to right, 
      hsl(var(--primary) / 0.05), 
      hsl(var(--secondary) / 0.05), 
      hsl(var(--primary) / 0.05)
    );
  }

  /* Touch targets for mobile */
  .main-nav button,
  .quick-actions button {
    min-height: 44px;
    min-width: 44px;
  }

  /* Active state animations */
  .main-nav button[data-state="active"] {
    transform: scale(1.05);
    transition: transform 0.2s ease;
  }

  /* Haptic feedback visual indicator */
  .main-nav button:active,
  .quick-actions button:active {
    transform: scale(0.95);
    transition: transform 0.1s ease;
  }
</style>