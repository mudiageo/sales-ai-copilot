export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export class KeyboardShortcutManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private isListening = false;

  constructor() {
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  register(shortcut: KeyboardShortcut) {
    const key = this.getShortcutKey(shortcut);
    this.shortcuts.set(key, shortcut);
  }

  unregister(shortcut: KeyboardShortcut) {
    const key = this.getShortcutKey(shortcut);
    this.shortcuts.delete(key);
  }

  startListening() {
    if (!this.isListening) {
      document.addEventListener('keydown', this.handleKeydown);
      this.isListening = true;
    }
  }

  stopListening() {
    if (this.isListening) {
      document.removeEventListener('keydown', this.handleKeydown);
      this.isListening = false;
    }
  }

  private getShortcutKey(shortcut: KeyboardShortcut): string {
    const modifiers = [];
    if (shortcut.ctrlKey) modifiers.push('ctrl');
    if (shortcut.metaKey) modifiers.push('meta');
    if (shortcut.shiftKey) modifiers.push('shift');
    if (shortcut.altKey) modifiers.push('alt');
    
    return `${modifiers.join('+')}-${shortcut.key.toLowerCase()}`;
  }

  private handleKeydown(event: KeyboardEvent) {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const modifiers = [];
    if (event.ctrlKey) modifiers.push('ctrl');
    if (event.metaKey) modifiers.push('meta');
    if (event.shiftKey) modifiers.push('shift');
    if (event.altKey) modifiers.push('alt');
    
    const key = `${modifiers.join('+')}-${event.key.toLowerCase()}`;
    const shortcut = this.shortcuts.get(key);
    
    if (shortcut) {
      event.preventDefault();
      shortcut.action();
    }
  }

  getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }
}

export const keyboardManager = new KeyboardShortcutManager();

// Platform-specific modifier key detection
export function getModifierKey(): 'Ctrl' | 'Cmd' {
  return navigator.platform.toLowerCase().includes('mac') ? 'Cmd' : 'Ctrl';
}

export function formatShortcut(shortcut: KeyboardShortcut): string {
  const modifierKey = getModifierKey();
  const parts = [];
  
  if (shortcut.ctrlKey || shortcut.metaKey) {
    parts.push(modifierKey);
  }
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.altKey) parts.push('Alt');
  
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join('+');
}