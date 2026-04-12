require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.get('/', (req, res) => res.json({ message: 'SinCity Stride API running' }));

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth',    require('./routes/authRoutes'));
app.use('/api/users',   require('./routes/userRoutes'));
app.use('/api/quests',  require('./routes/questRoutes'));
app.use('/api/runs',    require('./routes/runRoutes'));
app.use('/api/friends', require('./routes/friendRoutes'));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
