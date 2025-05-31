<script lang="ts">
</script>

<div class="min-h-screen bg-background">
  <main class="container mx-auto px-4 py-16">
    <h1 class="text-4xl font-bold text-center mb-8">Contact Us</h1>
    
    <div class="max-w-2xl mx-auto">
      <form class="space-y-6">
        <div>
          <label for="name" class="block text-sm font-medium mb-2">Name</label>
          <input
            type="text"
            id="name"
            class="w-full p-2 border rounded-md"
            placeholder="Your name"
          />
        </div>
        
        <div>
          <label for="email" class="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            id="email"
            class="w-full p-2 border rounded-md"
            placeholder="your@email.com"
          />
        </div>
        
        <div>
          <label for="message" class="block text-sm font-medium mb-2">Message</label>
          <textarea
            id="message"
            class="w-full p-2 border rounded-md h-32"
            placeholder="How can we help?"
          ></textarea>
        </div>
        
        <button
          type="submit"
          class="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90"
        >
          Send Message
        </button>
      </form>
    </div>
  </main>
</div>