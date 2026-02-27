import { z } from "zod";

export const tripCreateSchema = z.object({
  body: z.object({
    trip_code: z.string().min(3),
    origin: z.string().min(2),
    destination: z.string().min(2),
    vehicle_id: z.number().int().optional().nullable(),
    driver_id: z.number().int().optional().nullable(),
    start_date: z.string().optional().nullable(),
    end_date: z.string().optional().nullable(),
  }),
});

export const tripUpdateSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    vehicle_id: z.number().int().optional().nullable(),
    driver_id: z.number().int().optional().nullable(),
    start_date: z.string().optional().nullable(),
    end_date: z.string().optional().nullable(),
    status: z.enum(["PLANNED","ASSIGNED","STARTED","IN_TRANSIT","DELIVERED","POD_SUBMITTED","CLOSED","SETTLED"]).optional(),
  }),
});

export const expenseCreateSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    expense_type: z.enum(["TOLL","DIESEL","FOOD","REPAIR","OTHER"]),
    amount: z.number().nonnegative(),
    note: z.string().optional().nullable(),
  }),
});

export const reviewStatusSchema = z.object({
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
  }),
  params: z.any(),
  query: z.any(),
});
