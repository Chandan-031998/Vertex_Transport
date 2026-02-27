import * as repo from "./fleet.repo.js";

export const FleetService = {
  listVehicles: repo.listVehicles,
  getVehicle: repo.getVehicle,
  createVehicle: repo.createVehicle,
  updateVehicle: repo.updateVehicle,
  deleteVehicle: repo.deleteVehicle,
  addVehicleDocument: repo.addVehicleDocument,
  listVehicleDocuments: repo.listVehicleDocuments,

  createMaintenanceSchedule: repo.createMaintenanceSchedule,
  listMaintenanceSchedules: repo.listMaintenanceSchedules,

  createTyre: repo.createTyre,
  moveTyre: repo.moveTyre,
  replaceTyre: repo.replaceTyre,
  listTyres: repo.listTyres,
  listTyreHistory: repo.listTyreHistory,

  createFuelLog: repo.createFuelLog,
  listFuelLogs: repo.listFuelLogs,
  getFuelTheftSignals: repo.getFuelTheftSignals,

  createBreakdown: repo.createBreakdown,
  listBreakdowns: repo.listBreakdowns,

  createAmc: repo.createAmc,
  listAmc: repo.listAmc,

  getVehicleExpiryAlerts: repo.getVehicleExpiryAlerts,
  getFleetSummary: repo.getFleetSummary,
  getVehicleDocumentReminderBuckets: repo.getVehicleDocumentReminderBuckets,
};
