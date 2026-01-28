const bcrypt = require('bcryptjs');

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Calculate deadline (+7 days from loan date)
const calculateDeadline = (loanDate) => {
  const deadline = new Date(loanDate);
  deadline.setDate(deadline.getDate() + 7);
  return deadline.toISOString().split('T')[0]; // Format: YYYY-MM-DD
};

// Calculate days late
const calculateDaysLate = (dueDate, returnDate) => {
  const due = new Date(dueDate);
  const returned = new Date(returnDate);
  const diffTime = returned - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

// Calculate fine (Rp1.000 per day)
const calculateFine = (daysLate) => {
  return daysLate * 1000;
};

// Format date to Indonesian format
const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

module.exports = {
  hashPassword,
  comparePassword,
  calculateDeadline,
  calculateDaysLate,
  calculateFine,
  formatDate
};
