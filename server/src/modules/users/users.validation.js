import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8)
  .max(100)
  .regex(/[a-z]/, "Password must include lowercase")
  .regex(/[A-Z]/, "Password must include uppercase")
  .regex(/[0-9]/, "Password must include number");

export const userCreateSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    role_id: z.number().int().positive(),
    driver_id: z.number().int().positive().optional().nullable(),
    password: passwordSchema,
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  }),
  query: z.any(),
  params: z.any(),
});

export const userUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    role_id: z.number().int().positive().optional(),
    driver_id: z.number().int().positive().optional().nullable(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  }),
  query: z.any(),
  params: z.object({ id: z.string().regex(/^\d+$/) }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    password: passwordSchema,
  }),
  query: z.any(),
  params: z.object({ id: z.string().regex(/^\d+$/) }),
});
