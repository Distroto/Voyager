const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const voyageRoutes = require('./routes/voyageRouter');
const maintenanceRoutes = require('./routes/maintenanceRouter');

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Voyager API is running!' });
});

app.use('/api/voyage', voyageRoutes);
app.use('/api/maintainance', maintenanceRoutes);

module.exports = app;
