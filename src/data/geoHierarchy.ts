/**
 * Hierarchical Geographic Data Store
 * Architecture: Country → Province/Region → District → City/Town → Area/Neighborhood → Coordinates
 * 
 * Primary initial market: Zambia (with full multi-town support: Lusaka, Kitwe, Ndola,
 * Livingstone, Kabwe, Chipata, Chingola, Mufulira, Solwezi, Kasama, Mongu, etc.)
 * 
 * Scalable architecture ready for expansion into:
 * Zimbabwe, Botswana, Malawi, Namibia, Mozambique, South Africa, Tanzania, and other African markets.
 */

import {
  Country,
  ProvinceRegion,
  District,
  CityTown,
  AreaNeighborhood,
  LocationArea,
  LocationCoordinates
} from '../types';

export const SUPPORTED_COUNTRIES: Country[] = [
  {
    code: 'ZM',
    name: 'Zambia',
    currency: 'ZMW',
    currencySymbol: 'K',
    phonePrefix: '+260',
    flagEmoji: '🇿🇲',
    isActive: true,
  },
  {
    code: 'ZW',
    name: 'Zimbabwe',
    currency: 'USD',
    currencySymbol: '$',
    phonePrefix: '+263',
    flagEmoji: '🇿🇼',
    isActive: false, // Planned expansion
  },
  {
    code: 'BW',
    name: 'Botswana',
    currency: 'BWP',
    currencySymbol: 'P',
    phonePrefix: '+267',
    flagEmoji: '🇧🇼',
    isActive: false, // Planned expansion
  },
  {
    code: 'MW',
    name: 'Malawi',
    currency: 'MWK',
    currencySymbol: 'MK',
    phonePrefix: '+265',
    flagEmoji: '🇲🇼',
    isActive: false, // Planned expansion
  },
  {
    code: 'NA',
    name: 'Namibia',
    currency: 'NAD',
    currencySymbol: 'N$',
    phonePrefix: '+264',
    flagEmoji: '🇳🇦',
    isActive: false, // Planned expansion
  },
  {
    code: 'MZ',
    name: 'Mozambique',
    currency: 'MZN',
    currencySymbol: 'MT',
    phonePrefix: '+258',
    flagEmoji: '🇲🇿',
    isActive: false, // Planned expansion
  },
  {
    code: 'ZA',
    name: 'South Africa',
    currency: 'ZAR',
    currencySymbol: 'R',
    phonePrefix: '+27',
    flagEmoji: '🇿🇦',
    isActive: false, // Planned expansion
  },
  {
    code: 'TZ',
    name: 'Tanzania',
    currency: 'TZS',
    currencySymbol: 'TSh',
    phonePrefix: '+255',
    flagEmoji: '🇹🇿',
    isActive: false, // Planned expansion
  },
];

export const PROVINCES_REGIONS: ProvinceRegion[] = [
  // Zambia (10 Provinces)
  { id: 'zm-copperbelt', countryCode: 'ZM', name: 'Copperbelt' },
  { id: 'zm-lusaka', countryCode: 'ZM', name: 'Lusaka' },
  { id: 'zm-southern', countryCode: 'ZM', name: 'Southern' },
  { id: 'zm-central', countryCode: 'ZM', name: 'Central' },
  { id: 'zm-eastern', countryCode: 'ZM', name: 'Eastern' },
  { id: 'zm-north-western', countryCode: 'ZM', name: 'North-Western' },
  { id: 'zm-northern', countryCode: 'ZM', name: 'Northern' },
  { id: 'zm-western', countryCode: 'ZM', name: 'Western' },
  { id: 'zm-luapula', countryCode: 'ZM', name: 'Luapula' },
  { id: 'zm-muchinga', countryCode: 'ZM', name: 'Muchinga' },

  // Expansion Market Seeds
  { id: 'zw-harare', countryCode: 'ZW', name: 'Harare Province' },
  { id: 'zw-bulawayo', countryCode: 'ZW', name: 'Bulawayo Province' },
  { id: 'bw-south-east', countryCode: 'BW', name: 'South-East District' },
  { id: 'mw-central', countryCode: 'MW', name: 'Central Region' },
  { id: 'mw-southern', countryCode: 'MW', name: 'Southern Region' },
  { id: 'za-gauteng', countryCode: 'ZA', name: 'Gauteng' },
  { id: 'za-western-cape', countryCode: 'ZA', name: 'Western Cape' },
  { id: 'tz-dar', countryCode: 'TZ', name: 'Dar es Salaam' },
];

