import express from "express";
import { requireAuth } from "../middlewares/requireAuth";
import {
  createConsentRequest,
  getDeveloperConsentOverview,
  listDeveloperConsentRequests,
} from "../controllers/consent.controller";

const consentRoutes = express.Router();

consentRoutes.use(requireAuth);

consentRoutes.get("/overview", getDeveloperConsentOverview);
consentRoutes.get("/requests", listDeveloperConsentRequests);
consentRoutes.post("/requests", createConsentRequest);

export default consentRoutes;
