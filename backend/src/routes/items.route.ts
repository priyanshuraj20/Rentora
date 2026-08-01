import { Router } from "express";
import {
  getItemsByUser,
  pauseItem,
  deleteItem,
  updateItem,
  addItem,
  activateItem,
} from "../controllers/items.controller";
import { VerifyUser } from "../middlewares/verifyUser";
import { uploadMultipleImages } from "../middlewares/upload.middleware";
const router = Router();

/**
 * @swagger
 * /items:
 *   get:
 *     summary: Get all the items listed by an user
 *     tags: [Items]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Items fetched successfully
 *         content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          success:
 *                              type: boolean
 *                          message:
 *                              type: string
 *                          data:
 *                              type: object
 *                              properties:
 *                                  items:
 *                                      type: array
 *                                      items:
 *                                          type: object
 *                                          properties:
 *                                              id:
 *                                                  type: string
 *                                              title:
 *                                                  type: string
 *                                              image:
 *                                                  type: string
 *                                              price:
 *                                                  type: number
 *                                              category:
 *                                                  type: string
 *                                              discount:
 *                                                  type: number
 *                                              rating:
 *                                                  type: number
 *                                  meta:
 *                                      type: object
 *                                      properties:
 *                                          total:
 *                                              type: number
 *                                          page:
 *                                              type: number
 *                                          limit:
 *                                              type: number
 *                                          totalPages:
 *                                              type: number
 */
router.get("/", VerifyUser, getItemsByUser);

/**
 * @swagger
 * /items:
 *   post:
 *      summary: Add a new item
 *      tags: [Items]
 *      security:
 *        - cookieAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                title:
 *                  type: string
 *                description:
 *                  type: string
 *                price:
 *                  type: number
 *                category:
 *                  type: string
 *                images:
 *                  type: array
 *                  items:
 *                    type: string
 *                address:
 *                  type: object
 *                  properties:
 *                    district:
 *                      type: string
 *                    state:
 *                      type: string
 *                    pincode:
 *                      type: string
 *      responses:
 *        201:
 *          description: Item added successfully
 */
router.post("/", VerifyUser, uploadMultipleImages("images", 5), addItem);

/**
 * @swagger
 * /items/{id}:
 *   patch:
 *     summary: Update an item
 *     tags: [Items]
 *     security:
 *       - cookieAuth: []
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       404:
 *         description: Item not found
 *       422:
 *         description: Invalid data
 */
router.patch("/:id", VerifyUser, uploadMultipleImages("images", 5), updateItem);

/**
 * @swagger
 * /items/{id}/pause:
 *   patch:
 *     summary: Pause an item
 *     tags: [Items]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item paused successfully
 */
router.patch("/:id/pause", VerifyUser, pauseItem);

/**
 * @swagger
 * /items/{id}/delete:
 *   delete:
 *     summary: Delete an item
 *     tags: [Items]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item deleted successfully
 */
router.delete("/:id/delete", VerifyUser, deleteItem);

/**
 * @swagger
 * /items/{id}/activate:
 *   patch:
 *     summary: Activate an item
 *     tags: [Items]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item activated successfully
 */
router.patch("/:id/activate", VerifyUser, activateItem);

export default router;
