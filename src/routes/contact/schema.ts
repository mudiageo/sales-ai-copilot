import { z } from 'zod';

export const formSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    company: z.string().min(1, { message: 'Company name is required' }),
    inquiryType: z.enum(['general', 'sales', 'support', 'partnership'], {
      required_error: 'Please select an inquiry type',
    }),
    message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
  });
  
export type FormSchema = typeof formSchema;