export const DISTRICTS: District[] = [
  // Copperbelt, Zambia
  { id: 'dist-zm-kitwe', provinceId: 'zm-copperbelt', countryCode: 'ZM', name: 'Kitwe' },
  { id: 'dist-zm-ndola', provinceId: 'zm-copperbelt', countryCode: 'ZM', name: 'Ndola' },
  { id: 'dist-zm-chingola', provinceId: 'zm-copperbelt', countryCode: 'ZM', name: 'Chingola' },
  { id: 'dist-zm-mufulira', provinceId: 'zm-copperbelt', countryCode: 'ZM', name: 'Mufulira' },
  { id: 'dist-zm-kalulushi', provinceId: 'zm-copperbelt', countryCode: 'ZM', name: 'Kalulushi' },
  { id: 'dist-zm-luanshya', provinceId: 'zm-copperbelt', countryCode: 'ZM', name: 'Luanshya' },
  { id: 'dist-zm-chililabombwe', provinceId: 'zm-copperbelt', countryCode: 'ZM', name: 'Chililabombwe' },

  // Lusaka, Zambia
  { id: 'dist-zm-lusaka', provinceId: 'zm-lusaka', countryCode: 'ZM', name: 'Lusaka' },
  { id: 'dist-zm-chilanga', provinceId: 'zm-lusaka', countryCode: 'ZM', name: 'Chilanga' },
  { id: 'dist-zm-chongwe', provinceId: 'zm-lusaka', countryCode: 'ZM', name: 'Chongwe' },
  { id: 'dist-zm-kafue', provinceId: 'zm-lusaka', countryCode: 'ZM', name: 'Kafue' },

  // Southern, Zambia
  { id: 'dist-zm-livingstone', provinceId: 'zm-southern', countryCode: 'ZM', name: 'Livingstone' },
  { id: 'dist-zm-choma', provinceId: 'zm-southern', countryCode: 'ZM', name: 'Choma' },
  { id: 'dist-zm-mazabuka', provinceId: 'zm-southern', countryCode: 'ZM', name: 'Mazabuka' },
  { id: 'dist-zm-monze', provinceId: 'zm-southern', countryCode: 'ZM', name: 'Monze' },

  // Central, Zambia
  { id: 'dist-zm-kabwe', provinceId: 'zm-central', countryCode: 'ZM', name: 'Kabwe' },
  { id: 'dist-zm-kapiri', provinceId: 'zm-central', countryCode: 'ZM', name: 'Kapiri Mposhi' },

  // Eastern, Zambia
  { id: 'dist-zm-chipata', provinceId: 'zm-eastern', countryCode: 'ZM', name: 'Chipata' },
  { id: 'dist-zm-katete', provinceId: 'zm-eastern', countryCode: 'ZM', name: 'Katete' },
  { id: 'dist-zm-petauke', provinceId: 'zm-eastern', countryCode: 'ZM', name: 'Petauke' },

  // North-Western, Zambia
  { id: 'dist-zm-solwezi', provinceId: 'zm-north-western', countryCode: 'ZM', name: 'Solwezi' },
  { id: 'dist-zm-kalumbila', provinceId: 'zm-north-western', countryCode: 'ZM', name: 'Kalumbila' },

  // Northern, Zambia
  { id: 'dist-zm-kasama', provinceId: 'zm-northern', countryCode: 'ZM', name: 'Kasama' },
  { id: 'dist-zm-mbala', provinceId: 'zm-northern', countryCode: 'ZM', name: 'Mbala' },

  // Western, Zambia
  { id: 'dist-zm-mongu', provinceId: 'zm-western', countryCode: 'ZM', name: 'Mongu' },
  { id: 'dist-zm-senanga', provinceId: 'zm-western', countryCode: 'ZM', name: 'Senanga' },

  // Luapula & Muchinga
  { id: 'dist-zm-mansa', provinceId: 'zm-luapula', countryCode: 'ZM', name: 'Mansa' },
  { id: 'dist-zm-chinsali', provinceId: 'zm-muchinga', countryCode: 'ZM', name: 'Chinsali' },
  { id: 'dist-zm-mpika', provinceId: 'zm-muchinga', countryCode: 'ZM', name: 'Mpika' },

  // Regional Expansion Seeds
  { id: 'dist-zw-harare', provinceId: 'zw-harare', countryCode: 'ZW', name: 'Harare Urban' },
  { id: 'dist-zw-bulawayo', provinceId: 'zw-bulawayo', countryCode: 'ZW', name: 'Bulawayo Urban' },
  { id: 'dist-bw-gaborone', provinceId: 'bw-south-east', countryCode: 'BW', name: 'Gaborone' },
  { id: 'dist-mw-lilongwe', provinceId: 'mw-central', countryCode: 'MW', name: 'Lilongwe' },
  { id: 'dist-mw-blantyre', provinceId: 'mw-southern', countryCode: 'MW', name: 'Blantyre' },
  { id: 'dist-za-jhb', provinceId: 'za-gauteng', countryCode: 'ZA', name: 'City of Johannesburg' },
  { id: 'dist-za-cpt', provinceId: 'za-western-cape', countryCode: 'ZA', name: 'City of Cape Town' },
  { id: 'dist-tz-dar', provinceId: 'tz-dar', countryCode: 'TZ', name: 'Ilala' },
];

