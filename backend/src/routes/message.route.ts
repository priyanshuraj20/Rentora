import { Router } from "express";
import { VerifyUser } from "../middlewares/verifyUser";
import {
  getBookingMessages,
  sendMessage,
  markAsRead,
  clearConversation,
  deleteSingleMessage,
} from "../controllers/message.controller";

const router = Router();

router.use(VerifyUser);

router.get("/:bookingId", getBookingMessages);
router.post("/", sendMessage);
router.patch("/:bookingId/read", markAsRead);
router.delete("/:bookingId", clearConversation);
router.delete("/single/:messageId", deleteSingleMessage);

export default router;
