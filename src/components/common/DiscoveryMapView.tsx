import React from 'react';
import { Business, LocationCoordinates } from '../../types';
import { GoogleMapView } from './GoogleMapView';

interface DiscoveryMapViewProps {
  businesses: Business[];
  center?: LocationCoordinates;
  zoom?: number;
  selectedBusinessId?: string;
  onSelectBusiness?: (business: Business) => void;
  onCall?: (phone: string, e: React.MouseEvent) => void;
  onDirections?: (business: Business, e: React.MouseEvent) => void;
  heightClass?: string;
  showRadiusCircle?: boolean;
  radiusKm?: number;
}

export const DiscoveryMapView: React.FC<DiscoveryMapViewProps> = ({
  businesses,
  center = { latitude: -12.8024, longitude: 28.2132 }, // Kitwe default
  zoom = 13,
  selectedBusinessId,
  onSelectBusiness,
  heightClass = 'h-[420px] sm:h-[480px]',
}) => {
  const activeBusiness = businesses.find((b) => b.id === selectedBusinessId) || null;

  return (
    <GoogleMapView
      businesses={businesses}
      activeBusiness={activeBusiness}
      center={center}
      zoom={zoom}
      onSelectBusiness={onSelectBusiness}
      heightClass={heightClass}
      showMapTypeControl={true}
    />
  );
};