export const CITIES_TOWNS: CityTown[] = [
  // Primary Market: Zambia Towns
  {
    id: 'city-zm-kitwe',
    districtId: 'dist-zm-kitwe',
    provinceId: 'zm-copperbelt',
    countryCode: 'ZM',
    name: 'Kitwe',
    isMajorCity: true,
    coordinates: { latitude: -12.8024, longitude: 28.2132 },
  },
  {
    id: 'city-zm-lusaka',
    districtId: 'dist-zm-lusaka',
    provinceId: 'zm-lusaka',
    countryCode: 'ZM',
    name: 'Lusaka',
    isMajorCity: true,
    coordinates: { latitude: -15.3875, longitude: 28.3228 },
  },
  {
    id: 'city-zm-ndola',
    districtId: 'dist-zm-ndola',
    provinceId: 'zm-copperbelt',
    countryCode: 'ZM',
    name: 'Ndola',
    isMajorCity: true,
    coordinates: { latitude: -12.9906, longitude: 28.6366 },
  },
  {
    id: 'city-zm-livingstone',
    districtId: 'dist-zm-livingstone',
    provinceId: 'zm-southern',
    countryCode: 'ZM',
    name: 'Livingstone',
    isMajorCity: true,
    coordinates: { latitude: -17.8419, longitude: 25.8543 },
  },
  {
    id: 'city-zm-kabwe',
    districtId: 'dist-zm-kabwe',
    provinceId: 'zm-central',
    countryCode: 'ZM',
    name: 'Kabwe',
    isMajorCity: true,
    coordinates: { latitude: -14.4469, longitude: 28.4464 },
  },
  {
    id: 'city-zm-chipata',
    districtId: 'dist-zm-chipata',
    provinceId: 'zm-eastern',
    countryCode: 'ZM',
    name: 'Chipata',
    isMajorCity: true,
    coordinates: { latitude: -13.6444, longitude: 32.6447 },
  },
  {
    id: 'city-zm-chingola',
    districtId: 'dist-zm-chingola',
    provinceId: 'zm-copperbelt',
    countryCode: 'ZM',
    name: 'Chingola',
    isMajorCity: true,
    coordinates: { latitude: -12.5358, longitude: 27.8542 },
  },
  {
    id: 'city-zm-mufulira',
    districtId: 'dist-zm-mufulira',
    provinceId: 'zm-copperbelt',
    countryCode: 'ZM',
    name: 'Mufulira',
    isMajorCity: true,
    coordinates: { latitude: -12.5498, longitude: 28.2407 },
  },
  {
    id: 'city-zm-solwezi',
    districtId: 'dist-zm-solwezi',
    provinceId: 'zm-north-western',
    countryCode: 'ZM',
    name: 'Solwezi',
    isMajorCity: true,
    coordinates: { latitude: -12.1688, longitude: 26.3894 },
  },
  {
    id: 'city-zm-kasama',
    districtId: 'dist-zm-kasama',
    provinceId: 'zm-northern',
    countryCode: 'ZM',
    name: 'Kasama',
    isMajorCity: true,
    coordinates: { latitude: -10.2129, longitude: 31.1808 },
  },
  {
    id: 'city-zm-mongu',
    districtId: 'dist-zm-mongu',
    provinceId: 'zm-western',
    countryCode: 'ZM',
    name: 'Mongu',
    isMajorCity: true,
    coordinates: { latitude: -15.2484, longitude: 23.1274 },
  },
  {
    id: 'city-zm-kalulushi',
    districtId: 'dist-zm-kalulushi',
    provinceId: 'zm-copperbelt',
    countryCode: 'ZM',
    name: 'Kalulushi',
    isMajorCity: false,
    coordinates: { latitude: -12.8398, longitude: 28.0931 },
  },
  {
    id: 'city-zm-luanshya',
    districtId: 'dist-zm-luanshya',
    provinceId: 'zm-copperbelt',
    countryCode: 'ZM',
    name: 'Luanshya',
    isMajorCity: false,
    coordinates: { latitude: -13.1367, longitude: 28.4166 },
  },
  {
    id: 'city-zm-chililabombwe',
    districtId: 'dist-zm-chililabombwe',
    provinceId: 'zm-copperbelt',
    countryCode: 'ZM',
    name: 'Chililabombwe',
    isMajorCity: false,
    coordinates: { latitude: -12.3644, longitude: 27.8229 },
  },
  {
    id: 'city-zm-choma',
    districtId: 'dist-zm-choma',
    provinceId: 'zm-southern',
    countryCode: 'ZM',
    name: 'Choma',
    isMajorCity: false,
    coordinates: { latitude: -16.8066, longitude: 26.9875 },
  },
  {
    id: 'city-zm-mazabuka',
    districtId: 'dist-zm-mazabuka',
    provinceId: 'zm-southern',
    countryCode: 'ZM',
    name: 'Mazabuka',
    isMajorCity: false,
    coordinates: { latitude: -15.8560, longitude: 27.7480 },
  },
  {
    id: 'city-zm-mansa',
    districtId: 'dist-zm-mansa',
    provinceId: 'zm-luapula',
    countryCode: 'ZM',
    name: 'Mansa',
    isMajorCity: false,
    coordinates: { latitude: -11.1998, longitude: 28.8943 },
  },
  {
    id: 'city-zm-mpika',
    districtId: 'dist-zm-mpika',
    provinceId: 'zm-muchinga',
    countryCode: 'ZM',
    name: 'Mpika',
    isMajorCity: false,
    coordinates: { latitude: -11.8343, longitude: 31.4529 },
  },

  // Regional Expansion Hubs (Seamlessly ready)
  {
    id: 'city-zw-harare',
    districtId: 'dist-zw-harare',
    provinceId: 'zw-harare',
    countryCode: 'ZW',
    name: 'Harare',
    isMajorCity: true,
    coordinates: { latitude: -17.8252, longitude: 31.0335 },
  },
  {
    id: 'city-zw-bulawayo',
    districtId: 'dist-zw-bulawayo',
    provinceId: 'zw-bulawayo',
    countryCode: 'ZW',
    name: 'Bulawayo',
    isMajorCity: true,
    coordinates: { latitude: -20.1500, longitude: 28.5833 },
  },
  {
    id: 'city-bw-gaborone',
    districtId: 'dist-bw-gaborone',
    provinceId: 'bw-south-east',
    countryCode: 'BW',
    name: 'Gaborone',
    isMajorCity: true,
    coordinates: { latitude: -24.6282, longitude: 25.9231 },
  },
  {
    id: 'city-mw-lilongwe',
    districtId: 'dist-mw-lilongwe',
    provinceId: 'mw-central',
    countryCode: 'MW',
    name: 'Lilongwe',
    isMajorCity: true,
    coordinates: { latitude: -13.9626, longitude: 33.7741 },
  },
  {
    id: 'city-mw-blantyre',
    districtId: 'dist-mw-blantyre',
    provinceId: 'mw-southern',
    countryCode: 'MW',
    name: 'Blantyre',
    isMajorCity: true,
    coordinates: { latitude: -15.7861, longitude: 35.0058 },
  },
  {
    id: 'city-za-jhb',
    districtId: 'dist-za-jhb',
    provinceId: 'za-gauteng',
    countryCode: 'ZA',
    name: 'Johannesburg',
    isMajorCity: true,
    coordinates: { latitude: -26.2041, longitude: 28.0473 },
  },
  {
    id: 'city-za-cpt',
    districtId: 'dist-za-cpt',
    provinceId: 'za-western-cape',
    countryCode: 'ZA',
    name: 'Cape Town',
    isMajorCity: true,
    coordinates: { latitude: -33.9249, longitude: 18.4241 },
  },
  {
    id: 'city-tz-dar',
    districtId: 'dist-tz-dar',
    provinceId: 'tz-dar',
    countryCode: 'TZ',
    name: 'Dar es Salaam',
    isMajorCity: true,
    coordinates: { latitude: -6.7924, longitude: 39.2083 },
  },
];

