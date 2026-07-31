import { Router } from "express";
import {
  exploreItems,
  exploreItem,
  searchItems,
} from "../controllers/explore.controller";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "65fd2a9b9a1e3c2b7d4f1234"
 *         title:
 *           type: string
 *           example: "Canon Camera"
 *         image:
 *           type: string
 *           nullable: true
 *           example: "https://cdn.example.com/image.jpg"
 *         dailyPrice:
 *           type: number
 *           example: 499
 *         category:
 *           type: string
 *           example: "Electronics"
 *         discount:
 *           type: number
 *           nullable: true
 *           example: 10
 *         rating:
 *           type: number
 *           example: 4.5
 *     Owner:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         image:
 *           type: string
 *           nullable: true
 *     ItemDetail:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         location:
 *           type: object
 *         category:
 *           type: string
 *         rating:
 *           type: number
 *         price:
 *           type: number
 *         unavailableDates:
 *           type: array
 *           items:
 *             type: string
 *             format: date
 *         owner:
 *           $ref: '#/components/schemas/Owner'
 */

/**
 * @swagger
 * /explore:
 *   get:
 *     summary: Get all items (cursor pagination)
 *     tags: [Explore]
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Last item _id from the previous page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *     responses:
 *       200:
 *         description: Items fetched successfully
 */
router.get("/", exploreItems);

/**
 * @swagger
 * /explore/search:
 *   get:
 *     summary: Full-text search items via ElasticSearch
 *     tags: [Explore]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Full-text search query (title, description, category)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by exact category keyword
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum daily price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum daily price filter
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Item'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 hasNextPage:
 *                   type: boolean
 */
//search MUST be declared before /:id — otherwise Express treats "search" as an id
router.get("/search", searchItems);

/**
 * @swagger
 * /explore/{id}:
 *   get:
 *     summary: Get item by id
 *     tags: [Explore]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "65fd2a9b9a1e3c2b7d4f1234"
 *     responses:
 *       200:
 *         description: Item fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ItemDetail'
 */
router.get("/:id", exploreItem);

export default router;
