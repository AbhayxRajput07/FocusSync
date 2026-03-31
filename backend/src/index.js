require('dotenv').config({ path: '../.env' });
const connectDB = require('./config/db');
const app = require('./server');

const PORT = process.env.PORT || 3001;

connectDB().then(() => {
  app.listen(PORT, () => console.log('Server running on port ' + PORT));
}).catch(err => {
  console.error("Failed to connect to DB", err);
  process.exit(1);
});
