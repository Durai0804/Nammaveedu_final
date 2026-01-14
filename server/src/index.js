const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');
const { errorHandler } = require('./middleware/error');

const PORT = process.env.PORT || 4000;

const app = express();
app.use(helmet());
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(express.json());

// Root - basic API info
app.get('/', (req, res) => {
  res.json({
    name: 'NammaVeedu API',
    ok: true,
    endpoints: {
      health: '/health',
      login: '/api/auth/login',
      me: '/api/auth/me',
      residentDashboard: '/api/resident/dashboard',
      notices: '/api/notices',
      complaints: '/api/complaints',
      maintenanceHistory: '/api/maintenance/history'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.use('/api', routes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`NammaVeedu API running on http://localhost:${PORT}`);
});
