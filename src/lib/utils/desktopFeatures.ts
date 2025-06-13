import { writable } from 'svelte/store';
import { browser } from '$app/environment'

export interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  maximized: boolean;
  minimized: boolean;
  focused: boolean;
}

export interface ContextMenuAction {
  label: string;
  action: () => void;
  shortcut?: string;
  separator?: boolean;
  disabled?: boolean;
  submenu?: ContextMenuAction[];
}

export class DesktopManager {
  private windowState = writable<WindowState>({
    x: 0,
    y: 0,
    width: 1200,
    height: 800,
    maximized: false,
    minimized: false,
    focused: true
  });

  private isTauri = false;

  constructor() {
    this.isTauri = browser ? window.__TAURI__ !== undefined: false;
    this.initializeWindowState();
  }

  private async initializeWindowState() {
    if (this.isTauri) {
      try {
        const { appWindow } = await import('@tauri-apps/api/webviewWindow');
        
        // Get initial window state
        const position = await appWindow.outerPosition();
        const size = await appWindow.outerSize();
        const isMaximized = await appWindow.isMaximized();
        const isMinimized = await appWindow.isMinimized();
        const isFocused = await appWindow.isFocused();

        this.windowState.set({
          x: position.x,
          y: position.y,
          width: size.width,
          height: size.height,
          maximized: isMaximized,
          minimized: isMinimized,
          focused: isFocused
        });

        // Listen for window events
        await appWindow.listen('tauri://resize', async () => {
          const newSize = await appWindow.outerSize();
          this.windowState.update(state => ({
            ...state,
            width: newSize.width,
            height: newSize.height
          }));
        });

        await appWindow.listen('tauri://move', async () => {
          const newPosition = await appWindow.outerPosition();
          this.windowState.update(state => ({
            ...state,
            x: newPosition.x,
            y: newPosition.y
          }));
        });

        await appWindow.listen('tauri://focus', () => {
          this.windowState.update(state => ({ ...state, focused: true }));
        });

        await appWindow.listen('tauri://blur', () => {
          this.windowState.update(state => ({ ...state, focused: false }));
        });

      } catch (error) {
        console.error('Failed to initialize Tauri window state:', error);
      }
    } else {
      // Web fallback
      this.setupWebWindowState();
    }
  }

  private setupWebWindowState() {
    const updateWindowState = () => {
      this.windowState.update(state => ({
        ...state,
        width: window.innerWidth,
        height: window.innerHeight,
        focused: document.hasFocus()
      }));
    };
    if(browser) {
      window.addEventListener('resize', updateWindowState);
      window.addEventListener('focus', updateWindowState);
      window.addEventListener('blur', updateWindowState);
      
      updateWindowState();
    }
    
  }

  async minimizeWindow() {
    if (this.isTauri) {
      try {
        const { appWindow } = await import('@tauri-apps/api/webviewWindow');
        await appWindow.minimize();
      } catch (error) {
        console.error('Failed to minimize window:', error);
      }
    }
  }

  async maximizeWindow() {
    if (this.isTauri) {
      try {
        const { appWindow } = await import('@tauri-apps/api/webviewWindow');
        await appWindow.toggleMaximize();
      } catch (error) {
        console.error('Failed to maximize window:', error);
      }
    }
  }

  async closeWindow() {
    if (this.isTauri) {
      try {
        const { appWindow } = await import('@tauri-apps/api/webviewWindow');
        await appWindow.close();
      } catch (error) {
        console.error('Failed to close window:', error);
      }
    } else {
      window.close();
    }
  }

  async setWindowTitle(title: string) {
    if (this.isTauri) {
      try {
        const { appWindow } = await import('@tauri-apps/api/webviewWindow');
        await appWindow.setTitle(title);
      } catch (error) {
        console.error('Failed to set window title:', error);
      }
    } else {
      document.title = title;
    }
  }

  async openNewWindow(url: string, options?: { width?: number; height?: number }) {
    if (this.isTauri) {
      try {
        const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow');
        const webview = new WebviewWindow('new-window', {
          url,
          width: options?.width || 800,
          height: options?.height || 600,
        });
        return webview;
      } catch (error) {
        console.error('Failed to open new Tauri window:', error);
      }
    } else {
      // Web fallback
      const features = options ? 
        `width=${options.width || 800},height=${options.height || 600}` : 
        undefined;
      return window.open(url, '_blank', features);
    }
  }

  getWindowState() {
    return this.windowState;
  }

  // Clipboard operations
  async writeToClipboard(text: string) {
    if (this.isTauri) {
      try {
        const { writeText } = await import('@tauri-apps/plugin-clipboard-manager');
        await writeText(text);
      } catch (error) {
        console.error('Failed to write to clipboard:', error);
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        console.error('Failed to write to clipboard:', error);
      }
    }
  }

  async readFromClipboard(): Promise<string | null> {
    if (this.isTauri) {
      try {
        const { readText } = await import('@tauri-apps/plugin-clipboard-manager');
        return await readText();
      } catch (error) {
        console.error('Failed to read from clipboard:', error);
        return null;
      }
    } else if (navigator.clipboard) {
      try {
        return await navigator.clipboard.readText();
      } catch (error) {
        console.error('Failed to read from clipboard:', error);
        return null;
      }
    }
    return null;
  }

