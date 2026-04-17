import express from "express";
import type { NextFunction, Request, Response } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import {
  createConsentRequest,
  getDeveloperConsentOverview,
  listDeveloperConsentRequests,
  getRequiredScopesForConsentRequest,
} from "../controllers/consent.controller";
import { verify } from "../middlewares/verification/verify.middleware";

const consentRoutes = express.Router();

const requireDeveloperSessionOrApiKey = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const hasApiKey =
    typeof req.headers["x-api-key"] === "string" ||
    (typeof req.headers.authorization === "string" &&
      req.headers.authorization.startsWith("Bearer "));

  if (hasApiKey) {
    return verify(req, res, next);
  }

  return requireAuth(req, res, next);
};

consentRoutes.get(
  "/required-scopes",
  verify,
  getRequiredScopesForConsentRequest,
);
consentRoutes.get("/overview", requireAuth, getDeveloperConsentOverview);
consentRoutes.get("/requests", requireAuth, listDeveloperConsentRequests);
consentRoutes.post(
  "/requests",
  requireDeveloperSessionOrApiKey,
  createConsentRequest,
);

export default consentRoutes;
