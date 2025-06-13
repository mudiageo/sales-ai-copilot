// lib/z.svelte.ts
import { PUBLIC_SERVER } from '$env/static/public';
import { Z, Query } from 'zero-svelte';
import { schema, type Schema } from '../zero-schema.js';
import type { InferSelectModel } from 'drizzle-orm';

export function get_z_options() {
	return {
		userID: 'anon',
		server: PUBLIC_SERVER,
		schema,
		// ... other options
	} as const;
}

export const z = new Z<Schema>(get_z_options());

// Generic rune store creator for any table
export function createTableStore<T extends keyof Schema>(tableName: T) {
	type TableType = InferSelectModel<Schema[T]>;
	
	// Create reactive query
	const query = new Query(z.current.query[tableName]);
	
	// Base data access
	const data = $derived(query.data);
	const isLoading = $derived(query.loading);
	const error = $derived(query.error);
	
	// Data manipulation methods
	const methods = {
		// Add/Insert new record
		add(record: Omit<TableType, 'id'>) {
			try {
				z.current.mutate[tableName].insert(record);
				return true;
			} catch (err) {
				console.error(`Error adding to ${String(tableName)}:`, err);
				return false;
			}
		},
		
		// Update existing record
		update(id: string | number, updates: Partial<TableType>) {
			try {
			  z.current.mutate[tableName].update({
					where: { id },
					set: updates
				});
				return true;
			} catch (err) {
				console.error(`Error updating ${String(tableName)}:`, err);
				return false;
			}
		},
		
		// Remove/Delete record
		remove(id: string | number) {
			try {
				z.current.mutate[tableName].delete({
					where: { id }
				});
				return true;
			} catch (err) {
				console.error(`Error removing from ${String(tableName)}:`, err);
				return false;
			}
		},
		
		// Bulk operations
		async addMany(records: Omit<TableType, 'id'>[]) {
			try {
				await Promise.all(
					records.map(record => z.current.mutate[tableName].insert(record))
				);
				return true;
			} catch (err) {
				console.error(`Error bulk adding to ${String(tableName)}:`, err);
				return false;
			}
		},
		
		async removeMany(ids: (string | number)[]) {
			try {
				await Promise.all(
					ids.map(id => z.current.mutate[tableName].delete({ where: { id } }))
				);
				return true;
			} catch (err) {
				console.error(`Error bulk removing from ${String(tableName)}:`, err);
				return false;
			}
		},
		
		// Find specific record
		findById(id: string | number) {
			return $derived(data.find(item => item.id === id));
		},
		
		// Filter records
		filter(predicate: (item: TableType) => boolean) {
			return $derived(data.filter(predicate));
		},
		
		// Count records
		count() {
			return $derived(data.length);
		},
		
		// Check if record exists
		exists(id: string | number) {
			return $derived(data.some(item => item.id === id));
		}
	};
	
	return {
		// Reactive data
		data,
		isLoading,
		error,
		
		// Methods
		...methods,
		
		// Raw query access for advanced usage
		query
	};
}

// Specific store creators for common tables
export function createTodoStore() {
	const store = createTableStore('todos');
	
	// Todo-specific methods
	return {
		...store,
		
		// Toggle todo completion
		async toggle(id: string | number) {
			const todo = store.findById(id);
			if (todo) {
				return await store.update(id, { completed: !todo.completed });
			}
			return false;
		},
		
		// Mark as completed
		async complete(id: string | number) {
			return await store.update(id, { completed: true });
		},
		
		// Mark as incomplete
		async uncomplete(id: string | number) {
			return await store.update(id, { completed: false });
		},
		
		// Get completed todos
		completed: $derived(store.data.filter(todo => todo.completed)),
		
		// Get pending todos
		pending: $derived(store.data.filter(todo => !todo.completed)),
		
		// Clear all completed
		async clearCompleted() {
			const completedIds = store.data
				.filter(todo => todo.completed)
				.map(todo => todo.id);
			return await store.removeMany(completedIds);
		}
	};
}

