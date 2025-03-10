import create from 'zustand';

const useFormulaStore = create((set) => ({
  formula: [],
  addToken: (token) => set((state) => ({ formula: [...state.formula, token] })),
  removeLastToken: () => set((state) => ({ formula: state.formula.slice(0, -1) })),
  removeTokenByIndex: (index) => set((state) => ({ formula: state.formula.filter((_, i) => i !== index) })),
}));

export default useFormulaStore;
