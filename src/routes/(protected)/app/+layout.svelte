<script lang="ts">
  import { onMount } from 'svelte';
  import { tick } from 'svelte';
  import { writable } from 'svelte/store';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Input } from '$lib/components/ui/input';
  import * as Menubar from '$lib/components/ui/menubar';
  import * as ContextMenu from '$lib/components/ui/context-menu';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Progress } from '$lib/components/ui/progress';
  import { toast } from 'svelte-sonner';
  import MobileNavigation from '$lib/components/MobileNavigation.svelte';
  import MobileGestures from '$lib/components/MobileGestures.svelte';
  import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';
  import PWAInstallPrompt from '$lib/components/PWAInstallPrompt.svelte';
  import { keyboardManager, type KeyboardShortcut } from '$lib/utils/keyboard';
  import { createVirtualScrollStore, performanceMonitor, memoryManager } from '$lib/utils/virtualScrolling';
  import { desktopManager, contextMenuManager } from '$lib/utils/desktopFeatures';
  import { cameraManager } from '$lib/utils/camera';
  import { geolocationManager } from '$lib/utils/geolocation';
  import { notificationManager } from '$lib/utils/notifications';
  import { initializeOfflineStorage, syncOfflineData } from '$lib/utils/offline';
  import { platform, type platformInfo } from '$lib/state/platform.svelte'
  
  // Icons
  import Home from "@lucide/svelte/icons/home";
  import Users from "@lucide/svelte/icons/users";
  import GitBranch from "@lucide/svelte/icons/git-branch";
  import Mic from "@lucide/svelte/icons/mic";
  import User from "@lucide/svelte/icons/user";
  import Menu from "@lucide/svelte/icons/menu";
  import X from "@lucide/svelte/icons/x";
  import Search from "@lucide/svelte/icons/search";
  import Bell from "@lucide/svelte/icons/bell";
  import Settings from "@lucide/svelte/icons/settings";
  import BarChart from "@lucide/svelte/icons/bar-chart";
  import Wifi from "@lucide/svelte/icons/wifi";
  import WifiOff from "@lucide/svelte/icons/wifi-off";
  import Minimize from "@lucide/svelte/icons/minimize";
  import Maximize from "@lucide/svelte/icons/maximize";
  import Minus from "@lucide/svelte/icons/minus";
  import Square from "@lucide/svelte/icons/square";
  import Download from "@lucide/svelte/icons/download";
  import Upload from "@lucide/svelte/icons/upload";
  import RefreshCw from "@lucide/svelte/icons/refresh-cw";
  import FileText from "@lucide/svelte/icons/file-text";
  import Plus from "@lucide/svelte/icons/plus";

  let { children } = $props();

  // Platform detection
  let isMobile = $state(false);
  let isTablet = $state(false);


  // App state
  let currentView = $state('dashboard');
  let sidebarExpanded = $state(true);
  let showMobileMenu = $state(false);
  let isOffline = $state(false);
  let searchQuery = $state('');
  let showUpdateDialog = $state(false);
  let updateProgress = $state(0);
  let isDragging = $state(false);
  let dragCounter = $state(0);
  let isRefreshing = $state(false);
  let hasMoreData = $state(true);
  let loadingMore = $state(false);

  // Desktop managers
  let virtualScrollStore: any;
  let swipeDirection = $state<'left' | 'right' | null>(null);
  let lastSwipeTime = 0;

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, shortcut: 'Ctrl+1', href: '/app' },
    { id: 'leads', label: 'Leads', icon: Users, shortcut: 'Ctrl+2', href: '/app/leads' },
    { id: 'pipeline', label: 'Pipeline', icon: GitBranch, shortcut: 'Ctrl+3', href: '/app/pipeline' },
    { id: 'coaching', label: 'AI Coach', icon: Mic, shortcut: 'Ctrl+4', href: '/app/coaching' },
    { id: 'analytics', label: 'Analytics', icon: BarChart, shortcut: 'Ctrl+5', href: '/app/analytics' },
    { id: 'profile', label: 'Profile', icon: User, shortcut: 'Ctrl+P', href: '/app/profile' }
  ];

  // Mobile-specific navigation
  const mobileViews = ['dashboard', 'leads', 'pipeline', 'coaching', 'profile'];
  
  function getNextView(direction: 'left' | 'right'): string {
    const currentIndex = mobileViews.indexOf(currentView);
    const nextIndex = direction === 'left' 
      ? (currentIndex + 1) % mobileViews.length
      : (currentIndex - 1 + mobileViews.length) % mobileViews.length;
    return mobileViews[nextIndex];
  }

  // Reactive current view based on URL
  $effect(() => {
    if ($page.url.pathname === '/app') {
      currentView = 'dashboard';
    } else {
      const pathSegments = $page.url.pathname.split('/');
      currentView = pathSegments[pathSegments.length - 1] || 'dashboard';
    }
  })

  // Detect mobile/tablet
  $effect(() => {
    if (browser) {
      isMobile = window.innerWidth < 768;
      isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    }
  })

  onMount(async () => {
    if (!browser) return;

    // Detect platform and capabilities
    const platformInfo = await detectPlatform();
    platform.set(platformInfo);

    // Initialize desktop features
    if (platformInfo.type === 'desktop') {
      await initializeDesktopFeatures();
    }

    // Set up keyboard shortcuts
    setupKeyboardShortcuts();

    // Set up offline detection
    setupOfflineDetection();

    // Initialize local storage
    initializeOfflineStorage();

    // Set up drag and drop
    setupDragAndDrop();

    // Request notification permissions
    if ('Notification' in window) {
      await Notification.requestPermission();
    }

    // Set up service worker for PWA features
    if ('serviceWorker' in navigator) {
      try {
        setupUpdateDetection();
        
        // Setup push notifications
        await setupPushNotifications();
      } catch (error) {
        console.log('Service worker registration failed:', error);
      }
    }

    // Initialize performance monitoring
    setupPerformanceMonitoring();
    
    // Initialize mobile features
    if (platformInfo.type === 'mobile') {
      await initializeMobileFeatures();
    }
    
    // Setup virtual scrolling for large datasets
    virtualScrollStore = createVirtualScrollStore({
      itemHeight: 80,
      overscan: 5,
      containerHeight: window.innerHeight - 200
    });
  });


  async function initializeMobileFeatures() {
    // Initialize camera
    if (cameraManager.isSupported()) {
      await cameraManager.checkPermissions();
    }
    
    // Initialize geolocation
    if (geolocationManager.isSupported()) {
      await geolocationManager.checkPermissions();
    }
    
    // Setup device orientation handling
    if ('orientation' in screen) {
      screen.orientation.addEventListener('change', () => {
        // Recalculate layout on orientation change
        setTimeout(() => {
          virtualScrollStore?.recalculate();
        }, 100);
      });
    }
    
    // Setup haptic feedback
    if (wappindow.Capacitor) {
      // Haptic feedback is handled in individual components
    }
  }

  async function initializeDesktopFeatures() {
    // Initialize Tauri features if available
    if ($platform.isTauri && window.__TAURI__) {
      try {
        // Set up window controls
        await setupWindowControls();
        
        // Set up system tray (if supported)
        await setupSystemTray();
        
        // Set up auto-updater
        await setupAutoUpdater();
        
        // Set up file associations
        await setupFileAssociations();
      } catch (error) {
        console.error('Failed to initialize Tauri features:', error);
      }
    }

    // Initialize desktop notifications
    await notificationManager.requestPermission();
  }

  async function setupPushNotifications() {
    if ('PushManager' in window && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'your-vapid-public-key' // Replace with actual VAPID key
        });
        
        // Send subscription to server
        console.log('Push subscription:', subscription);
      } catch (error) {
        console.log('Push notifications not supported or denied:', error);
      }
    }
  }

  function setupKeyboardShortcuts() {
    const shortcuts: KeyboardShortcut[] = [
      // Navigation shortcuts
      ...navigationItems.map(item => ({
        key: item.shortcut.split('+')[1].toLowerCase(),
        ctrlKey: true,
        action: () => window.location.href = item.href,
        description: `Navigate to ${item.label}`
      })),
      
      // Application shortcuts
      {
        key: 'n',
        ctrlKey: true,
        action: () => createNewLead(),
        description: 'Create new lead'
      },
      {
        key: 'f',
        ctrlKey: true,
        action: () => document.getElementById('search')?.focus(),
        description: 'Focus search'
      },
      {
        key: 'k',
        ctrlKey: true,
        action: () => toggleSidebar(),
        description: 'Toggle sidebar'
      },
      {
        key: 'r',
        ctrlKey: true,
        action: () => refreshData(),
        description: 'Refresh data'
      },
      {
        key: ',',
        ctrlKey: true,
        action: () => window.location.href = '/app/settings',
        description: 'Open settings'
      },
      {
        key: 'q',
        ctrlKey: true,
        shiftKey: true,
        action: () => quitApplication(),
        description: 'Quit application'
      }
    ];

    shortcuts.forEach(shortcut => keyboardManager.register(shortcut));
    keyboardManager.startListening();

    return () => {
      keyboardManager.stopListening();
    };
  }

  function setupOfflineDetection() {
    const updateOnlineStatus = () => {
      isOffline = !navigator.onLine;
      platform.update(p => ({ ...p, isOnline: navigator.onLine }));
      
      if (navigator.onLine) {
        toast.success('Connection restored');
        syncOfflineData();
      } else {
        toast.error('You are offline. Data will be saved locally.');
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
  }

  function setupDragAndDrop() {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      if (dragCounter === 1) {
        isDragging = true;
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter === 0) {
        isDragging = false;
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      isDragging = false;
      dragCounter = 0;

      const files = Array.from(e.dataTransfer?.files || []);
      const validFiles = files.filter(file => 
        file.type === 'text/csv' || 
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel' ||
        file.name.endsWith('.vcf')
      );

      if (validFiles.length > 0) {
        await handleFileImport(validFiles);
      } else {
        toast.error('Please drop valid files (.csv, .xlsx, .xls, .vcf)');
      }
    };

    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }

  function setupPerformanceMonitoring() {
    // Start performance monitoring
    performanceMonitor.startMonitoring();
    
    // Monitor memory usage periodically
    setInterval(() => {
      const memoryStats = memoryManager.getStats();
      if (memoryStats.utilizationPercent > 80) {
        console.warn('High memory usage detected:', memoryStats);
      }
    }, 30000); // Check every 30 seconds
  }

  function setupUpdateDetection() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'update-available') {
          showUpdateDialog = true;
        }
      });
    }
  }

  async function setupWindowControls() {
        console.log($platform.isTauri)
    console.log($platform)

    if (!$platform.isTauri) return;

    try {
      const { appWindow } = await import('@tauri-apps/api/window');
      
      // Set up window event listeners
      await appWindow.listen('tauri://close-requested', () => {
        // Handle close request
        quitApplication();
      });

      await appWindow.listen('tauri://resize', () => {
        // Handle window resize
        virtualScrollStore?.recalculate();
      });
    } catch (error) {
      console.error('Failed to set up window controls:', error);
    }
  }

  async function setupSystemTray() {
    if (!$platform.isTauri) return;

    try {
      // System tray setup would go here
      // This is a placeholder for future implementation
      console.log('System tray setup placeholder');
    } catch (error) {
      console.error('Failed to set up system tray:', error);
    }
  }

  async function setupAutoUpdater() {
    if (!$platform.isTauri) return;

    try {
      const { check } = await import('@tauri-apps/plugin-updater');

      // Check for updates periodically
      setInterval(async () => {
        try {
          const update = await check();
          if (update?.available) {
            showUpdateDialog = true;
          }
        } catch (error) {
          console.error('Update check failed:', error);
        }
      }, 60000 * 60); // Check every hour
    } catch (error) {
      console.error('Failed to set up auto-updater:', error);
    }
  }

  async function setupFileAssociations() {
    if (!$platform.isTauri) return;

    try {
      // File association setup would go here
      // This is a placeholder for future implementation
      console.log('File associations setup placeholder');
    } catch (error) {
      console.error('Failed to set up file associations:', error);
    }
  }

  // Mobile gesture handlers
  async function handleSwipeLeft() {
    if (!isMobile) return;
    
    const now = Date.now();
    if (now - lastSwipeTime < 300) return; // Debounce
    lastSwipeTime = now;
    
    swipeDirection = 'left';
    const nextView = getNextView('left');
    const nextItem = navigationItems.find(item => item.id === nextView);
    
    if (nextItem) {
      // Add haptic feedback
      if (window.Capacitor) {
        try {
          const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
          await Haptics.impact({ style: ImpactStyle.Light });
        } catch (error) {
          console.log('Haptics not available');
        }
      }
      
      navigateTo(nextItem.href);
    }
    
    setTimeout(() => swipeDirection = null, 300);
  }

  async function handleSwipeRight() {
    if (!isMobile) return;
    
    const now = Date.now();
    if (now - lastSwipeTime < 300) return; // Debounce
    lastSwipeTime = now;
    
    swipeDirection = 'right';
    const nextView = getNextView('right');
    const nextItem = navigationItems.find(item => item.id === nextView);
    
    if (nextItem) {
      // Add haptic feedback
      if (window.Capacitor) {
        try {
          const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
          await Haptics.impact({ style: ImpactStyle.Light });
        } catch (error) {
          console.log('Haptics not available');
        }
      }
      
      navigateTo(nextItem.href);
    }
    
    setTimeout(() => swipeDirection = null, 300);
  }

  async function handlePullToRefresh() {
    isRefreshing = true;
    
    try {
      // Refresh current page data
      await refreshData();
      
      // Add haptic feedback
      if (window.Capacitor) {
        try {
          const { Haptics, NotificationType } = await import('@capacitor/haptics');
          await Haptics.notification({ type: NotificationType.Success });
        } catch (error) {
          console.log('Haptics not available');
        }
      }
    } finally {
      isRefreshing = false;
    }
  }

  async function handleLoadMore() {
    if (loadingMore || !hasMoreData) return;
    
    loadingMore = true;
    
    try {
      // Simulate loading more data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would load more data here
      // For demo purposes, we'll just show that we loaded more
      toast.success('Loaded more items');
      
      // Simulate reaching end of data after a few loads
      if (Math.random() > 0.7) {
        hasMoreData = false;
      }
    } finally {
      loadingMore = false;
    }
  }

  // Action handlers
  function toggleSidebar() {
    sidebarExpanded = !sidebarExpanded;
  }

  function navigateTo(href: string) {
    window.location.href = href;
  }

  async function createNewLead() {
    // Navigate to leads page with new lead dialog
    window.location.href = '/app/leads?action=new';
    toast.success('Opening new lead dialog...');
  }

  async function refreshData() {
    toast.success('Refreshing data...');
    
    // Clear memory cache
    memoryManager.clear();
    
    // Implement data refresh logic
    await syncOfflineData();
  }

  async function quitApplication() {
    if ($platform.isTauri) {
      try {
        const { appWindow } = await import('@tauri-apps/api/window');
        await appWindow.close();
      } catch (error) {
        console.error('Failed to quit application:', error);
      }
    } else {
      window.close();
    }
  }

  async function minimizeWindow() {
    if ($platform.isTauri) {
      try {
        const { appWindow } = await import('@tauri-apps/api/window');
        await appWindow.minimize();
      } catch (error) {
        console.error('Failed to minimize window:', error);
      }
    }
  }

  async function maximizeWindow() {
    if ($platform.isTauri) {
      try {
        const { appWindow } = await import('@tauri-apps/api/window');
        await appWindow.toggleMaximize();
      } catch (error) {
        console.error('Failed to maximize window:', error);
      }
    }
  }

  async function handleFileImport(files: File[]) {
    toast.success(`Importing ${files.length} file(s)...`);
    
    for (const file of files) {
      try {
        const text = await file.text();
        // Process file content based on type
        if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
          await processCSVImport(text);
        } else if (file.name.endsWith('.vcf')) {
          await processVCardImport(text);
        }
      } catch (error) {
        console.error('File import failed:', error);
        toast.error(`Failed to import ${file.name}`);
      }
    }
  }

  async function processCSVImport(csvText: string) {
    // Implement CSV import logic
    console.log('Processing CSV import:', csvText.substring(0, 100) + '...');
    toast.success('CSV file imported successfully');
  }

  async function processVCardImport(vcardText: string) {
    // Implement vCard import logic
    console.log('Processing vCard import:', vcardText.substring(0, 100) + '...');
    toast.success('vCard file imported successfully');
  }

  async function installUpdate() {
    if ($platform.isTauri) {
      try {
        const { installUpdate } = await import('@tauri-apps/plugin-updater');
        
        updateProgress = 0;
        const progressInterval = setInterval(() => {
          updateProgress += 10;
          if (updateProgress >= 100) {
            clearInterval(progressInterval);
          }
        }, 200);

        await installUpdate();
        toast.success('Update installed successfully. Restarting...');
      } catch (error) {
        console.error('Update installation failed:', error);
        toast.error('Failed to install update');
      }
    } else {
      // Service worker update
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.update();
        window.location.reload();
      }
    }
  }

  // Platform-specific styles
  let platformClasses = $derived($platform.type === 'mobile' 
    ? 'mobile-layout' 
    : `desktop-layout ${$platform.os}`);

  let touchTargetSize = $derived($platform.type === 'mobile' ? 'min-h-[44px]' : 'min-h-[32px]');

  // Get current page title
  let pageTitle = $derived(navigationItems.find(item => item.id === currentView)?.label || 'Dashboard');
