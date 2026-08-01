import { Router } from "express";
import { VerifyUser } from "../middlewares/verifyUser";
import {
  getBookingMessages,
  sendMessage,
  markAsRead,
} from "../controllers/message.controller";

const router = Router();

router.use(VerifyUser);

router.get("/:bookingId", getBookingMessages);
router.post("/", sendMessage);
router.patch("/:bookingId/read", markAsRead);

export default router;
