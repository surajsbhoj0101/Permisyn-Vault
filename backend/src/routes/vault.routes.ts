import express from "express";
import { requireAuth } from "../middlewares/requireAuth";
import {
  createVaultRecord,
  updateVaultRecord,
  decideConsentRequest,
  deleteVaultRecord,
  getUserOverview,
  listUserAccessLogs,
  listUserConsentRequests,
  listVaultRecords,
  revokeConsentRequest,
} from "../controllers/consent.controller";

const vaultRoutes = express.Router();

vaultRoutes.use(requireAuth);

vaultRoutes.get("/overview", getUserOverview);
vaultRoutes.get("/records", listVaultRecords);
vaultRoutes.post("/records", createVaultRecord);
vaultRoutes.put("/records/:recordId", updateVaultRecord);
vaultRoutes.delete("/records/:recordId", deleteVaultRecord);

vaultRoutes.get("/consent-requests", listUserConsentRequests);
vaultRoutes.post("/consent-requests/:requestId/decision", decideConsentRequest);
vaultRoutes.post("/consent-requests/:requestId/revoke", revokeConsentRequest);

vaultRoutes.get("/access-logs", listUserAccessLogs);

export default vaultRoutes;
