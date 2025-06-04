<script lang="ts">
  import { onMount } from 'svelte';
  import Hero from '$lib/components/Hero.svelte';
  import FeatureCard from '$lib/components/FeatureCard.svelte';
  import PricingCard from '$lib/components/PricingCard.svelte';
  import { Button } from '$lib/components/ui/button';

  const features = [
    {
      title: 'AI-Powered Analytics',
      description: 'Get deep insights into your sales performance with real-time analytics and predictive forecasting',
      icon: 'i-lucide-bar-chart-2'
    },
    {
      title: 'Smart Lead Scoring',
      description: 'Automatically prioritize leads based on behavior patterns and conversion likelihood',
      icon: 'i-lucide-target'
    },
    {
      title: 'Voice Intelligence',
      description: 'Transform sales calls into actionable insights with real-time transcription and analysis',
      icon: 'i-lucide-mic'
    },
    {
      title: 'Automated Follow-ups',
      description: 'Never miss a follow-up with AI-powered scheduling and personalized messaging',
      icon: 'i-lucide-calendar'
    },
    {
      title: 'Sales Forecasting',
      description: 'Predict future sales with machine learning models trained on your historical data',
      icon: 'i-lucide-trending-up'
    },
    {
      title: 'Team Collaboration',
      description: 'Work seamlessly with your team using built-in collaboration tools and real-time updates',
      icon: 'i-lucide-users'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Sales Director',
      company: 'TechCorp',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      quote: 'AI Sales Copilot has transformed our sales process. Our team closes 40% more deals in half the time.'
    },
    {
      name: 'Michael Chen',
      role: 'VP of Sales',
      company: 'GrowthMax',
      image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
      quote: 'The AI insights have been game-changing. We\'ve increased our conversion rate by 65% since implementing it.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Sales Manager',
      company: 'InnovateX',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
      quote: 'The automated follow-ups alone have saved our team countless hours. Best investment we\'ve made.'
    }
  ];

  const faqs = [
    {
      question: 'How does AI Sales Copilot work?',
      answer: 'AI Sales Copilot uses advanced machine learning algorithms to analyze your sales data, customer interactions, and market trends. It provides real-time insights, automates routine tasks, and helps you make data-driven decisions.'
    },
    {
      question: 'Is it difficult to integrate with our existing CRM?',
      answer: 'Not at all! We offer seamless integration with popular CRM platforms like Salesforce, HubSpot, and Pipedrive. Our team will help you set everything up within minutes.'
    },
    {
      question: 'What kind of results can I expect?',
      answer: 'Our customers typically see a 30-50% increase in sales productivity, 40% higher conversion rates, and 25% faster sales cycles within the first three months.'
    },
    {
      question: 'Do I need technical expertise to use it?',
      answer: 'No technical expertise required! Our platform is designed to be user-friendly and intuitive. We also provide comprehensive training and support.'
    },
    {
      question: 'How secure is my data?',
      answer: 'We take security seriously. All data is encrypted end-to-end, and we comply with SOC 2, GDPR, and other major security standards.'
    },
    {
      question: 'Can I try it before committing?',
      answer: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required.'
    },
    {
      question: 'What kind of support do you offer?',
      answer: 'We provide 24/7 customer support, regular training sessions, and a dedicated success manager for enterprise customers.'
    },
    {
      question: 'How often do you update the platform?',
      answer: 'We release new features and improvements every two weeks based on customer feedback and the latest AI advancements.'
    }
  ];

  const stats = [
    { value: '40%', label: 'Increase in Sales' },
    { value: '50%', label: 'Time Saved' },
    { value: '65%', label: 'Higher Conversion' },
    { value: '3x', label: 'ROI' }
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

<svelte:head>
  <title>AI Sales Copilot - Turn Every Salesperson Into Your Top Performer</title>
  <meta name="description" content="Transform your sales team with AI-powered insights, automation, and real-time coaching." />
</svelte:head>

<main class="overflow-hidden">
  <!-- Hero Section -->
  <section class="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute inset-0 bg-grid-pattern opacity-5"></div>
    </div>
    
    <div class="container mx-auto px-4 py-16 relative z-10">
      <div class="text-center max-w-4xl mx-auto">
        <h1 class="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
          Turn Every Salesperson Into Your Top Performer
        </h1>
        <p class="text-xl md:text-2xl text-muted-foreground mb-8">
          Empower your sales team with AI-driven insights, automated workflows, and real-time coaching to close more deals faster.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" class="text-lg px-8">Start Free Trial</Button>
          <Button variant="outline" size="lg" class="text-lg px-8">Watch Demo</Button>
        </div>
      </div>
    </div>
  </section>

  <!-- Stats Section -->
  <section class="py-16 bg-muted/50">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {#each stats as stat}
          <div class="fade-in">
            <div class="text-4xl font-bold text-primary mb-2">{stat.value}</div>
            <div class="text-muted-foreground">{stat.label}</div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="py-24 bg-background">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-16">Powerful Features to Boost Your Sales</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each features as feature}
          <div class="fade-in">
            <FeatureCard {...feature} />
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Testimonials Section -->
  <section class="py-24 bg-muted/50">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-16">Trusted by Industry Leaders</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        {#each testimonials as testimonial}
          <div class="fade-in bg-background rounded-lg p-6 shadow-lg">
            <div class="flex items-center mb-4">
              <img src={testimonial.image} alt={testimonial.name} class="w-12 h-12 rounded-full object-cover" />
              <div class="ml-4">
                <div class="font-semibold">{testimonial.name}</div>
                <div class="text-sm text-muted-foreground">{testimonial.role} at {testimonial.company}</div>
              </div>
            </div>
            <p class="text-muted-foreground">{testimonial.quote}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- FAQ Section -->
  <section class="py-24 bg-background">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-16">Frequently Asked Questions</h2>
      <div class="max-w-3xl mx-auto space-y-6">
        {#each faqs as faq}
          <div class="fade-in bg-card rounded-lg p-6 shadow-sm">
            <h3 class="text-lg font-semibold mb-2">{faq.question}</h3>
            <p class="text-muted-foreground">{faq.answer}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

</main>

<style>
  .bg-grid-pattern {
    background-image: radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.1) 1px, transparent 0);
    background-size: 40px 40px;
  }

  .fade-in {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  }

  .fade-in-visible {
    opacity: 1;
    transform: translateY(0);
  }

  :global(html) {
    scroll-behavior: smooth;
  }
</style>