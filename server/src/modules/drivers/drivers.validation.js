import { z } from "zod";

export const driverCreateSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    phone: z.string().optional().nullable(),
    license_no: z.string().optional().nullable(),
    license_expiry: z.string().optional().nullable(),
    date_of_birth: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    aadhaar_number: z.string().optional().nullable(),
    pan_number: z.string().optional().nullable(),
    blood_group: z.string().optional().nullable(),
    photo_path: z.string().optional().nullable(),
    emergency_contact_name: z.string().optional().nullable(),
    emergency_contact_phone: z.string().optional().nullable(),
    joining_date: z.string().optional().nullable(),
    experience_years: z.number().nonnegative().optional().nullable(),
    salary: z.number().nonnegative().optional().nullable(),
    commission_type: z.enum(["FIXED", "PER_TRIP", "PERCENTAGE"]).optional().nullable(),
    driving_badge_number: z.string().optional().nullable(),
    bank_name: z.string().optional().nullable(),
    account_number: z.string().optional().nullable(),
    ifsc_code: z.string().optional().nullable(),
    upi_id: z.string().optional().nullable(),
  }),
});

export const driverUpdateSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional().nullable(),
    license_no: z.string().optional().nullable(),
    license_expiry: z.string().optional().nullable(),
    date_of_birth: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    aadhaar_number: z.string().optional().nullable(),
    pan_number: z.string().optional().nullable(),
    blood_group: z.string().optional().nullable(),
    photo_path: z.string().optional().nullable(),
    emergency_contact_name: z.string().optional().nullable(),
    emergency_contact_phone: z.string().optional().nullable(),
    joining_date: z.string().optional().nullable(),
    experience_years: z.number().nonnegative().optional().nullable(),
    salary: z.number().nonnegative().optional().nullable(),
    commission_type: z.enum(["FIXED", "PER_TRIP", "PERCENTAGE"]).optional().nullable(),
    driving_badge_number: z.string().optional().nullable(),
    bank_name: z.string().optional().nullable(),
    account_number: z.string().optional().nullable(),
    ifsc_code: z.string().optional().nullable(),
    upi_id: z.string().optional().nullable(),
    kyc_status: z.enum(["PENDING", "VERIFIED", "REJECTED"]).optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  }),
});

export const kycStatusUpdateSchema = z.object({
  params: z.object({ driverId: z.string(), docId: z.string() }),
  body: z.object({
    status: z.enum(["VERIFIED", "REJECTED"]),
    reject_reason: z.string().max(255).optional().nullable(),
  }),
});

export const compensationCreateSchema = z.object({
  body: z.object({
    driver_id: z.number().int().positive(),
    monthly_salary: z.number().nonnegative(),
    incentive_per_trip: z.number().nonnegative().optional(),
    incentive_per_km: z.number().nonnegative().optional(),
    effective_from: z.string(),
    effective_to: z.string().optional().nullable(),
  }),
});

export const advanceCreateSchema = z.object({
  body: z.object({
    driver_id: z.number().int().positive(),
    advance_date: z.string(),
    amount: z.number().positive(),
    note: z.string().optional().nullable(),
  }),
});

export const settlementCreateSchema = z.object({
  body: z.object({
    driver_id: z.number().int().positive(),
    settlement_date: z.string(),
    gross_amount: z.number().nonnegative(),
    advance_deduction: z.number().nonnegative().optional(),
    note: z.string().optional().nullable(),
  }),
});

export const commissionCalculateSchema = z.object({
  body: z.object({
    driver_id: z.number().int().positive(),
    period_from: z.string(),
    period_to: z.string(),
    rate_per_trip: z.number().nonnegative(),
    incentive_bonus: z.number().nonnegative().optional(),
  }),
});

export const attendanceUpsertSchema = z.object({
  body: z.object({
    driver_id: z.number().int().positive(),
    attendance_date: z.string(),
    check_in_at: z.string().optional().nullable(),
    check_in_lat: z.number().optional().nullable(),
    check_in_lng: z.number().optional().nullable(),
    check_out_at: z.string().optional().nullable(),
    check_out_lat: z.number().optional().nullable(),
    check_out_lng: z.number().optional().nullable(),
    source: z.enum(["GPS", "APP"]).optional(),
    status: z.enum(["PRESENT", "ABSENT", "LEAVE"]).optional(),
  }),
});

export const performanceGenerateSchema = z.object({
  body: z.object({
    driver_id: z.number().int().positive(),
    period_from: z.string(),
    period_to: z.string(),
    remarks: z.string().optional().nullable(),
  }),
});

export const statutoryUpsertSchema = z.object({
  body: z.object({
    driver_id: z.number().int().positive(),
    esi_no: z.string().optional().nullable(),
    pf_no: z.string().optional().nullable(),
    uan_no: z.string().optional().nullable(),
    esi_enrolled_on: z.string().optional().nullable(),
    pf_enrolled_on: z.string().optional().nullable(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  }),
});
