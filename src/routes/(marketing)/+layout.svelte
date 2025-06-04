<script lang="ts">
  import Navigation from '$lib/components/Navigation.svelte';
	
	let { children } = $props();
</script>

<Navigation />

{@render children()}

  <!-- Footer -->
  <footer class="bg-muted py-16">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 class="font-bold text-lg mb-4">AI Sales Copilot</h3>
          <p class="text-muted-foreground">Transforming sales teams with the power of AI</p>
        </div>
        <div>
          <h4 class="font-semibold mb-4">Product</h4>
          <ul class="space-y-2">
            <li><a href="/features" class="text-muted-foreground hover:text-foreground">Features</a></li>
            <li><a href="/pricing" class="text-muted-foreground hover:text-foreground">Pricing</a></li>
            <li><a href="/about" class="text-muted-foreground hover:text-foreground">About</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold mb-4">Resources</h4>
          <ul class="space-y-2">
            <li><a href="/blog" class="text-muted-foreground hover:text-foreground">Blog</a></li>
            <li><a href="/docs" class="text-muted-foreground hover:text-foreground">Documentation</a></li>
            <li><a href="/support" class="text-muted-foreground hover:text-foreground">Support</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold mb-4">Connect</h4>
          <ul class="space-y-2">
            <li><a href="/contact" class="text-muted-foreground hover:text-foreground">Contact</a></li>
            <li><a href="https://twitter.com" class="text-muted-foreground hover:text-foreground">Twitter</a></li>
            <li><a href="https://linkedin.com" class="text-muted-foreground hover:text-foreground">LinkedIn</a></li>
          </ul>
        </div>
      </div>
      <div class="mt-16 pt-8 border-t border-border text-center text-muted-foreground">
        <p>&copy; 2025 AI Sales Copilot. All rights reserved.</p>
      </div>
    </div>
  </footer>
