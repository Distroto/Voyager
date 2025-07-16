require('dotenv').config(); 
const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    require('mongoose').connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});