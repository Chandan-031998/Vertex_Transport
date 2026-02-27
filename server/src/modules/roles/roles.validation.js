import { z } from "zod";

export const roleCreateSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().max(255).nullish(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    permission_codes: z.array(z.string().min(1)).optional(),
  }),
  query: z.any(),
  params: z.any(),
});

export const roleUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().max(255).nullish(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    permission_codes: z.array(z.string().min(1)).optional(),
  }),
  query: z.any(),
  params: z.object({ id: z.string().regex(/^\d+$/) }),
});
