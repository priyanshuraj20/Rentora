import { Request, Response } from "express";
import { verifyPhoneFirebaseService } from "../service/verification.service";
import { catchAsync } from "../utils/catchAsync";

export const verifyPhoneFirebase = catchAsync(async (req: Request, res: Response) => {
  const { idToken, phoneNumber } = req.body;
  const result = await verifyPhoneFirebaseService(req.userId!, idToken, phoneNumber);
  res.status(200).json({ success: true, data: result, message: result.message });
});
