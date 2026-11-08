/**
 * Bwana Search Synonyms & Colloquial Zambian Terms Dictionary
 * Bridges user search intent with local market naming conventions.
 */

export const ZAMBIA_SEARCH_SYNONYMS: Record<string, string[]> = {
  // Malls & Shopping Centres
  malls: ['mall', 'mukuba', 'ecl', 'shopping centre', 'supermarket', 'retail', 'plaza'],
  mall: ['malls', 'mukuba', 'ecl', 'shopping centre', 'supermarket', 'retail', 'plaza'],
  shopping: ['mall', 'malls', 'supermarket', 'market', 'store', 'shop'],
  supermarket: ['grocery', 'shop', 'kantemba', 'retail', 'trade kings'],

  // Healthcare, Hospitals, Private Clinics, Pharmacy & Chemist
  hospital: ['hospitals', 'private hospital', 'clinic', 'emergency', 'doctor', 'trauma', 'teaching hospital', 'medland', 'fairview', 'coptic', 'kth', 'health', 'ward'],
  hospitals: ['hospital', 'private hospital', 'clinic', 'emergency', 'doctor', 'trauma', 'medland', 'fairview', 'coptic', 'kth'],
  clinic: ['private clinic', 'hospital', 'doctor', 'healthcare', 'medical', 'nurse', 'outpatient', 'dispensary', 'consultation'],
  clinics: ['clinic', 'private clinic', 'hospital', 'doctor', 'healthcare', 'medical'],
  'private clinic': ['clinic', 'hospital', 'doctor', 'specialist', 'family medicine', 'medical centre', 'outpatient'],
  emergency: ['hospital', 'trauma', 'ambulance', '24/7', 'casualty', 'icu', 'clinic'],
  doctor: ['clinic', 'hospital', 'physician', 'specialist', 'consultation', 'general practitioner', 'gp'],
  pharmacy: ['chemist', 'clinic', 'medicine', 'drugstore', 'dispensary', 'health', 'hospital'],
  faramacy: ['pharmacy', 'chemist', 'clinic', 'medicine', 'drugstore'],
  farmacy: ['pharmacy', 'chemist', 'clinic', 'medicine'],
  chemist: ['pharmacy', 'medicine', 'clinic', 'first aid', 'dispensary'],
  medicine: ['pharmacy', 'chemist', 'panado', 'health', 'clinic'],

  // Kantemba & Compound Grocery
  tomatoes: ['kantemba', 'fresh produce', 'vegetables', 'chisokone', 'market', 'groceries'],
  tomato: ['tomatoes', 'kantemba', 'vegetables', 'chisokone', 'market'],
  onion: ['tomatoes', 'kantemba', 'market', 'chisokone'],
  vegetables: ['produce', 'market', 'kantemba', 'farm fresh', 'chisokone'],
  kantemba: ['tuckshop', 'corner shop', 'kiosk', 'groceries', 'spaza', 'convenience'],
  tuckshop: ['kantemba', 'shop', 'groceries'],
  eggs: ['kantemba', 'farm fresh', 'groceries', 'market'],
  bread: ['supaloaf', 'bakery', 'kantemba', 'groceries'],

  // Hardware & Construction
  hardware: ['abc hardware', 'cement', 'timber', 'building materials', 'construction', 'tools', 'plumbing', 'steel'],
  cement: ['hardware', 'chilanga', 'mpande', 'dangote', 'building'],
  timber: ['hardware', 'roofing', 'wood', 'construction'],
  tools: ['hardware', 'drill', 'spanner', 'equipment'],

  // Lodging & Hospitality
  lodge: ['hotel', 'guest house', 'accommodation', 'mukwa gardens', 'rooms', 'stay'],
  hotel: ['lodge', 'guest house', 'resort', 'accommodation'],
  rooms: ['lodge', 'hotel', 'guest house', 'accommodation'],
  restaurant: ['cafe', 'food', 'grill', 'nshima', 'takeaway', 'chickmar'],
  food: ['restaurant', 'cafe', 'kantemba', 'takeaway', 'nshima'],

  // Technical Trades & Professionals
  electrician: ['electrical', 'solar', 'power', 'inverter', 'zesco', 'wiring', 'eiz'],
  solar: ['inverter', 'battery', 'electrician', 'renewable', 'zesco backup'],
  plumber: ['plumbing', 'pipe', 'water', 'borehole', 'drainage', 'leaks'],
  mechanic: ['garage', 'automotive', 'car repair', 'heavy plant', 'engine', 'spares'],
  accountant: ['tax', 'zra', 'zica', 'audit', 'payroll', 'bookkeeping'],
  lawyer: ['legal', 'advocate', 'pacra', 'contracts', 'compliance'],

  // Logistics & Delivery
  courier: ['bwana express', 'delivery', 'rider', 'motorcycle', 'dispatch', 'errands'],
  delivery: ['express', 'courier', 'rider', 'logistics', 'doorstep'],
  express: ['delivery', 'courier', 'bwana express', 'dispatch'],
};

/**
 * Expands search terms with synonyms and local Zambian slang/typo mappings.
 */
export function expandSearchQuery(query: string): string[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const tokens = trimmed.split(/\s+/);
  const expandedTokens = new Set<string>([trimmed]);

  tokens.forEach((token) => {
    expandedTokens.add(token);
    const directSynonyms = ZAMBIA_SEARCH_SYNONYMS[token];
    if (directSynonyms) {
      directSynonyms.forEach((syn) => expandedTokens.add(syn.toLowerCase()));
    }
  });

  return Array.from(expandedTokens);
}
