const MULTIPLIER = 15;

export interface Founder {
  name: string;
  company: string;
  mrr: number;
  arr: number;
  valuation: number;
}

function makeFounder(name: string, company: string, mrr: number): Founder {
  const arr = mrr * 12;
  return { name, company, mrr, arr, valuation: arr * MULTIPLIER };
}

export const founders: Founder[] = [
  makeFounder("Sarah Chen", "NovaPay", 420_000),
  makeFounder("Marcus Wright", "FleetOps", 310_000),
  makeFounder("Aisha Patel", "DataMesh", 275_000),
  makeFounder("Erik Johansson", "CloudForge", 195_000),
  makeFounder("Lucia Moreno", "Stackly", 160_000),
  makeFounder("James Okafor", "BoltAPI", 130_000),
  makeFounder("Yuki Tanaka", "Synthetica", 95_000),
  makeFounder("Priya Sharma", "LedgerFlow", 78_000),
];
