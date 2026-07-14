import { z } from 'zod';

export const deviceFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255),
    host: z.string().min(1, 'Host is required').max(255),
    protocol: z.enum(['ICMP', 'TCP']),
    port: z.string(),
    isActive: z.boolean(),
  })
  .refine(
    (data) =>
      data.protocol !== 'TCP' ||
      (data.port !== '' && Number(data.port) >= 1 && Number(data.port) <= 65535),
    { message: 'Port must be 1-65535 for TCP devices', path: ['port'] },
  );

export type DeviceFormValues = z.infer<typeof deviceFormSchema>;
