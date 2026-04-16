import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import appsRoutes from "./routes/apps.routes";
import vaultRoutes from "./routes/vault.routes";
import consentRoutes from "./routes/consent.routes";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("Backend is running successfully!");
});
app.use("/api/auth", authRoutes);
app.use("/api/apps", appsRoutes);
app.use("/api/vault", vaultRoutes);
app.use("/api/consents", consentRoutes);

export default app;
