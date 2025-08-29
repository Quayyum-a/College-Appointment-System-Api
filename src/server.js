const express = require('express');
const dotenv = require('dotenv');
const { sequelize, initModels } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();
app.use(express.json());


app.use('/auth', authRoutes);
app.use('/availability', availabilityRoutes);
app.use('/appointments', appointmentRoutes);

app.get('/health', (_, res) => {
  res.json({ ok: true });
});

app.use(errorHandler);

async function start() {
  await initModels();
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  start().catch((err) => {
    console.error('Failed to start server', err);
  });
}

module.exports = app;
