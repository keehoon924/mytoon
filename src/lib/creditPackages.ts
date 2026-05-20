export type CreditPackage = {
  id: string;
  label: string;
  credits: number;
  amountKrw: number;
};

export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: "p100", label: "100 크레딧", credits: 100, amountKrw: 1000 },
  { id: "p500", label: "500 크레딧", credits: 500, amountKrw: 4500 },
  { id: "p1000", label: "1,000 크레딧", credits: 1000, amountKrw: 8000 },
];

export function findPackage(id: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find((p) => p.id === id);
}
