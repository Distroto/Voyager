/**
 * @swagger
 * tags:
 *   name: Voyage Planning
 *   description: Core endpoints for planning and tracking voyages.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     VoyagePlanResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         ship:
 *           type: string
 *           description: ObjectId of the associated ship.
 *         origin:
 *           type: string
 *         destination:
 *           type: string
 *         departureTime:
 *           type: string
 *           format: date-time
 *         cargoWeight:
 *           type: number
 *         status:
 *           type: string
 *           enum: [COMPLETED, FAILED, PLANNING]
 *         predictedETA:
 *           type: string
 *           format: date-time
 *         predictedFuel:
 *           type: number
 *         planDetails:
 *           type: object
 *           properties:
 *             distance_km:
 *               type: number
 *             avg_speed_knots:
 *               type: number
 *             speedSchedule:
 *               type: string
 *             routeSummary:
 *               type: string
 *         actualETA:
 *           type: string
 *           format: date-time
 *         actualFuel:
 *           type: number
 *         deviations:
 *           type: string
 *
 *     FeedbackInput:
 *       type: object
 *       required:
 *         - voyageId
 *       properties:
 *         voyageId:
 *           type: string
 *           description: The MongoDB ObjectId of the voyage to update.
 *         actualETA:
 *           type: string
 *           format: date-time
 *         actualFuel:
 *           type: number
 *         deviations:
 *           type: string
 */

/**
 * @swagger
 * /plan-voyage:
 *   post:
 *     summary: Plan a New Voyage (Synchronous)
 *     tags: [Voyage Planning]
 *     description: Submits voyage details to the AI engine. The API will wait for the AI to complete its analysis and will return the full, optimized voyage plan in the response.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ship, origin, destination, departureTime]
 *             properties:
 *               ship:
 *                 type: string
 *                 description: The MongoDB ObjectId of the registered ship.
 *                 example: "665f1b2c8e4e2a001e5e7a1a"
 *               origin:
 *                 type: string
 *                 example: "Port of Singapore"
 *               destination:
 *                 type: string
 *                 example: "Port of Rotterdam"
 *               departureTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-08-15T09:00:00Z"
 *               cargoWeight:
 *                 type: number
 *                 example: 115000
 *               weatherForecast:
 *                 type: object
 *                 properties:
 *                   summary:
 *                     type: string
 *                     example: "Possible monsoon activity in the Indian Ocean."
 *     responses:
 *       '201':
 *         description: The AI-optimized voyage plan was successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VoyagePlanResponse'
 *       '500':
 *         description: The server failed to generate the voyage plan. This could be due to an AI service failure or other internal error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /plan-history:
 *   get:
 *     summary: Get Voyage History
 *     tags: [Voyage Planning]
 *     description: Retrieves a list of all past voyages, including both the predicted plan and the actual results from feedback.
 *     responses:
 *       '200':
 *         description: A list of all voyages.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VoyagePlanResponse'
 *
 * /feedback:
 *   post:
 *     summary: Submit Voyage Feedback
 *     tags: [Voyage Planning]
 *     description: Submits the actual results of a completed voyage. This data is crucial for the continuous learning loop and improving future AI predictions.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeedbackInput'
 *     responses:
 *       '200':
 *         description: Feedback was successfully submitted.
 */