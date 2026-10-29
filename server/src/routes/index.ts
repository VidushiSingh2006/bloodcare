import { Router } from "express";
import { login, me, register } from "../controllers/auth.controller";
import {
  publicCompatibility,
  publicCreateRequest,
  publicOverview,
} from "../controllers/public.controller";
import {
  adminDashboard,
  createDonation,
  createDonor,
  createRequestAdmin,
  deleteRequest,
  listDonations,
  listDonors,
  listRequests,
  patchRequest,
  removeDonor,
  updateDonor,
} from "../controllers/admin.controller";
import { validate } from "../middleware/validate";
import { loginSchema, registerSchema } from "../validators/auth.schema";
import { donorQuerySchema, donorWriteSchema } from "../validators/donor.schema";
import { donationWriteSchema } from "../validators/donation.schema";
import { requestPatchSchema, requestWriteSchema } from "../validators/request.schema";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { compatibilityFor } from "../services/inventory.service";
import { asyncHandler } from "../utils/asyncHandler";
import { BLOOD_GROUPS } from "../domain/blood";
import { BloodGroup } from "@prisma/client";
import { ApiError } from "../utils/ApiError";

export const api = Router();

api.post("/auth/login", validate(loginSchema), login);
api.post("/auth/register", validate(registerSchema), register);
api.get("/auth/me", requireAuth, me);

api.get("/public/overview", publicOverview);
api.get("/public/compatibility", publicCompatibility);
api.post("/public/requests", validate(requestWriteSchema), publicCreateRequest);

api.use("/admin", requireAuth, requireAdmin);
api.get("/admin/dashboard", adminDashboard);
api.get("/admin/donors", validate(donorQuerySchema, "query"), listDonors);
api.post("/admin/donors", validate(donorWriteSchema), createDonor);
api.put("/admin/donors/:id", validate(donorWriteSchema), updateDonor);
api.delete("/admin/donors/:id", removeDonor);
api.get("/admin/donations", listDonations);
api.post("/admin/donations", validate(donationWriteSchema), createDonation);
api.get("/admin/requests", listRequests);
api.post("/admin/requests", validate(requestWriteSchema), createRequestAdmin);
api.patch("/admin/requests/:id", validate(requestPatchSchema), patchRequest);
api.delete("/admin/requests/:id", deleteRequest);
api.get(
  "/admin/compatibility",
  asyncHandler(async (req, res) => {
    const raw = String(req.query.group ?? "A_POS");
    if (!BLOOD_GROUPS.includes(raw as BloodGroup)) throw new ApiError(400, "Unknown blood group");
    res.json(await compatibilityFor(raw as BloodGroup));
  })
);
