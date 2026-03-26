import express from "express";
import {
  checkAuth,
  getNonce,
  setRoleSelection,
  verifySiwe,
} from "../controllers/auth.controller";

const authRoutes = express.Router();

authRoutes.get("/is-authorized", checkAuth);
authRoutes.get("/get-nonce", getNonce);
authRoutes.post("/verify", verifySiwe);
authRoutes.post("/set-role", setRoleSelection);

export default authRoutes;
