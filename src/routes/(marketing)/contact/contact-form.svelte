<script lang="ts">
 import * as Form from "$lib/components/ui/form";
 import { Input } from "$lib/components/ui/input";
 import { Textarea } from '$lib/components/ui/textarea';
  import * as Select from '$lib/components/ui/select';
  import { onMount } from 'svelte';
  
 import { formSchema, type FormSchema } from "./schema";
 import {
  type SuperValidated,
  type Infer,
  superForm,
 } from "sveltekit-superforms";
 import { zodClient } from "sveltekit-superforms/adapters";
 
 let { data }: { data: { form: SuperValidated<Infer<FormSchema>> } } =
  $props();
 
 const form = superForm(data.form, {
  validators: zodClient(formSchema),
 });
 
 const { form: formData, enhance } = form;
 
 const isSubmitting = false
</script>

<form class="space-y-6" method="POST" use:enhance >
      
<Form.Field {form} name="name">
  <Form.Control>
   {#snippet children({ props })}
    <Form.Label>Name</Form.Label>
    <Input {...props} bind:value={$formData.name} placeholder="Your name" />
   {/snippet}
  </Form.Control>
  <Form.FieldErrors />
 </Form.Field>
<Form.Field {form} name="email">
  <Form.Control>
   {#snippet children({ props })}
    <Form.Label>Email</Form.Label>
    <Input {...props} bind:value={$formData.email} type="email" placeholder="you@example.com" />
   {/snippet}
  </Form.Control>
  <Form.FieldErrors />
 </Form.Field>
<Form.Field {form} name="company">
  <Form.Control>
   {#snippet children({ props })}
    <Form.Label>Company</Form.Label>
    <Input {...props} bind:value={$formData.company} placeholder="Your Company" />
   {/snippet}
  </Form.Control>
  <Form.FieldErrors />
 </Form.Field>
 
 <Form.Field {form} name="inquiryType">
  <Form.Control>
   {#snippet children({ props })}
    <Form.Label>Inquiry Type</Form.Label>
    <Select.Root
     type="single"
     bind:value={$formData.inquiryType}
     name={props.name}
    >
     <Select.Trigger {...props}>
      {$formData.inquiryType
       ? $formData.inquiryType
       : "Select an inquiry type"}
     </Select.Trigger>
     <Select.Content>
              <Select.Item value="general" label="General Inquiry"  />
              <Select.Item value="sales" label="Sales"  />
              <Select.Item value="support" label="Support"  />
              <Select.Item value="partnership" label="Partnership"  />
      <Select.Item value="m@example.com" label="m@example.com" />
      <Select.Item value="m@google.com" label="m@google.com" />
      <Select.Item value="m@support.com" label="m@support.com" />
     </Select.Content>
    </Select.Root>
   {/snippet}
  </Form.Control>

  <Form.FieldErrors />
 </Form.Field>

          <Form.Field {form} name="message">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Message</Form.Label>
        <Textarea
          {...props}
          placeholder="How can we help?" 
          rows={5}
          class="resize-none"
          bind:value={$formData.message}
        />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>

          <Form.Button disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Form.Button>
        </form>