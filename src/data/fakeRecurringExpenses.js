const recurringExpenses = [
  { id: 1, nome: "Affitto", descrizione: "Canone mensile", importo: 1180 },
  { id: 2, nome: "Utenze", descrizione: "Luce, gas e acqua", importo: 285 },
  { id: 3, nome: "Abbonamenti", descrizione: "Servizi digitali", importo: 95 },
];

export function getFakeRecurringExpenses() {
  return recurringExpenses.map((expense) => ({ ...expense }));
}

export function addFakeRecurringExpense(expense) {
  const nextId = Math.max(0, ...recurringExpenses.map((item) => item.id)) + 1;
  const createdExpense = {
    id: nextId,
    nome: expense.nome,
    descrizione: expense.descrizione || "",
    importo: Number(expense.prezzo || 0),
  };
  recurringExpenses.push(createdExpense);
  return { ...createdExpense };
}
