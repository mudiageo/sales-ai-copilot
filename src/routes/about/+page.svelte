<script lang="ts">
  import { onMount } from 'svelte';

  const team = [
    {
      name: 'Sarah Chen',
      role: 'CEO & Co-founder',
      bio: 'Former VP of Sales at TechCorp, Sarah has 15+ years of experience in enterprise sales and AI.',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
    },
    {
      name: 'Michael Rodriguez',
      role: 'CTO & Co-founder',
      bio: 'Previously led AI initiatives at Google, Michael brings deep expertise in machine learning and sales automation.',
      image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg'
    },
    {
      name: 'Emily Taylor',
      role: 'Head of Product',
      bio: 'Product leader with experience at Salesforce and HubSpot, focused on building intuitive sales tools.',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'
    }
  ];

  const milestones = [
    {
      year: '2023',
      title: 'Company Founded',
      description: 'AI Sales Copilot was founded with a mission to transform sales teams through AI.'
    },
    {
      year: '2024',
      title: 'Series A Funding',
      description: '$10M raised to accelerate product development and market expansion.'
    },
    {
      year: '2024',
      title: 'Global Expansion',
      description: 'Opened offices in London and Singapore to serve international customers.'
    },
    {
      year: '2025',
      title: 'Enterprise Launch',
      description: 'Released enterprise-grade features and secured first Fortune 500 clients.'
    }
  ];

  const values = [
    {
      title: 'Innovation First',
      description: 'We push the boundaries of what\'s possible with AI in sales.',
      icon: 'i-lucide-lightbulb'
    },
    {
      title: 'Customer Success',
      description: 'Your success is our success. We\'re committed to helping you achieve your sales goals.',
      icon: 'i-lucide-target'
    },
    {
      title: 'Continuous Learning',
      description: 'We constantly evolve and improve, just like our AI models.',
      icon: 'i-lucide-book-open'
    },
    {
      title: 'Transparency',
      description: 'We believe in being open and honest in everything we do.',
      icon: 'i-lucide-eye'
    }
  ];

  const pressHighlights = [
    {
      source: 'TechCrunch',
      title: 'AI Sales Copilot raises $10M to transform sales teams',
      date: 'March 2024'
    },
    {
      source: 'Forbes',
      title: 'The Future of Sales: How AI Sales Copilot is Leading the Revolution',
      date: 'January 2024'
    },
    {
      source: 'Business Insider',
      title: '10 AI Startups to Watch in 2024',
      date: 'December 2023'
    }
  ];

  const investors = [
    {
      name: 'Sequoia Capital',
      logo: 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg'
    },
    {
      name: 'Andreessen Horowitz',
      logo: 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg'
    },
    {
      name: 'Y Combinator',
      logo: 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg'
    }
  ];

  const offices = [
    {
      city: 'San Francisco',
      address: '123 Market Street, San Francisco, CA 94105',
      image: 'https://images.pexels.com/photos/208745/pexels-photo-208745.jpeg'
    },
    {
      city: 'London',
      address: '456 Oxford Street, London, UK W1C 1AP',
      image: 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg'
    },
    {
      city: 'Singapore',
      address: '789 Marina Bay, Singapore 018956',
      image: 'https://images.pexels.com/photos/4388164/pexels-photo-4388164.jpeg'
    }
  ];

  let intersectionObserver: IntersectionObserver;

  onMount(() => {
    intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-visible');
        }
      });
    }, {
      threshold: 0.1
    });

    document.querySelectorAll('.fade-in').forEach((element) => {
      intersectionObserver.observe(element);
    });

    return () => {
      intersectionObserver.disconnect();
    };
  });
</script>

<div class="min-h-screen bg-background">
  <!-- Hero Section -->
  <section class="relative py-20 bg-gradient-to-b from-primary/5 to-background">
    <div class="container mx-auto px-4">
      <div class="max-w-3xl mx-auto text-center">
        <h1 class="text-4xl font-bold mb-6">
          Transforming Sales Through Artificial Intelligence
        </h1>
        <p class="text-xl text-muted-foreground">
          We're on a mission to empower sales teams with AI-driven insights and automation,
          helping them close more deals and grow their business.
        </p>
      </div>
    </div>
  </section>

  <!-- Team Section -->
  <section class="py-20">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        {#each team as member}
          <div class="fade-in bg-card rounded-lg overflow-hidden shadow-lg">
            <img
              src={member.image}
              alt={member.name}
              class="w-full h-64 object-cover"
            />
            <div class="p-6">
              <h3 class="text-xl font-semibold mb-2">{member.name}</h3>
              <div class="text-primary mb-4">{member.role}</div>
              <p class="text-muted-foreground">{member.bio}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Values Section -->
  <section class="py-20 bg-muted/50">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold text-center mb-12">Our Values</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {#each values as value}
          <div class="fade-in bg-card rounded-lg p-6">
            <div class="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <span class={`${value.icon} h-6 w-6 text-primary`}></span>
            </div>
            <h3 class="text-xl font-semibold mb-2">{value.title}</h3>
            <p class="text-muted-foreground">{value.description}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Timeline Section -->
  <section class="py-20">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold text-center mb-12">Our Journey</h2>
      <div class="max-w-3xl mx-auto">
        {#each milestones as milestone, i}
          <div class="fade-in flex gap-4 mb-8">
            <div class="flex flex-col items-center">
              <div class="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center font-bold">
                {milestone.year}
              </div>
              {#if i !== milestones.length - 1}
                <div class="w-0.5 h-full bg-border"></div>
              {/if}
            </div>
            <div class="pt-3">
              <h3 class="text-xl font-semibold mb-2">{milestone.title}</h3>
              <p class="text-muted-foreground">{milestone.description}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Press Section -->
  <section class="py-20 bg-muted/50">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold text-center mb-12">Press & Recognition</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {#each pressHighlights as press}
          <div class="fade-in bg-card rounded-lg p-6">
            <div class="text-sm text-primary mb-2">{press.source}</div>
            <h3 class="font-semibold mb-2">{press.title}</h3>
            <div class="text-sm text-muted-foreground">{press.date}</div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Investors Section -->
  <section class="py-20">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold text-center mb-12">Backed By</h2>
      <div class="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
        {#each investors as investor}
          <div class="fade-in flex items-center justify-center">
            <img
              src={investor.logo}
              alt={investor.name}
              class="h-12 w-auto grayscale hover:grayscale-0 transition-all"
            />
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Offices Section -->
  <section class="py-20 bg-muted/50">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold text-center mb-12">Our Offices</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        {#each offices as office}
          <div class="fade-in bg-card rounded-lg overflow-hidden">
            <img
              src={office.image}
              alt={office.city}
              class="w-full h-48 object-cover"
            />
            <div class="p-6">
              <h3 class="text-xl font-semibold mb-2">{office.city}</h3>
              <p class="text-muted-foreground">{office.address}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>
</div>

<style>
  .fade-in {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  }

  .fade-in-visible {
    opacity: 1;
    transform: translateY(0);
  }
</style>