export const AREAS_NEIGHBORHOODS: AreaNeighborhood[] = [
  // Kitwe Neighborhoods
  { id: 'area-kitwe-parklands', cityId: 'city-zm-kitwe', districtId: 'dist-zm-kitwe', provinceId: 'zm-copperbelt', countryCode: 'ZM', name: 'Parklands', coordinates: { latitude: -12.7984, longitude: 28.2178 } },
  { id: 'area-kitwe-riverside', cityId: 'city-zm-kitwe', districtId: 'dist-zm-kitwe', provinceId: 'zm-copperbelt', countryCode: 'ZM', name: 'Riverside', coordinates: { latitude: -12.8091, longitude: 28.2254 } },
  { id: 'area-kitwe-cbd', cityId: 'city-zm-kitwe', districtId: 'dist-zm-kitwe', provinceId: 'zm-copperbelt', countryCode: 'ZM', name: 'Town Centre / CBD', coordinates: { latitude: -12.8024, longitude: 28.2132 } },
  { id: 'area-kitwe-industrial', cityId: 'city-zm-kitwe', districtId: 'dist-zm-kitwe', provinceId: 'zm-copperbelt', countryCode: 'ZM', name: 'Heavy Industrial Area', coordinates: { latitude: -12.8150, longitude: 28.2040 } },
  { id: 'area-kitwe-nkana', cityId: 'city-zm-kitwe', districtId: 'dist-zm-kitwe', provinceId: 'zm-copperbelt', countryCode: 'ZM', name: 'Nkana East & West', coordinates: { latitude: -12.8220, longitude: 28.2110 } },
  { id: 'area-kitwe-garneton', cityId: 'city-zm-kitwe', districtId: 'dist-zm-kitwe', provinceId: 'zm-copperbelt', countryCode: 'ZM', name: 'Garneton', coordinates: { latitude: -12.7300, longitude: 28.2400 } },

  // Lusaka Neighborhoods
  { id: 'area-lusaka-cbd', cityId: 'city-zm-lusaka', districtId: 'dist-zm-lusaka', provinceId: 'zm-lusaka', countryCode: 'ZM', name: 'Cairo Road / CBD', coordinates: { latitude: -15.4167, longitude: 28.2833 } },
  { id: 'area-lusaka-kabulonga', cityId: 'city-zm-lusaka', districtId: 'dist-zm-lusaka', provinceId: 'zm-lusaka', countryCode: 'ZM', name: 'Kabulonga', coordinates: { latitude: -15.4215, longitude: 28.3438 } },
  { id: 'area-lusaka-woodlands', cityId: 'city-zm-lusaka', districtId: 'dist-zm-lusaka', provinceId: 'zm-lusaka', countryCode: 'ZM', name: 'Woodlands', coordinates: { latitude: -15.4380, longitude: 28.3300 } },
  { id: 'area-lusaka-rhodespark', cityId: 'city-zm-lusaka', districtId: 'dist-zm-lusaka', provinceId: 'zm-lusaka', countryCode: 'ZM', name: 'Rhodes Park', coordinates: { latitude: -15.4050, longitude: 28.3050 } },
  { id: 'area-lusaka-massmedia', cityId: 'city-zm-lusaka', districtId: 'dist-zm-lusaka', provinceId: 'zm-lusaka', countryCode: 'ZM', name: 'Mass Media / Longacres', coordinates: { latitude: -15.4120, longitude: 28.3240 } },
  { id: 'area-lusaka-roma', cityId: 'city-zm-lusaka', districtId: 'dist-zm-lusaka', provinceId: 'zm-lusaka', countryCode: 'ZM', name: 'Roma & Foxdale', coordinates: { latitude: -15.3750, longitude: 28.3120 } },

  // Ndola Neighborhoods
  { id: 'area-ndola-cbd', cityId: 'city-zm-ndola', districtId: 'dist-zm-ndola', provinceId: 'zm-copperbelt', countryCode: 'ZM', name: 'Town Centre / Broadway', coordinates: { latitude: -12.9906, longitude: 28.6366 } },
  { id: 'area-ndola-kansenshi', cityId: 'city-zm-ndola', districtId: 'dist-zm-ndola', provinceId: 'zm-copperbelt', countryCode: 'ZM', name: 'Kansenshi', coordinates: { latitude: -12.9780, longitude: 28.6250 } },
  { id: 'area-ndola-industrial', cityId: 'city-zm-ndola', districtId: 'dist-zm-ndola', provinceId: 'zm-copperbelt', countryCode: 'ZM', name: 'Bwana Mkubwa Industrial Area', coordinates: { latitude: -13.0150, longitude: 28.6700 } },

  // Livingstone Neighborhoods
  { id: 'area-livingstone-cbd', cityId: 'city-zm-livingstone', districtId: 'dist-zm-livingstone', provinceId: 'zm-southern', countryCode: 'ZM', name: 'Town Centre & Mosi-oa-Tunya', coordinates: { latitude: -17.8419, longitude: 25.8543 } },
  { id: 'area-livingstone-maramba', cityId: 'city-zm-livingstone', districtId: 'dist-zm-livingstone', provinceId: 'zm-southern', countryCode: 'ZM', name: 'Maramba', coordinates: { latitude: -17.8550, longitude: 25.8700 } },
];

