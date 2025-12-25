import { z } from 'zod';

export const orderValidation = {
  create: z.object({
    name: z.string().min(1, 'Customer name is required'),
    mobile: z.string().min(1, 'Mobile number is required'),
  }),
  update: z.object({
    id: z.string().uuid('Invalid ID format'),
    name: z.string().optional(),
  }),
};
