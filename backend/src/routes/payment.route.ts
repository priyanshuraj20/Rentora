import { Router } from "express";
import { VerifyUser } from "../middlewares/verifyUser";
import { createOrder, verifyPayment, settleDeposit } from "../controllers/payment.controller";

const router = Router();

router.use(VerifyUser);

router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);
router.post("/settle-deposit", settleDeposit);

export default router;
