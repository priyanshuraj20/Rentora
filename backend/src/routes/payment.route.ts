import { Router } from "express";
import { VerifyUser } from "../middlewares/verifyUser";
import { createOrder, verifyPayment } from "../controllers/payment.controller";

const router = Router();

router.use(VerifyUser);

router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);

export default router;
