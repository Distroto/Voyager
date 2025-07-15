const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const voyageRoutes = require('./routes/voyageRouter');
const maintenanceRoutes = require('./routes/maintenanceRouter');
const shipRoutes = require('./routes/shipRouter');
const setupSwaggerDocs = require('./services/swagger/swagger');

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', voyageRoutes);
app.use('/', maintenanceRoutes);
app.use('/', shipRoutes);

setupSwaggerDocs(app);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
