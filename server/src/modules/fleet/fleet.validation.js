import { z } from "zod";

export const vehicleCreateSchema = z.object({
  body: z.object({
    vehicle_no: z.string().min(3),
    vehicle_type: z.enum(["LCV","HCV","CONTAINER","TANKER","TIPPER","BUS","TEMPO","EV"]),
    make: z.string().optional().nullable(),
    model: z.string().optional().nullable(),
    year: z.number().int().optional().nullable(),
    chassis_number: z.string().optional().nullable(),
    engine_number: z.string().optional().nullable(),
    fuel_type: z.enum(["DIESEL", "PETROL", "EV", "CNG"]).optional().nullable(),
    vehicle_capacity_tons: z.number().nonnegative().optional().nullable(),
    odometer_reading: z.number().int().nonnegative().optional().nullable(),
    fuel_tank_capacity_liters: z.number().nonnegative().optional().nullable(),
    rc_owner_name: z.string().optional().nullable(),
    rc_owner_address: z.string().optional().nullable(),
    insurance_provider: z.string().optional().nullable(),
    policy_number: z.string().optional().nullable(),
    insurance_start_date: z.string().optional().nullable(),
    insurance_expiry_date: z.string().optional().nullable(),
    permit_type: z.enum(["STATE", "NATIONAL"]).optional().nullable(),
    permit_state: z.string().optional().nullable(),
    permit_expiry_date: z.string().optional().nullable(),
    gps_device_id: z.string().optional().nullable(),
    fastag_id: z.string().optional().nullable(),
    purchase_date: z.string().optional().nullable(),
    purchase_cost: z.number().nonnegative().optional().nullable(),
    loan_emi: z.number().nonnegative().optional().nullable(),
    emi_due_date: z.string().optional().nullable(),
  }),
});

export const vehicleUpdateSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    vehicle_type: z.enum(["LCV","HCV","CONTAINER","TANKER","TIPPER","BUS","TEMPO","EV"]).optional(),
    make: z.string().optional().nullable(),
    model: z.string().optional().nullable(),
    year: z.number().int().optional().nullable(),
    chassis_number: z.string().optional().nullable(),
    engine_number: z.string().optional().nullable(),
    fuel_type: z.enum(["DIESEL", "PETROL", "EV", "CNG"]).optional().nullable(),
    vehicle_capacity_tons: z.number().nonnegative().optional().nullable(),
    odometer_reading: z.number().int().nonnegative().optional().nullable(),
    fuel_tank_capacity_liters: z.number().nonnegative().optional().nullable(),
    rc_owner_name: z.string().optional().nullable(),
    rc_owner_address: z.string().optional().nullable(),
    insurance_provider: z.string().optional().nullable(),
    policy_number: z.string().optional().nullable(),
    insurance_start_date: z.string().optional().nullable(),
    insurance_expiry_date: z.string().optional().nullable(),
    permit_type: z.enum(["STATE", "NATIONAL"]).optional().nullable(),
    permit_state: z.string().optional().nullable(),
    permit_expiry_date: z.string().optional().nullable(),
    gps_device_id: z.string().optional().nullable(),
    fastag_id: z.string().optional().nullable(),
    purchase_date: z.string().optional().nullable(),
    purchase_cost: z.number().nonnegative().optional().nullable(),
    loan_emi: z.number().nonnegative().optional().nullable(),
    emi_due_date: z.string().optional().nullable(),
    status: z.enum(["ACTIVE","INACTIVE","MAINTENANCE"]).optional(),
  }),
});

export const maintenanceCreateSchema = z.object({
  body: z.object({
    vehicle_id: z.number().int().positive(),
    service_type: z.string().min(2),
    due_date: z.string().optional().nullable(),
    due_odometer: z.number().int().optional().nullable(),
    reminder_days: z.number().int().min(0).max(365).optional(),
    last_service_date: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const tyreCreateSchema = z.object({
  body: z.object({
    vehicle_id: z.number().int().positive(),
    tyre_code: z.string().min(2),
    position_code: z.string().min(1),
    installed_on: z.string(),
    purchase_cost: z.number().nonnegative().optional(),
  }),
});

export const tyreMoveSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    to_position_code: z.string().min(1),
    moved_on: z.string(),
    odometer: z.number().int().optional().nullable(),
    cost: z.number().nonnegative().optional(),
    notes: z.string().optional().nullable(),
  }),
});

export const tyreReplaceSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    removed_on: z.string(),
    replacement_cost: z.number().nonnegative().optional(),
    notes: z.string().optional().nullable(),
  }),
});

export const fuelLogCreateSchema = z.object({
  body: z.object({
    vehicle_id: z.number().int().positive(),
    log_date: z.string(),
    odometer: z.number().int().positive(),
    liters: z.number().positive(),
    amount: z.number().nonnegative(),
    fuel_station: z.string().optional().nullable(),
    expected_mileage: z.number().positive().optional().nullable(),
  }),
});

export const breakdownCreateSchema = z.object({
  body: z.object({
    vehicle_id: z.number().int().positive(),
    breakdown_at: z.string(),
    location: z.string().optional().nullable(),
    issue: z.string().min(3),
    severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  }),
});

export const amcCreateSchema = z.object({
  body: z.object({
    vehicle_id: z.number().int().positive(),
    provider_name: z.string().min(2),
    start_date: z.string(),
    end_date: z.string(),
    cost: z.number().nonnegative().optional(),
    notes: z.string().optional().nullable(),
  }),
});
