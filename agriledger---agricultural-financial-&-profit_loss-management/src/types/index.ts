export type ThemeId = 'emerald' | 'slate' | 'harvest' | 'charcoal' | 'custom';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  isDark?: boolean;
}

export type IrrigationType = 
  | 'Center Pivot Sprinkler' 
  | 'Drip / Micro-Irrigation' 
  | 'Dryland Rainfed' 
  | 'Flood / Furrow' 
  | 'Sub-Surface Irrigation';

export interface LandPlot {
  id: string;
  name: string;
  code: string;
  crop: string;
  totalAcreage: number;
  locationTag: string;
  soilType: string;
  irrigationType: IrrigationType;
  operationalYear: number;
  assignedPartnerIds?: string[];
  targetYieldPerAcre: number;
  yieldUnit: string;
  notes?: string;
  color?: string;
}

export type RevenueCategory =
  | 'Yield Sales (Cash Grain)'
  | 'Forward & Futures Contracts'
  | 'Crop Insurance Settlements'
  | 'Byproduct & Stover Sales'
  | 'Government / USDA Grants'
  | 'Custom Harvesting & Rental';

export type ExpenseCategory =
  | 'Certified Seeds & Treatment'
  | 'Fertilizer & Soil Amendments'
  | 'Chemicals & Crop Protection'
  | 'Diesel Fuel & Machinery Lubricants'
  | 'Equipment Lease & Depreciation'
  | 'Field Operators & Seasonal Labor'
  | 'Irrigation Electricity & Water Rights'
  | 'Crop Drying & Grain Storage'
  | 'Agronomy Advisory & Insurance';

export interface FinancialItem {
  id: string;
  type: 'revenue' | 'expense';
  landId: string; // 'all' or specific LandPlot.id
  year: number;
  category: RevenueCategory | ExpenseCategory | string;
  description: string;
  amount: number;
  date: string;
  unitPrice?: number;
  quantity?: number;
  unit?: string;
  notes?: string;
}

export interface Partner {
  id: string;
  name: string;
  role: string;
  email: string;
  sharePercent: number; // e.g. 50
  initialCapitalInvested: number;
  assignedLandIds: string[]; // empty means all lands
  payoutPreference: 'Direct Deposit' | 'Escrow Reinvestment' | 'Quarterly Wire';
  notes?: string;
}

export interface FarmSettings {
  farmName: string;
  legalEntity: string;
  currency: string;
  activeYear: number;
  reserveFundPercent: number; // e.g. 10% retained
  theme: ThemeConfig;
  tabsOrder: { id: string; name: string; enabled: boolean }[];
}

export interface PLSummary {
  grossRevenue: number;
  totalExpenses: number;
  netProfit: number;
  isProfit: boolean;
  profitMarginPercent: number;
  roiPercent: number;
  totalAcreage: number;
  revenuePerAcre: number;
  expensePerAcre: number;
  netProfitPerAcre: number;
  revenueByCategory: Record<string, number>;
  expenseByCategory: Record<string, number>;
  retainedReserve: number;
  distributableProfit: number;
}

export interface PartnerDistribution {
  partner: Partner;
  assignedAcreage: number;
  allocatedGrossProfit: number;
  retainedReserveContribution: number;
  netPayout: number;
  effectiveSharePercent: number;
}

export interface QuarterlyForecast {
  quarter: string;
  projectedRevenue: number;
  projectedExpenses: number;
  projectedNetProfit: number;
  marginPercent: number;
  keyFactors: string[];
}

export interface CropOutlook {
  crop: string;
  estimatedYieldChangePercent: number;
  revenuePerAcreProjection: number;
  riskLevel: 'low' | 'medium' | 'high';
  opportunity: string;
}

export interface ForecastResponse {
  isAiGenerated: boolean;
  strategicSummary: string;
  annualRevenueForecast: number;
  annualExpensesForecast: number;
  projectedNetProfit: number;
  quarterlyProjections: QuarterlyForecast[];
  cropPerformanceOutlook: CropOutlook[];
  riskMitigationAdvice: string[];
}