  // File operations
  async openFileDialog(options?: { 
    multiple?: boolean; 
    filters?: Array<{ name: string; extensions: string[] }> 
  }) {
    if (this.isTauri) {
      try {
        const { open } = await import('@tauri-apps/plugin-dialog');
        return await open({
          multiple: options?.multiple || false,
          filters: options?.filters || []
        });
      } catch (error) {
        console.error('Failed to open file dialog:', error);
        return null;
      }
    } else if ('showOpenFilePicker' in window) {
      try {
        const fileHandles = await (window as any).showOpenFilePicker({
          multiple: options?.multiple || false
        });
        return fileHandles;
      } catch (error) {
        console.error('Failed to open file picker:', error);
        return null;
      }
    }
    return null;
  }

  async saveFileDialog(defaultName?: string) {
    if (this.isTauri) {
      try {
        const { save } = await import('@tauri-apps/plugin-dialog');
        return await save({
          defaultPath: defaultName
        });
      } catch (error) {
        console.error('Failed to open save dialog:', error);
        return null;
      }
    } else if ('showSaveFilePicker' in window) {
      try {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: defaultName
        });
        return fileHandle;
      } catch (error) {
        console.error('Failed to open save picker:', error);
        return null;
      }
    }
    return null;
  }

  // Notifications
  async showNotification(title: string, body: string, options?: {
    icon?: string;
    actions?: Array<{ action: string; title: string }>;
  }) {
    if (this.isTauri) {
      try {
        const { sendNotification } = await import('@tauri-apps/plugin-notification');
        await sendNotification({
          title,
          body,
          icon: options?.icon
        });
      } catch (error) {
        console.error('Failed to show Tauri notification:', error);
      }
    } else if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          body,
          icon: options?.icon,
          actions: options?.actions
        });
        return notification;
      } catch (error) {
        console.error('Failed to show web notification:', error);
      }
    }
  }

  // System integration
  async getSystemInfo() {
    if (this.isTauri) {
      try {
        const { platform, version, type, arch } = await import('@tauri-apps/plugin-os');
        return {
          platform: await platform(),
          version: await version(),
          type: await type(),
          arch: await arch()
        };
      } catch (error) {
        console.error('Failed to get system info:', error);
        return null;
      }
    } else {
      return {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled
      };
    }
  }

  // Auto-updater
  async checkForUpdates() {
    if (this.isTauri) {
      try {
        const { check } = await import('@tauri-apps/plugin-updater');
        return await check();
      } catch (error) {
        console.error('Failed to check for updates:', error);
        return null;
      }
    }
    return null;
  }

  async installUpdate() {
    if (this.isTauri) {
      try {
        const { check } = await import('@tauri-apps/plugin-updater');
        const update = await check();
 update?.downloadAndInstall()
      } catch (error) {
        console.error('Failed to install update:', error);
      }
    }
  }
}

// Context menu manager
export class ContextMenuManager {
  private activeMenu: HTMLElement | null = null;

  showContextMenu(
    event: MouseEvent, 
    actions: ContextMenuAction[], 
    container?: HTMLElement
  ) {
    event.preventDefault();
    this.hideContextMenu();

    const menu = this.createContextMenu(actions);
    const targetContainer = container || document.body;
    
    // Position the menu
    menu.style.position = 'fixed';
    menu.style.left = `${event.clientX}px`;
    menu.style.top = `${event.clientY}px`;
    menu.style.zIndex = '9999';

    targetContainer.appendChild(menu);
    this.activeMenu = menu;

    // Adjust position if menu goes off-screen
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menu.style.left = `${event.clientX - rect.width}px`;
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = `${event.clientY - rect.height}px`;
    }

    // Close menu on outside click
    const closeHandler = (e: MouseEvent) => {
      if (!menu.contains(e.target as Node)) {
        this.hideContextMenu();
        document.removeEventListener('click', closeHandler);
      }
    };
    
    setTimeout(() => {
      document.addEventListener('click', closeHandler);
    }, 0);
  }

  private createContextMenu(actions: ContextMenuAction[]): HTMLElement {
    const menu = document.createElement('div');
    menu.className = 'context-menu bg-popover border rounded-md shadow-lg py-1 min-w-[200px]';

    actions.forEach(action => {
      if (action.separator) {
        const separator = document.createElement('div');
        separator.className = 'border-t my-1';
        menu.appendChild(separator);
      } else {
        const item = document.createElement('button');
        item.className = `context-menu-item w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between ${
          action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`;
        
        const label = document.createElement('span');
        label.textContent = action.label;
        item.appendChild(label);

        if (action.shortcut) {
          const shortcut = document.createElement('span');
          shortcut.className = 'text-xs text-muted-foreground';
          shortcut.textContent = action.shortcut;
          item.appendChild(shortcut);
        }

        if (!action.disabled) {
          item.addEventListener('click', () => {
            action.action();
            this.hideContextMenu();
          });
        }

        menu.appendChild(item);
      }
    });

    return menu;
  }

  hideContextMenu() {
    if (this.activeMenu) {
      this.activeMenu.remove();
      this.activeMenu = null;
    }
  }
}

// Global instances
export const desktopManager = new DesktopManager();
export const contextMenuManager = new ContextMenuManager();