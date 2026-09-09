export interface CardRecord {
  id: string;
  datePurchased: string | null;
  quantity: number;
  title: string; // full "Card" field, e.g. the long descriptive name
  subject: string; // e.g. "Electivire Fb Lv.x-Holo"
  year: string;
  set: string;
  variation: string;
  number: string;
  category: string; // Pokemon, One Piece, Riftbound, Lorcana, ...
  gradingCompany: string; // PSA, Beckett, SGC, CGC, ...
  grade: string; // 7, 9, 10, 9.5, ...
  conditionRaw: string; // original "Condition" field, e.g. "PSA 7"
  investment: number | null;
  currentValue: number | null;
  potentialProfit: number | null;
  gradedCertNumber: string;
  population: number | null;
  notes: string;
  imageUrl: string | null; // reserved for phase 2 (manual image upload)
}

export interface SiteSettings {
  showFinancials: boolean;
  siteName: string;
}

export interface CardsData {
  cards: CardRecord[];
  updatedAt: string;
  settings: SiteSettings;
}