</script>

<svelte:head>
  <title>AI Sales Copilot - {pageTitle}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
</svelte:head>

<div class={`app-container ${platformClasses}`} class:offline={isOffline}>
  <!-- Desktop Layout -->
  {#if $platform.type === 'desktop' && !isMobile}
    <div class="desktop-app flex flex-col h-screen bg-background">
      <!-- Native Menu Bar -->
      <div class="menu-bar bg-background border-b">
        <Menubar.Root class="border-none">
          <!-- Window Controls (Tauri) -->
          {#if $platform.isTauri}
            <div class="window-controls flex items-center gap-1 px-2">
              <Button variant="ghost" size="icon" class="h-6 w-6" onclick={minimizeWindow}>
                <Minus class="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" class="h-6 w-6" onclick={maximizeWindow}>
                <Square class="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" class="h-6 w-6 text-destructive" onclick={quitApplication}>
                <X class="h-3 w-3" />
              </Button>
            </div>
          {/if}

          <!-- File Menu -->
          <Menubar.Menu>
            <Menubar.Trigger>File</Menubar.Trigger>
            <Menubar.Content>
              <Menubar.Item onclick={createNewLead}>
                New Lead
                <Menubar.Shortcut>Ctrl+N</Menubar.Shortcut>
              </Menubar.Item>
              <Menubar.Item>
                Import Leads
                <Menubar.Shortcut>Ctrl+I</Menubar.Shortcut>
              </Menubar.Item>
              <Menubar.Item>
                Export Data
                <Menubar.Shortcut>Ctrl+E</Menubar.Shortcut>
              </Menubar.Item>
              <Menubar.Separator />
              <Menubar.Item onclick={quitApplication}>
                Quit
                <Menubar.Shortcut>Ctrl+Q</Menubar.Shortcut>
              </Menubar.Item>
            </Menubar.Content>
          </Menubar.Menu>

          <!-- Edit Menu -->
          <Menubar.Menu>
            <Menubar.Trigger>Edit</Menubar.Trigger>
            <Menubar.Content>
              <Menubar.Item>
                Find
                <Menubar.Shortcut>Ctrl+F</Menubar.Shortcut>
              </Menubar.Item>
              <Menubar.Item onclick={refreshData}>
                Refresh
                <Menubar.Shortcut>Ctrl+R</Menubar.Shortcut>
              </Menubar.Item>
              <Menubar.Separator />
              <Menubar.Item onclick={() => window.location.href = '/app/settings'}>
                Preferences
                <Menubar.Shortcut>Ctrl+,</Menubar.Shortcut>
              </Menubar.Item>
            </Menubar.Content>
          </Menubar.Menu>

          <!-- View Menu -->
          <Menubar.Menu>
            <Menubar.Trigger>View</Menubar.Trigger>
            <Menubar.Content>
              <Menubar.CheckboxItem checked={sidebarExpanded} onCheckedChange={toggleSidebar}>
                Show Sidebar
                <Menubar.Shortcut>Ctrl+K</Menubar.Shortcut>
              </Menubar.CheckboxItem>
              <Menubar.Separator />
              {#each navigationItems as item}
                <Menubar.Item onclick={() => navigateTo(item.href)}>
                  {item.label}
                  <Menubar.Shortcut>{item.shortcut}</Menubar.Shortcut>
                </Menubar.Item>
              {/each}
            </Menubar.Content>
          </Menubar.Menu>

          <!-- Help Menu -->
          <Menubar.Menu>
            <Menubar.Trigger>Help</Menubar.Trigger>
            <Menubar.Content>
              <Menubar.Item>
                Keyboard Shortcuts
                <Menubar.Shortcut>Ctrl+?</Menubar.Shortcut>
              </Menubar.Item>
              <Menubar.Item>Documentation</Menubar.Item>
              <Menubar.Item>Contact Support</Menubar.Item>
              <Menubar.Separator />
              <Menubar.Item>About AI Sales Copilot</Menubar.Item>
            </Menubar.Content>
          </Menubar.Menu>

          <!-- App Title -->
          <div class="flex-1 flex items-center justify-center">
            <span class="text-sm font-medium">AI Sales Copilot - {pageTitle}</span>
          </div>
        </Menubar.Root>
      </div>

      <div class="flex flex-1 overflow-hidden">
        <!-- Sidebar with Context Menu -->
        <ContextMenu.Root>
          <ContextMenu.Trigger>
            <aside class={`sidebar transition-all duration-300 ${sidebarExpanded ? 'w-64' : 'w-16'} bg-card border-r flex flex-col`}>
              <div class="sidebar-header p-4 border-b">
                <div class="flex items-center gap-3">
                  {#if sidebarExpanded}
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span class="text-primary-foreground font-bold text-sm">AI</span>
                      </div>
                      <span class="font-semibold">Sales Copilot</span>
                    </div>
                  {:else}
                    <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
                      <span class="text-primary-foreground font-bold text-sm">AI</span>
                    </div>
                  {/if}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onclick={toggleSidebar}
                    class="ml-auto"
                  >
                    <Menu class="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <nav class="sidebar-nav p-2 flex-1">
                {#each navigationItems as item}
                  <ContextMenu.Root>
                    <ContextMenu.Trigger>
                      <Button
                        variant={currentView === item.id ? 'default' : 'ghost'}
                        class={`w-full justify-start gap-3 ${touchTargetSize} mb-1`}
                        onclick={() => navigateTo(item.href)}
                        title={sidebarExpanded ? '' : `${item.label} (${item.shortcut})`}
                      >
                        <item.icon class="h-5 w-5" />
                        {#if sidebarExpanded}
                          <span>{item.label}</span>
                          <kbd class="ml-auto text-xs bg-muted px-1 rounded">
                            {item.shortcut.replace('Ctrl', $platform.os === 'macos' ? '⌘' : 'Ctrl')}
                          </kbd>
                        {/if}
                      </Button>
                    </ContextMenu.Trigger>
                    <ContextMenu.Content>
                      <ContextMenu.Item onclick={() => navigateTo(item.href)}>
                        Open {item.label}
                      </ContextMenu.Item>
                      {#if $platform.capabilities.multiWindow}
                        <ContextMenu.Item>
                          Open in New Window
                        </ContextMenu.Item>
                      {/if}
                      <ContextMenu.Item>
                        Pin to Quick Access
                      </ContextMenu.Item>
                    </ContextMenu.Content>
                  </ContextMenu.Root>
                {/each}
              </nav>

              {#if sidebarExpanded}
                <div class="sidebar-footer p-4 border-t">
                  <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    {#if isOffline}
                      <WifiOff class="h-4 w-4 text-destructive" />
                      <span>Offline</span>
                    {:else}
                      <Wifi class="h-4 w-4 text-green-500" />
                      <span>Online</span>
                    {/if}
                  </div>
                </div>
              {/if}
            </aside>
          </ContextMenu.Trigger>
          <ContextMenu.Content>
            <ContextMenu.Item onclick={toggleSidebar}>
              {sidebarExpanded ? 'Collapse' : 'Expand'} Sidebar
            </ContextMenu.Item>
            <ContextMenu.Item onclick={refreshData}>
              Refresh Data
            </ContextMenu.Item>
            <ContextMenu.Separator />
            <ContextMenu.Item onclick={() => window.location.href = '/app/settings'}>
              Settings
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Root>

        <!-- Main Content with Context Menu -->
        <ContextMenu.Root>
          <ContextMenu.Trigger class="flex-1 flex flex-col overflow-hidden">
            <main class="main-content flex-1 flex flex-col overflow-hidden">
              <!-- Header -->
              <header class="header bg-background border-b p-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <h1 class="text-2xl font-bold">{pageTitle}</h1>
                    {#if isOffline}
                      <Badge variant="destructive">Offline Mode</Badge>
                    {/if}
                  </div>
                  
                  <div class="flex items-center gap-4">
                    <div class="relative">
                      <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        type="search"
                        placeholder="Search... (Ctrl+F)"
                        class="pl-10 w-64"
                        bind:value={searchQuery}
                      />
                    </div>
                    
                    <Button variant="ghost" size="icon">
                      <Bell class="h-5 w-5" />
                    </Button>
                    
                    <Button variant="ghost" size="icon">
                      <Settings class="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </header>

              <!-- Content Area -->
              <div class="content-area flex-1 overflow-auto p-6" class:swipe-left={swipeDirection === 'left'} class:swipe-right={swipeDirection === 'right'}>
                {@render children()}
              </div>
            </main>
          </ContextMenu.Trigger>
          <ContextMenu.Content>
            <ContextMenu.Item onclick={createNewLead}>
              <Plus class="h-4 w-4 mr-2" />
              New Lead
            </ContextMenu.Item>
            <ContextMenu.Item onclick={refreshData}>
              <RefreshCw class="h-4 w-4 mr-2" />
              Refresh
            </ContextMenu.Item>
            <ContextMenu.Separator />
            <ContextMenu.Item>
              <Upload class="h-4 w-4 mr-2" />
              Import Data
            </ContextMenu.Item>
            <ContextMenu.Item>
              <Download class="h-4 w-4 mr-2" />
              Export Data
            </ContextMenu.Item>
            <ContextMenu.Separator />
            <ContextMenu.Item>
              <FileText class="h-4 w-4 mr-2" />
              Generate Report
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Root>
      </div>
    </div>

  <!-- Mobile Layout (Preserved) -->
  {:else}
    <MobileGestures
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      onPullToRefresh={handlePullToRefresh}
    >
      <div class="mobile-app flex flex-col h-screen bg-background" class:swipe-left={swipeDirection === 'left'} class:swipe-right={swipeDirection === 'right'}>
      <!-- Mobile Header -->
      <header class="mobile-header bg-background border-b p-4 safe-area-top">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-bold">{pageTitle}</h1>
          
          <div class="flex items-center gap-2">
            {#if isOffline}
              <WifiOff class="h-5 w-5 text-destructive" />
            {/if}
            <Button variant="ghost" size="icon" onclick={() => showMobileMenu = true}>
              <Menu class="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <!-- Mobile Content -->
      <main class="mobile-content flex-1 overflow-auto">
        <div class="p-4">
        {@render children()}
        </div>
        
        <InfiniteScroll {hasMoreData} loading={loadingMore} onLoadMore={handleLoadMore} />
      </main>

      <!-- Mobile Navigation Component -->
      <MobileNavigation {currentView} />

      <!-- Mobile Menu Overlay -->
      {#if showMobileMenu}
        <div class="mobile-menu-overlay fixed inset-0 bg-black/50 z-50" onclick={() => showMobileMenu = false}>
          <div class="mobile-menu bg-card w-80 h-full p-4" onclick={(e) => e.stopPropagation()}>
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-lg font-semibold">Menu</h2>
              <Button variant="ghost" size="icon" onclick={() => showMobileMenu = false}>
                <X class="h-5 w-5" />
              </Button>
            </div>
            
            <nav class="space-y-2">
              {#each navigationItems as item}
                <Button
                  variant={currentView === item.id ? 'default' : 'ghost'}
                  class="w-full justify-start gap-3 h-12"
                  onclick={() => {
                    navigateTo(item.href);
                    showMobileMenu = false;
                  }}
                >
                  <item.icon class="h-5 w-5" />
                  <span>{item.label}</span>
                </Button>
              {/each}
            </nav>

            <!-- Mobile Menu Footer -->
            <div class="mt-auto pt-6 border-t">
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                {#if isOffline}
                  <WifiOff class="h-4 w-4 text-destructive" />
                  <span>Offline Mode</span>
                {:else}
                  <Wifi class="h-4 w-4 text-green-500" />
                  <span>Connected</span>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
    </MobileGestures>
  {/if}

  <!-- Drag and Drop Overlay -->
  {#if isDragging}
    <div class="fixed inset-0 bg-primary/20 backdrop-blur-sm z-50 flex items-center justify-center">
      <div class="bg-card border-2 border-dashed border-primary rounded-lg p-8 text-center">
        <Upload class="h-12 w-12 mx-auto mb-4 text-primary" />
        <h3 class="text-lg font-semibold mb-2">Drop files to import</h3>
        <p class="text-muted-foreground">Supports CSV, Excel, and vCard files</p>
      </div>
    </div>
  {/if}

  <!-- Update Dialog -->
  <Dialog.Root bind:open={showUpdateDialog}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Update Available</Dialog.Title>
        <Dialog.Description>
          A new version of AI Sales Copilot is available. Would you like to install it now?
        </Dialog.Description>
      </Dialog.Header>

      {#if updateProgress > 0}
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span>Installing update...</span>
            <span>{updateProgress}%</span>
          </div>
          <Progress value={updateProgress} />
        </div>
      {/if}

      <Dialog.Footer>
        <Button variant="outline" onclick={() => showUpdateDialog = false}>
          Later
        </Button>
        <Button onclick={installUpdate} disabled={updateProgress > 0}>
          {updateProgress > 0 ? 'Installing...' : 'Install Update'}
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
  
  <!-- PWA Install Prompt -->
  <PWAInstallPrompt />
</div>

<style>
  .app-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .desktop-layout.windows {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .desktop-layout.macos {
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  }

  .desktop-layout.linux {
    font-family: 'Ubuntu', 'Liberation Sans', sans-serif;
  }

  .mobile-layout {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }

  .menu-bar {
    -webkit-app-region: drag;
    height: 40px;
    display: flex;
    align-items: center;
  }

  .menu-bar button,
  .menu-bar [role="menubar"] {
    -webkit-app-region: no-drag;
  }

  .window-controls {
    -webkit-app-region: no-drag;
  }

  .safe-area-top {
    padding-top: max(1rem, env(safe-area-inset-top));
  }

  .safe-area-bottom {
    padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
  }

  .mobile-menu-overlay {
    backdrop-filter: blur(4px);
  }

  .mobile-menu {
    transform: translateX(-100%);
    animation: slideIn 0.3s ease-out forwards;
  }

  @keyframes slideIn {
    to {
      transform: translateX(0);
    }
  }

  .offline {
    filter: grayscale(0.3);
  }

  /* Touch targets for mobile */
  @media (max-width: 768px) {
    button, .clickable {
      min-height: 44px;
      min-width: 44px;
    }
  }

  /* Platform-specific scrollbars */
  .desktop-layout.windows ::-webkit-scrollbar {
    width: 12px;
  }

  .desktop-layout.windows ::-webkit-scrollbar-track {
    background: hsl(var(--muted));
  }

  .desktop-layout.windows ::-webkit-scrollbar-thumb {
    background: hsl(var(--muted-foreground));
    border-radius: 6px;
  }

  .desktop-layout.macos ::-webkit-scrollbar {
    width: 8px;
  }

  .desktop-layout.macos ::-webkit-scrollbar-track {
    background: transparent;
  }

  .desktop-layout.macos ::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
  }

  /* Sidebar animations */
  .sidebar {
    transition: width 0.3s ease;
  }

  .sidebar-nav {
    overflow-x: hidden;
  }

  /* Mobile optimizations */
  .mobile-content {
    -webkit-overflow-scrolling: touch;
  }

  /* Focus styles for accessibility */
  .sidebar-nav button:focus-visible,
  .bottom-nav button:focus-visible {
    outline: 2px solid hsl(var(--ring));
    outline-offset: 2px;
  }

  /* Desktop-specific styles */
  .desktop-layout .content-area {
    contain: layout style paint;
  }

  .desktop-layout .sidebar-nav {
    contain: layout style;
  }

  /* Performance optimizations */
  .virtual-scroll-container {
    contain: strict;
    overflow: auto;
  }

  .virtual-scroll-item {
    contain: layout style paint;
  }
  
  /* Mobile swipe animations */
  .swipe-left {
    animation: swipeLeft 0.3s ease-out;
  }
  
  .swipe-right {
    animation: swipeRight 0.3s ease-out;
  }
  
  @keyframes swipeLeft {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
  
  @keyframes swipeRight {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }
  
  /* Mobile content spacing */
  .mobile-content {
    padding-bottom: 120px; /* Account for bottom navigation */
  }
</style>