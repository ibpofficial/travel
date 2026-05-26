import { useState, useEffect, FormEvent } from "react";
import { Expense, CostBreakdown } from "../types";
import { DollarSign, Plus, Trash2, Tag, User, Users, Calculator, PieChart, PieChartIcon } from "lucide-react";

interface ExpenseTrackerProps {
  initialBreakdown: CostBreakdown;
  travelersCount: number;
}

export default function ExpenseTracker({ initialBreakdown, travelersCount }: ExpenseTrackerProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<Expense["category"]>("misc");
  const [paidBy, setPaidBy] = useState("You");
  
  // Create an array of members based on travelersCount
  const [members, setMembers] = useState<string[]>([]);

  useEffect(() => {
    const list = ["You"];
    for (let i = 2; i <= travelersCount; i++) {
      list.push(`Traveler ${i}`);
    }
    setMembers(list);
  }, [travelersCount]);

  const [splitWith, setSplitWith] = useState<string[]>([]);
  useEffect(() => {
    // By default, split between everyone
    setSplitWith(members);
  }, [members]);

  // Seed with initial estimations so the tracker is not empty
  useEffect(() => {
    const seeds: Expense[] = [
      { id: "s1", title: "Target Est. Transport", amount: initialBreakdown.transport, category: "transport", paidBy: "You", splitBetween: members },
      { id: "s2", title: "Target Est. Lodging", amount: initialBreakdown.accommodation, category: "accommodation", paidBy: "You", splitBetween: members },
      { id: "s3", title: "Activity Reservations", amount: initialBreakdown.activities, category: "activity", paidBy: "You", splitBetween: members }
    ];
    setExpenses(seeds);
  }, [initialBreakdown, members]);

  function handleAddExpense(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;
    
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      title,
      amount,
      category,
      paidBy,
      splitBetween: splitWith.length > 0 ? splitWith : members
    };

    setExpenses([newExpense, ...expenses]);
    setTitle("");
    setAmount(0);
  }

  function handleDeleteExpense(id: string) {
    setExpenses(expenses.filter(e => e.id !== id));
  }

  // Cost splits calculators - Who owes whom
  // Using standard simplification algorithms
  interface Debt {
    from: string;
    to: string;
    amount: number;
  }

  function calculateSettlements(): Debt[] {
    if (members.length <= 1) return [];

    // Balance Sheet: Key is member, value occupies positive if paid more than shared share, negative if paid less
    const balances: { [key: string]: number } = {};
    members.forEach(m => { balances[m] = 0; });

    expenses.forEach(exp => {
      const payer = exp.paidBy;
      const splitters = exp.splitBetween;
      if (splitters.length === 0) return;

      const share = exp.amount / splitters.length;
      splitters.forEach(s => {
        if (balances[s] !== undefined) {
          balances[s] -= share;
        }
      });
      if (balances[payer] !== undefined) {
        balances[payer] += exp.amount;
      }
    });

    // Solve debt matching balances
    const debtors: { member: string; balance: number }[] = [];
    const creditors: { member: string; balance: number }[] = [];

    Object.keys(balances).forEach(member => {
      const bal = balances[member];
      if (bal < -0.01) {
        debtors.push({ member, balance: Math.abs(bal) });
      } else if (bal > 0.01) {
        creditors.push({ member, balance: bal });
      }
    });

    // Greedy solver
    const debts: Debt[] = [];
    let dIdx = 0;
    let cIdx = 0;

    while (dIdx < debtors.length && cIdx < creditors.length) {
      const debtor = debtors[dIdx];
      const creditor = creditors[cIdx];

      const minVal = Math.min(debtor.balance, creditor.balance);
      debts.push({
        from: debtor.member,
        to: creditor.member,
        amount: Math.round(minVal * 100) / 100
      });

      debtor.balance -= minVal;
      creditor.balance -= minVal;

      if (debtor.balance < 0.01) dIdx++;
      if (creditor.balance < 0.01) cIdx++;
    }

    return debts;
  }

  const settlements = calculateSettlements();
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Category summary sums
  const categoryBudgets: { [key: string]: number } = {
    transport: 0,
    accommodation: 0,
    food: 0,
    activity: 0,
    misc: 0
  };
  expenses.forEach(e => {
    if (categoryBudgets[e.category] !== undefined) {
      categoryBudgets[e.category] += e.amount;
    } else {
      categoryBudgets.misc += e.amount;
    }
  });

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-8">
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-50">
        <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 font-display">Expense Account & cost splitter</h3>
          <p className="text-[10px] text-gray-500 font-mono">Calibrated to {travelersCount} active traveler(s).</p>
        </div>
      </div>

      {/* Grid: Form + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column - lg:col-span-4 */}
        <div className="lg:col-span-5 bg-slate-50 border border-gray-100 rounded-2xl p-5 space-y-4">
          <span className="text-[10px] font-mono font-bold text-brand-600 uppercase tracking-widest block">Add New Spent Log</span>

          <form onSubmit={handleAddExpense} className="space-y-4 font-sans">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-gray-400 block uppercase">Expense Title</label>
              <input
                type="text"
                placeholder="e.g. Flight ticket/Street food snack"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-gray-400 block uppercase">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 450"
                  value={amount === 0 ? "" : amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-semibold focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-gray-400 block uppercase">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs focus:outline-none"
                >
                  <option value="transport">Transport</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="food">Restaurant/Food</option>
                  <option value="activity">Activities</option>
                  <option value="misc">Miscellaneous</option>
                </select>
              </div>
            </div>

            {members.length > 1 && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-gray-400 block uppercase">Paid By</label>
                  <select
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs focus:outline-none"
                  >
                    {members.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-gray-400 block uppercase">Split Between</label>
                  <div className="border border-gray-200 rounded-lg p-1.5 bg-white max-h-16 overflow-y-auto space-y-1">
                    {members.map(m => {
                      const checked = splitWith.includes(m);
                      return (
                        <label key={m} className="flex items-center space-x-1.5 text-[10px] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setSplitWith(prev => 
                                checked ? prev.filter(item => item !== m) : [...prev, m]
                              );
                            }}
                          />
                          <span>{m}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2 rounded-lg text-xs flex items-center justify-center space-x-1 cursor-pointer transition"
            >
              <Plus className="h-4 w-4" />
              <span>Log Spent Item</span>
            </button>
          </form>
        </div>

        {/* List & Ledger Column - lg:col-span-4 */}
        <div className="lg:col-span-4 space-y-4">
          <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">Logged Ledger ({expenses.length})</span>

          <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
            {expenses.length === 0 ? (
              <p className="text-[11px] text-gray-400 text-center py-6 italic">No logged expenses.</p>
            ) : (
              expenses.map((exp) => (
                <div key={exp.id} className="bg-slate-50 border border-gray-100 rounded-xl p-3 flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-gray-800">{exp.title}</p>
                    <div className="flex items-center space-x-2 text-[10px] text-gray-500">
                      <span className="bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded capitalize">{exp.category}</span>
                      <span>• Paid by {exp.paidBy}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-right">
                    <span className="font-bold text-gray-900 font-mono">₹{exp.amount.toLocaleString('en-IN')}</span>
                    <button 
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="text-gray-400 hover:text-rose-500 shrink-0 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ledger debt matching Column - lg:col-span-3 */}
        <div className="lg:col-span-3 bg-brand-50/40 border border-brand-100 rounded-2xl p-5 space-y-5">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-brand-700 uppercase tracking-widest block">Total Running Cost</span>
            <p className="text-3xl font-extrabold font-display text-gray-900 font-mono text-emerald-700">₹{totalSpent.toLocaleString('en-IN')}</p>
          </div>

          <div className="space-y-3.5 pt-2 border-t border-brand-100/40">
            <span className="text-[10px] font-mono font-bold text-brand-700 uppercase tracking-widest block flex items-center space-x-1">
              <Calculator className="h-3.5 w-3.5 text-brand-600" />
              <span>Cost Settlings Checklist</span>
            </span>

            {members.length <= 1 ? (
              <p className="text-[10px] text-brand-700 italic">Personal trip. Single-traveler account. Settle balances checklist matches core wallet outflow.</p>
            ) : settlements.length === 0 ? (
              <p className="text-[10px] text-emerald-700 italic flex items-center">
                <span>● Every account is completely settled. Nice!</span>
              </p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {settlements.map((s, i) => (
                  <div key={i} className="bg-white border border-brand-100 rounded-lg p-2 text-[11px] text-gray-700 space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-gray-900">{s.from} owes</span>
                      <span className="text-brand-600 font-mono">₹{s.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-[10px] text-gray-400">transfer to <strong className="text-gray-600 font-medium">{s.to}</strong></p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
