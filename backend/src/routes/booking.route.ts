import { Router } from "express";
import {
  acceptBooking,
  cancelBooking,
  createBooking,
  getBookingById,
  getBookings,
  rejectBooking,
  completeBooking,
  uploadBookingPhotos,
  getBookingQR,
  confirmBookingScan,
} from "../controllers/booking.controller";
import { VerifyUser } from "../middlewares/verifyUser";
import { restrictTo } from "../middlewares/restrictTo";
import { uploadMultipleImages } from "../middlewares/upload.middleware";
import { qrGenerationLimiter } from "../middlewares/rateLimiter.middleware";
const router = Router();

router.use(VerifyUser);

// for user and owner to get all their bookings
/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings (owner or renter)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   item:
 *                     type: object
 *                     nullable: true
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       image:
 *                         type: string
 *                         nullable: true
 *                   date:
 *                     type: object
 *                     properties:
 *                       startDate:
 *                         type: string
 *                       endDate:
 *                         type: string
 *                   totalAmount:
 *                     type: number
 *                   status:
 *                     type: string
 *                   paymentStatus:
 *                     type: string
 */
router.get("/", getBookings);

// for user to create a booking
/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *               - startDate
 *               - endDate
 *               - pricing
 *             properties:
 *               itemId:
 *                 type: string
 *               ownerId:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 example: 2026-03-01
 *               endDate:
 *                 type: string
 *                 example: 2026-03-05
 *               pricing:
 *                 type: object
 *                 properties:
 *                   baseRate:
 *                     type: number
 *                   discountApplied:
 *                     type: number
 *                   securityDeposit:
 *                     type: number
 *                   tax:
 *                     type: number
 *                   platformFee:
 *                     type: number
 *                   totalAmount:
 *                     type: number
 *     responses:
 *       200:
 *         description: Booking created successfully
 *       400:
 *         description: Invalid input / dates
 *       404:
 *         description: Item not found
 *       409:
 *         description: Item already booked
 */
router.post("/", createBooking);

// for user & owner to get details of a specific booking
/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get booking details
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 item:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     image:
 *                       type: string
 *                     category:
 *                       type: string
 *                 pricing:
 *                   type: object
 *                   properties:
 *                     baseRate:
 *                       type: number
 *                     totalAmount:
 *                       type: number
 *                     discountApplied:
 *                       type: number
 *                     securityDeposit:
 *                       type: number
 *                     tax:
 *                       type: number
 *                     duration:
 *                       type: number
 *                 startDate:
 *                   type: string
 *                 endDate:
 *                   type: string
 *                 status:
 *                   type: string
 *                 paymentStatus:
 *                   type: string
 *                 daysRemaining:
 *                   type: number
 *                 ownerInfo:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *       404:
 *         description: Booking not found
 */
router.get("/:id", getBookingById);

/**
 * @swagger
 * /bookings/{id}/approve:
 *   patch:
 *     summary: Accept a booking (owner only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking accepted successfully
 *       404:
 *         description: Booking not found
 */
router.patch("/:id/approve", restrictTo("owner"), acceptBooking);

/**
 * @swagger
 * /bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancelMessage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       400:
 *         description: Cannot cancel booking
 *       404:
 *         description: Booking not found
 */
router.patch("/:id/cancel", restrictTo("renter", "owner"), cancelBooking);

/**
 * @swagger
 * /bookings/{id}/reject:
 *   patch:
 *     summary: Reject a booking (owner only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rejectMessage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking rejected successfully
 *       400:
 *         description: Booking already processed
 *       404:
 *         description: Booking not found
 */
router.patch("/:id/reject", restrictTo("owner"), rejectBooking);

/**
 * @swagger
 * /bookings/{id}/complete:
 *   patch:
 *     summary: Mark a booking as completed (owner only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking marked as completed successfully
 *       404:
 *         description: Booking not found
 */
router.patch("/:id/complete", restrictTo("owner"), completeBooking);

router.patch("/:id/photos", uploadMultipleImages("photos", 5), uploadBookingPhotos);
router.get("/:id/qr-code", qrGenerationLimiter, getBookingQR);
router.post("/:id/confirm-scan", confirmBookingScan);

export default router;
