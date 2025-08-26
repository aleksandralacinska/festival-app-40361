require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 4000;

const locationsRoutes = require('./routes/locations');
app.use('/api/locations', locationsRoutes);

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