export function createUserStore() {
	const store = createTableStore('users');
	
	return {
		...store,
		
		// User-specific methods
		async updateProfile(id: string | number, profile: { name?: string; email?: string }) {
			return await store.update(id, profile);
		},
		
		// Find user by email
		findByEmail(email: string) {
			return $derived(store.data.find(user => user.email === email));
		},
		
		// Check if email exists
		emailExists(email: string) {
			return $derived(store.data.some(user => user.email === email));
		}
	};
}

// Advanced store with custom queries
export function createAdvancedStore<T extends keyof Schema>(
	tableName: T,
	customQuery?: (query: any) => any
) {
	type TableType = InferSelectModel<Schema[T]>;
	
	// Use custom query if provided, otherwise use base query
	const baseQuery = customQuery 
		? customQuery(z.current.query[tableName])
		: z.current.query[tableName];
	
	const query = new Query(baseQuery);
	
	const data = $derived(query.data);
	const isLoading = $derived(query.loading);
	const error = $derived(query.error);
	
	return {
		data,
		isLoading,
		error,
		query,
		
		// Standard CRUD operations
		async add(record: Omit<TableType, 'id'>) {
			try {
				await z.current.mutate[tableName].insert(record);
				return true;
			} catch (err) {
				console.error(`Error adding to ${String(tableName)}:`, err);
				return false;
			}
		},
		
		async update(id: string | number, updates: Partial<TableType>) {
			try {
				await z.current.mutate[tableName].update({
					where: { id },
					set: updates
				});
				return true;
			} catch (err) {
				console.error(`Error updating ${String(tableName)}:`, err);
				return false;
			}
		},
		
		async remove(id: string | number) {
			try {
				await z.current.mutate[tableName].delete({
					where: { id }
				});
				return true;
			} catch (err) {
				console.error(`Error removing from ${String(tableName)}:`, err);
				return false;
			}
		}
	};
}

// Single row store for user-specific data (settings, profile, etc.)
export function createSingleRowStore<T extends keyof Schema>(
	tableName: T,
	userId: string | number,
	createDefault?: () => Omit<InferSelectModel<Schema[T]>, 'id' | 'userId'>
) {
	type TableType = InferSelectModel<Schema[T]>;
	
	// Query for single row belonging to current user
	const query = new Query(
		z.current.query[tableName].where('userId', userId).limit(1)
	);
	
	const data = $derived(query.data);
	const isLoading = $derived(query.loading);
	const error = $derived(query.error);
	
	// Get the single row (or null if doesn't exist)
	const row = $derived(data.length > 0 ? data[0] : null);
	
	// Check if row exists
	const exists = $derived(row !== null);
	
	const methods = {
		// Initialize row if it doesn't exist
		async initialize() {
			if (!row && createDefault) {
				try {
					await z.current.mutate[tableName].insert({
						...createDefault(),
						userId
					});
					return true;
				} catch (err) {
					console.error(`Error initializing ${String(tableName)}:`, err);
					return false;
				}
			}
			return exists;
		},
		
		// Update specific properties
		async updateProperty<K extends keyof TableType>(
			key: K, 
			value: TableType[K]
		) {
			if (!row) {
				// Try to initialize first
				if (createDefault) {
					await methods.initialize();
				} else {
					console.error(`No ${String(tableName)} row exists for user ${userId}`);
					return false;
				}
			}
			
			try {
				await z.current.mutate[tableName].update({
					where: { id: row.id },
					set: { [key]: value }
				});
				return true;
			} catch (err) {
				console.error(`Error updating ${String(key)} in ${String(tableName)}:`, err);
				return false;
			}
		},
		
		// Update multiple properties at once
		async updateProperties(updates: Partial<Omit<TableType, 'id' | 'userId'>>) {
			if (!row) {
				// Try to initialize first
				if (createDefault) {
					await methods.initialize();
				} else {
					console.error(`No ${String(tableName)} row exists for user ${userId}`);
					return false;
				}
			}
			
			try {
				await z.current.mutate[tableName].update({
					where: { id: row.id },
					set: updates
				});
				return true;
			} catch (err) {
				console.error(`Error updating ${String(tableName)}:`, err);
				return false;
			}
		},
		
		// Reset to default values
		async reset() {
			if (!row || !createDefault) return false;
			
			try {
				await z.current.mutate[tableName].update({
					where: { id: row.id },
					set: createDefault()
				});
				return true;
			} catch (err) {
				console.error(`Error resetting ${String(tableName)}:`, err);
				return false;
			}
		},
		
		// Delete the row
		async delete() {
			if (!row) return false;
			
			try {
				await z.current.mutate[tableName].delete({
					where: { id: row.id }
				});
				return true;
			} catch (err) {
				console.error(`Error deleting ${String(tableName)}:`, err);
				return false;
			}
		},
		
		// Get specific property value
		getProperty<K extends keyof TableType>(key: K): TableType[K] | undefined {
			return row?.[key];
		},
		
		// Check if property has specific value
		hasProperty<K extends keyof TableType>(key: K, value: TableType[K]): boolean {
			return row?.[key] === value;
		}
	};
	
	// Create a proxy to allow direct property access and assignment
	const proxyTarget = {
		// Reactive data
		data: row,
		exists,
		isLoading,
		error,
		
		// Methods
		...methods,
		
		// Raw query access
		query
	};
	
	return new Proxy(proxyTarget, {
		get(target, prop) {
			// Return existing methods/properties first
			if (prop in target) {
				return target[prop as keyof typeof target];
			}
			
			// If it's a property that exists on the row data, return its value
			if (row && typeof prop === 'string' && prop in row) {
				return row[prop as keyof TableType];
			}
			
			return undefined;
		},
		
		set(target, prop, value) {
			// Don't allow setting internal properties
			if (prop in target) {
				return false;
			}
			
			// If it's a property that should exist on the row data, update it
			if (typeof prop === 'string') {
				// Async update - fire and forget for immediate UI updates
				methods.updateProperty(prop as keyof TableType, value).catch(err => {
					console.error(`Failed to update ${prop}:`, err);
				});
				return true;
			}
			
			return false;
		},
		
		has(target, prop) {
			// Check if it's an internal property/method
			if (prop in target) return true;
			
			// Check if it's a property on the row data
			if (row && typeof prop === 'string' && prop in row) {
				return true;
			}
			
			return false;
		},
		
		ownKeys(target) {
			const keys = Object.keys(target);
			if (row) {
				keys.push(...Object.keys(row));
			}
			return keys;
		},
		
		getOwnPropertyDescriptor(target, prop) {
			if (prop in target) {
				return Object.getOwnPropertyDescriptor(target, prop);
			}
			
			if (row && typeof prop === 'string' && prop in row) {
				return {
					enumerable: true,
					configurable: true,
					value: row[prop as keyof TableType]
				};
			}
			
			return undefined;
		}
	});
}

