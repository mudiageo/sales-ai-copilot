<script lang="ts">
 import type { PageData } from "./$types.js";
 import ContactForm from "./contact-form.svelte";
 let { data }: { data: PageData } = $props();
  

  const offices = [
    {
      name: 'San Francisco HQ',
      address: '123 Market Street, San Francisco, CA 94105',
      phone: '+1 (415) 555-0123',
      email: 'sf@aisalescopilot.com',
      image: 'https://images.pexels.com/photos/208745/pexels-photo-208745.jpeg'
    },
    {
      name: 'London Office',
      address: '456 Oxford Street, London, UK W1C 1AP',
      phone: '+44 20 7123 4567',
      email: 'london@aisalescopilot.com',
      image: 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg'
    }
  ];

  const supportHours = {
    weekdays: '24/7',
    weekend: '9:00 AM - 5:00 PM PT',
    response: 'Within 1 hour for priority support'
  };

  const socialLinks = [
    { name: 'Twitter', url: 'https://twitter.com/aisalescopilot', icon: 'i-lucide-twitter' },
    { name: 'LinkedIn', url: 'https://linkedin.com/company/aisalescopilot', icon: 'i-lucide-linkedin' },
    { name: 'GitHub', url: 'https://github.com/aisalescopilot', icon: 'i-lucide-github' }
  ];
</script>

<div class="min-h-screen bg-background">
  <main class="container mx-auto px-4 py-16">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold mb-8">Get in Touch</h1>

      <!-- Contact Form -->
      <div class="bg-card rounded-lg p-8 shadow-lg mb-16">
   <ContactForm {data} />
      </div>

      <!-- Support Hours -->
      <div class="bg-muted/50 rounded-lg p-8 mb-16">
        <h2 class="text-2xl font-bold mb-6">Support Hours</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 class="font-semibold mb-2">Weekdays</h3>
            <p class="text-muted-foreground">{supportHours.weekdays}</p>
          </div>
          <div>
            <h3 class="font-semibold mb-2">Weekend</h3>
            <p class="text-muted-foreground">{supportHours.weekend}</p>
          </div>
          <div>
            <h3 class="font-semibold mb-2">Response Time</h3>
            <p class="text-muted-foreground">{supportHours.response}</p>
          </div>
        </div>
      </div>

      <!-- Office Locations -->
      <div class="mb-16">
        <h2 class="text-2xl font-bold mb-6">Our Offices</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          {#each offices as office}
            <div class="bg-card rounded-lg overflow-hidden shadow-lg">
              <img
                src={office.image}
                alt={office.name}
                class="w-full h-48 object-cover"
              />
              <div class="p-6">
                <h3 class="text-xl font-semibold mb-2">{office.name}</h3>
                <p class="text-muted-foreground mb-4">{office.address}</p>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="i-lucide-phone h-4 w-4"></span>
                    <span>{office.phone}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="i-lucide-mail h-4 w-4"></span>
                    <span>{office.email}</span>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Social Links -->
      <div class="text-center">
        <h2 class="text-2xl font-bold mb-6">Connect With Us</h2>
        <div class="flex justify-center gap-6">
          {#each socialLinks as link}
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              class="text-muted-foreground hover:text-foreground transition-colors"
            >
              <span class={`${link.icon} h-6 w-6`}></span>
              <span class="sr-only">{link.name}</span>
            </a>
          {/each}
        </div>
      </div>
    </div>
  </main>
</div>