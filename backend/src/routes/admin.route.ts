import { Router } from "express";
import { VerifyUser } from "../middlewares/verifyUser";
import { restrictTo } from "../middlewares/restrictTo";
import {
  getPlatformOverview,
  getAdminUsers,
  toggleUserBlock,
  updateUserRole,
  getEscrowLedger,
} from "../controllers/admin.controller";

const router = Router();

// Governance endpoints strictly require authenticated session and admin role
router.use(VerifyUser);
router.use(restrictTo("admin"));

router.get("/overview", getPlatformOverview);
router.get("/users", getAdminUsers);
router.patch("/users/:id/toggle-block", toggleUserBlock);
router.patch("/users/:id/role", updateUserRole);
router.get("/escrow-ledger", getEscrowLedger);

export default router;
