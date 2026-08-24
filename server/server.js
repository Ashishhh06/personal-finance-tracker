require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const goalRoutes = require('./routes/goalRoutes');
const investmentRoutes = require('./routes/investmentRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const bankAccountRoutes = require('./routes/bankAccountRoutes');
const loanRoutes = require('./routes/loanRoutes');
const netWorthRoutes = require('./routes/netWorthRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const insightRoutes = require('./routes/insightRoutes');

connectDB();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bank-accounts', bankAccountRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/networth', netWorthRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/insights', insightRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));