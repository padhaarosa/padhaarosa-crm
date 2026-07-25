// Money math shared by Quotes and Invoices.

export type LineItem = {
  quantity: number;
  unitPrice: number;
};

export function lineAmount(item: LineItem) {
  return (item.quantity || 0) * (item.unitPrice || 0);
}

export function computeTotals(
  items: LineItem[],
  taxRate = 0,
  discount = 0
) {
  const subtotal = items.reduce((sum, it) => sum + lineAmount(it), 0);
  const afterDiscount = Math.max(0, subtotal - (discount || 0));
  const tax = (afterDiscount * (taxRate || 0)) / 100;
  const total = afterDiscount + tax;
  return {
    subtotal,
    discount: discount || 0,
    tax,
    total,
  };
}

export function paymentTotal(payments: { amount: number }[]) {
  return payments.reduce((s, p) => s + (p.amount || 0), 0);
}

export function invoiceBalance(
  items: LineItem[],
  taxRate: number,
  discount: number,
  payments: { amount: number }[]
) {
  const { total } = computeTotals(items, taxRate, discount);
  const paid = paymentTotal(payments);
  return { total, paid, balance: Math.max(0, total - paid) };
}