// Specific single-row store creators
export function createUserSettingsStore(userId: string | number) {
	return createSingleRowStore('userSettings', userId, () => ({
		theme: 'light',
		notifications: true,
		language: 'en',
		timezone: 'UTC'
	}));
}

export function createUserProfileStore(userId: string | number) {
	return createSingleRowStore('userProfile', userId, () => ({
		displayName: '',
		bio: '',
		avatar: null,
		isPublic: true,
		createdAt: new Date(),
		updatedAt: new Date()
	}));
}

export function createUserPreferencesStore(userId: string | number) {
	return createSingleRowStore('userPreferences', userId, () => ({
		emailNotifications: true,
		pushNotifications: false,
		newsletter: false,
		dataSharing: false
	}));
}

// Usage examples and factory functions
export const stores = {
	todos: () => createTodoStore(),
	users: () => createUserStore(),
	
	// Generic store creator
	create: <T extends keyof Schema>(tableName: T) => createTableStore(tableName),
	
	// Advanced store creator
	createAdvanced: <T extends keyof Schema>(
		tableName: T, 
		customQuery?: (query: any) => any
	) => createAdvancedStore(tableName, customQuery),
	
	// Single row stores
	userSettings: (userId: string | number) => createUserSettingsStore(userId),
	userProfile: (userId: string | number) => createUserProfileStore(userId),
	userPreferences: (userId: string | number) => createUserPreferencesStore(userId),
	
	// Generic single row creator
	createSingleRow: <T extends keyof Schema>(
		tableName: T,
		userId: string | number,
		createDefault?: () => Omit<InferSelectModel<Schema[T]>, 'id' | 'userId'>
	) => createSingleRowStore(tableName, userId, createDefault)
};

