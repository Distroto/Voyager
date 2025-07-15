/**
 * @swagger
 * tags:
 *   name: Maintenance
 *   description: Proactive maintenance scheduling based on usage analytics.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     MaintenanceAlert:
 *       type: object
 *       properties:
 *         shipId:
 *           type: string
 *           description: The ObjectId of the analyzed ship.
 *         shipName:
 *           type: string
 *           description: The name of the analyzed ship.
 *         maintenanceRequired:
 *           type: boolean
 *           description: True if the AI model recommends proactive maintenance.
 *         riskProbability:
 *           type: number
 *           format: float
 *           description: The AI's confidence score (0.0 to 1.0) that maintenance is needed.
 *           example: 0.82
 */

/**
 * @swagger
 * /maintenance-alerts:
 *   get:
 *     summary: Get a Proactive Maintenance Alert
 *     tags: [Maintenance]
 *     description: |
 *       This endpoint triggers a proactive analysis for a sample ship from the database.
 *       It gathers usage metrics (simulated running hours, number of voyages), sends them to the AI Maintenance Forecaster model, and returns a real-time prediction on whether maintenance is recommended.
 *     responses:
 *       '200':
 *         description: An AI-generated maintenance alert.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MaintenanceAlert'
 *       '404':
 *         description: No ships were found in the database to analyze.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: The server failed to generate the maintenance alert.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */