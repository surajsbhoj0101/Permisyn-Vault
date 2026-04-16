import express from "express";
import { requireAuth } from "../middlewares/requireAuth";
import {
  checkAuth,
  getNonce,
  logout,
  setRoleSelection,
  verifySiwe,
  checkUsernameTaken,
  checkEmailTaken,
  requestOtp,
  verifyOtp,
} from "../controllers/auth.controller";

const authRoutes = express.Router();

authRoutes.get("/is-authorized", checkAuth);
authRoutes.get("/get-nonce", getNonce);
authRoutes.post("/logout", logout);
authRoutes.post("/verify", verifySiwe);
authRoutes.post("/request-otp", requireAuth, requestOtp);
authRoutes.post("/verify-otp", requireAuth, verifyOtp);
authRoutes.post("/set-role", requireAuth, setRoleSelection);
authRoutes.get("/check-username/:username", requireAuth, checkUsernameTaken);
authRoutes.get("/check-email/:email", checkEmailTaken);

export default authRoutes;
