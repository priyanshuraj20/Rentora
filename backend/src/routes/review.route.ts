import { Router } from "express";
import { VerifyUser } from "../middlewares/verifyUser";
import { createReview, getItemReviews } from "../controllers/review.controller";

const router = Router();

router.get("/items/:itemId", getItemReviews);
router.post("/items", VerifyUser, createReview);

export default router;
