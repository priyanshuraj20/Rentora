import { Router } from "express";
import { VerifyUser } from "../middlewares/verifyUser";
import {
  getNotifications,
  markAsRead,
} from "../controllers/notification.controller";

const router = Router();

router.use(VerifyUser);

router.get("/", getNotifications);
router.patch("/read", markAsRead);

export default router;
