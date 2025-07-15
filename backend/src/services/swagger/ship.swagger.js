/**
 * @swagger
 * tags:
 *   name: Ships
 *   description: API for managing the ship fleet. All voyage planning and maintenance alerts are linked to a registered ship.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Ship:
 *       type: object
 *       required:
 *         - name
 *         - imoNumber
 *         - engineType
 *         - capacity
 *         - fuelConsumptionRate
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated MongoDB ObjectId of the ship.
 *           example: "665f1b2c8e4e2a001e5e7a1a"
 *         name:
 *           type: string
 *           description: The unique name of the vessel.
 *           example: "MV Neptune's Pearl"
 *         imoNumber:
 *           type: string
 *           description: The unique International Maritime Organization (IMO) number.
 *           example: "9495021"
 *         engineType:
 *           type: string
 *           description: The model of the ship's main engine.
 *           example: "MAN B&W 6S60ME-C"
 *         capacity:
 *           type: number
 *           description: The maximum cargo capacity in tons (DWT).
 *           example: 120000
 *         fuelConsumptionRate:
 *           type: number
 *           description: A baseline fuel consumption rate in tons per day at optimal speed. This is a crucial feature for the AI fuel model.
 *           example: 30
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the ship was registered.
 */

/**
 * @swagger
 * /ships:
 *   post:
 *     summary: Register a new ship in the fleet
 *     tags: [Ships]
 *     description: Creates a new ship record in the database with its specifications. A ship must be registered before it can be used for voyage planning. The `imoNumber` and `name` must be unique.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewShipInput'
 *     responses:
 *       '201':
 *         description: Ship successfully registered. Returns the newly created ship object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ship'
 *       '400':
 *         description: Invalid input, or a ship with the same name or IMO number already exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   get:
 *     summary: Retrieve a list of all registered ships
 *     tags: [Ships]
 *     description: Fetches all ship records from the database, providing a complete overview of the managed fleet.
 *     responses:
 *       '200':
 *         description: An array of all ships in the fleet. The list may be empty if no ships have been registered.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ship'
 */