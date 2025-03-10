import { evaluate } from 'mathjs';

const evaluateFormula = (formula) => {
  const values = { Revenue: 1000, Expenses: 200 }; // Dummy data
  const expression = formula.map((t) => values[t.name] || t.name).join(' ');
  return evaluate(expression);
};

export default evaluateFormula;
