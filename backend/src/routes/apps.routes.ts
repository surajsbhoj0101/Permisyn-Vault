import express from "express";
import { requireAuth } from "../middlewares/requireAuth";
import {
  createApplication,
  createColumn,
  createTable,
  deleteApplication,
  deleteColumn,
  deleteTable,
  listApplications,
  listColumns,
  listTables,
  rotateApiKey,
} from "../controllers/apps.controller";

const appsRoutes = express.Router();

appsRoutes.use(requireAuth);

appsRoutes.get("/", listApplications);
appsRoutes.post("/", createApplication);
appsRoutes.delete("/:appId", deleteApplication);
appsRoutes.post("/:appId/keys", rotateApiKey);

appsRoutes.get("/:appId/tables", listTables);
appsRoutes.post("/:appId/tables", createTable);
appsRoutes.delete("/:appId/tables/:tableId", deleteTable);

appsRoutes.get("/:appId/tables/:tableId/columns", listColumns);
appsRoutes.post("/:appId/tables/:tableId/columns", createColumn);
appsRoutes.delete("/:appId/tables/:tableId/columns/:columnId", deleteColumn);

export default appsRoutes;