// Example usage in components:
/*
// Multi-row store (todos, posts, etc.)
<script lang="ts">
	import { stores } from '$lib/z.svelte.ts';
	
	const todoStore = stores.todos();
	
	let newTodoText = '';
	
	async function addTodo() {
		if (newTodoText.trim()) {
			await todoStore.add({
				text: newTodoText,
				completed: false,
				createdAt: new Date()
			});
			newTodoText = '';
		}
	}
</script>

<div>
	{#if todoStore.isLoading}
		<p>Loading...</p>
	{:else if todoStore.error}
		<p>Error: {todoStore.error.message}</p>
	{:else}
		<ul>
			{#each todoStore.data as todo}
				<li>
					<input 
						type="checkbox" 
						checked={todo.completed}
						onchange={() => todoStore.toggle(todo.id)}
					>
					{todo.text}
					<button onclick={() => todoStore.remove(todo.id)}>Delete</button>
				</li>
			{/each}
		</ul>
		
		<input bind:value={newTodoText} placeholder="Add new todo">
		<button onclick={addTodo}>Add</button>
		
		<p>Total: {todoStore.count()}</p>
		<p>Completed: {todoStore.completed.length}</p>
		<p>Pending: {todoStore.pending.length}</p>
		
		<button onclick={() => todoStore.clearCompleted()}>Clear Completed</button>
	{/if}
</div>

// Single-row store (user settings, profile, etc.) with direct property access
<script lang="ts">
	import { stores } from '$lib/z.svelte.ts';
	
	const userId = 'current-user-id';
	const settings = stores.userSettings(userId);
	const profile = stores.userProfile(userId);
	
	// Initialize stores if they don't exist
	$effect(() => {
		settings.initialize();
		profile.initialize();
	});
	
	// Direct property access examples
	function toggleTheme() {
		settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
	}
	
	function updateProfile() {
		profile.displayName = 'John Doe';
		profile.bio = 'Software Developer';
	}
</script>

<div>
	{#if settings.isLoading}
		<p>Loading settings...</p>
	{:else if settings.error}
		<p>Error: {settings.error.message}</p>
	{:else if settings.exists}
		<h2>Settings</h2>
		
		<!-- Direct property binding -->
		<label>
			<input 
				type="checkbox" 
				bind:checked={settings.notifications}
			>
			Enable Notifications
		</label>
		
		<label>
			Theme:
			<select bind:value={settings.theme}>
				<option value="light">Light</option>
				<option value="dark">Dark</option>
			</select>
		</label>
		
		<label>
			Language:
			<select bind:value={settings.language}>
				<option value="en">English</option>
				<option value="es">Spanish</option>
				<option value="fr">French</option>
			</select>
		</label>
		
		<!-- Direct property assignment -->
		<button onclick={toggleTheme}>Toggle Theme</button>
		<button onclick={() => settings.reset()}>Reset to Defaults</button>
		
		<!-- Display current values -->
		<p>Current theme: {settings.theme}</p>
		<p>Notifications: {settings.notifications ? 'On' : 'Off'}</p>
		<p>Language: {settings.language}</p>
	{:else}
		<p>No settings found</p>
		<button onclick={() => settings.initialize()}>Create Settings</button>
	{/if}
	
	{#if profile.exists}
		<h2>Profile</h2>
		
		<!-- Direct property binding -->
		<input 
			type="text" 
			placeholder="Display Name"
			bind:value={profile.displayName}
		>
		
		<textarea 
			placeholder="Bio"
			bind:value={profile.bio}
		></textarea>
		
		<label>
			<input 
				type="checkbox" 
				bind:checked={profile.isPublic}
			>
			Public Profile
		</label>
		
		<!-- Direct property assignment -->
		<button onclick={updateProfile}>Set Default Profile</button>
		
		<!-- Display current values -->
		<p>Display Name: {profile.displayName}</p>
		<p>Bio: {profile.bio}</p>
		<p>Public: {profile.isPublic ? 'Yes' : 'No'}</p>
	{/if}
</div>

// You can also use direct assignment in event handlers:
// settings.theme = 'dark';
// settings.notifications = false;
// profile.displayName = 'New Name';
// profile.isPublic = true;
*/