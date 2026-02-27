import { z } from "zod";

export const updateCompanySettingsSchema = z.object({
  body: z.object({
    brand_name: z.string().min(1).max(255).nullish(),
    company_address: z.string().max(500).nullish(),
    gst_no: z.string().max(32).nullish(),
    gst_type: z.enum(["REGULAR", "COMPOSITION", "UNREGISTERED"]).nullish(),
    financial_year_start: z.string().nullish(),
    invoice_prefix: z.string().max(32).nullish(),
    invoice_series: z.number().int().positive().nullish(),
    logo_url: z.string().url().max(512).nullish(),
    primary_color: z.string().max(32).nullish(),
    secondary_color: z.string().max(32).nullish(),
    ui_style: z.enum(["CLASSIC", "SOFT", "GLASS"]).nullish(),
    support_email: z.string().email().max(255).nullish(),
    support_phone: z.string().max(32).nullish(),
    invoice_footer: z.string().max(500).nullish(),
    notify_email: z.boolean().nullish(),
    notify_whatsapp: z.boolean().nullish(),
    notify_sms: z.boolean().nullish(),
    feature_toggles: z.record(z.boolean()).nullish(),
  }),
  query: z.any(),
  params: z.any(),
});

export const branchCreateSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    address: z.string().max(500).nullish(),
    city: z.string().max(120).nullish(),
    state: z.string().max(120).nullish(),
    pincode: z.string().max(20).nullish(),
    contact_name: z.string().max(255).nullish(),
    contact_phone: z.string().max(32).nullish(),
    is_hub: z.boolean().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  }),
  query: z.any(),
  params: z.any(),
});

export const branchUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    address: z.string().max(500).nullish(),
    city: z.string().max(120).nullish(),
    state: z.string().max(120).nullish(),
    pincode: z.string().max(20).nullish(),
    contact_name: z.string().max(255).nullish(),
    contact_phone: z.string().max(32).nullish(),
    is_hub: z.boolean().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  }),
  query: z.any(),
  params: z.object({ id: z.string().regex(/^\d+$/) }),
});
