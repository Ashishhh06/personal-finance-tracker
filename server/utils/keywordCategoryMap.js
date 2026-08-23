// Maps common merchant/note keywords to categories - checked BEFORE calling the LLM,
// since this is instant, free, and covers the majority of everyday transactions.
const keywordCategoryMap = {
  swiggy: 'Food & Dining',
  zomato: 'Food & Dining',
  dominos: 'Food & Dining',
  mcdonald: 'Food & Dining',
  starbucks: 'Food & Dining',
  restaurant: 'Food & Dining',
  cafe: 'Food & Dining',
  uber: 'Transport',
  ola: 'Transport',
  rapido: 'Transport',
  petrol: 'Transport',
  fuel: 'Transport',
  metro: 'Transport',
  netflix: 'Subscriptions',
  spotify: 'Subscriptions',
  'amazon prime': 'Subscriptions',
  hotstar: 'Subscriptions',
  'youtube premium': 'Subscriptions',
  amazon: 'Shopping',
  flipkart: 'Shopping',
  myntra: 'Shopping',
  ajio: 'Shopping',
  electricity: 'Utilities',
  'water bill': 'Utilities',
  wifi: 'Utilities',
  broadband: 'Utilities',
  'gas bill': 'Utilities',
  rent: 'Rent',
  emi: 'Loan EMI',
  loan: 'Loan EMI',
  pharmacy: 'Medical',
  hospital: 'Medical',
  doctor: 'Medical',
  medicine: 'Medical',
  movie: 'Entertainment',
  bookmyshow: 'Entertainment',
  pvr: 'Entertainment',
  inox: 'Entertainment',
  flight: 'Travel',
  hotel: 'Travel',
  irctc: 'Travel',
  train: 'Travel',
  school: 'Education',
  college: 'Education',
  tuition: 'Education',
  course: 'Education',
  insurance: 'Insurance Premium',
};

const matchKeyword = (note) => {
  if (!note) return null;
  const lowerNote = note.toLowerCase();
  for (const [keyword, category] of Object.entries(keywordCategoryMap)) {
    if (lowerNote.includes(keyword)) {
      return category;
    }
  }
  return null;
};

module.exports = { matchKeyword };