/**
 * Unified LocationArea view model built dynamically from the hierarchical model
 */
export const HIERARCHICAL_LOCATIONS: LocationArea[] = CITIES_TOWNS.map((city) => {
  const district = DISTRICTS.find((d) => d.id === city.districtId);
  const province = PROVINCES_REGIONS.find((p) => p.id === city.provinceId);
  const country = SUPPORTED_COUNTRIES.find((c) => c.code === city.countryCode);

  return {
    id: `loc-${city.id.replace('city-', '')}`,
    name: `${city.name} (${province?.name || ''})`,
    countryCode: city.countryCode,
    country: country?.name || 'Zambia',
    province: province?.name || '',
    provinceId: city.provinceId,
    district: district?.name || city.name,
    districtId: city.districtId,
    city: city.name,
    cityId: city.id,
    coordinates: city.coordinates,
    isPopular: city.isMajorCity || false,
  };
});

/**
 * Helper to query geographic hierarchy
 */
export function getProvincesByCountry(countryCode: string): ProvinceRegion[] {
  return PROVINCES_REGIONS.filter((p) => p.countryCode === countryCode);
}

export function getDistrictsByProvince(provinceId: string): District[] {
  return DISTRICTS.filter((d) => d.provinceId === provinceId);
}

export function getCitiesByDistrict(districtId: string): CityTown[] {
  return CITIES_TOWNS.filter((c) => c.districtId === districtId);
}

export function getCitiesByProvince(provinceId: string): CityTown[] {
  return CITIES_TOWNS.filter((c) => c.provinceId === provinceId);
}

export function getAreasByCity(cityId: string): AreaNeighborhood[] {
  return AREAS_NEIGHBORHOODS.filter((a) => a.cityId === cityId);
}
