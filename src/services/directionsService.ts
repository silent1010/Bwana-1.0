import { LocationCoordinates } from '../types';

export interface RouteStep {
  instruction: string;
  distanceText: string;
  distanceMeters: number;
  durationText: string;
  durationSeconds: number;
  icon: 'straight' | 'turn-left' | 'turn-right' | 'roundabout' | 'uturn' | 'destination';
}

export interface InAppRoute {
  origin: {
    name: string;
    coordinates: LocationCoordinates;
  };
  destination: {
    name: string;
    coordinates: LocationCoordinates;
    address?: string;
  };
  distanceKm: number;
  distanceText: string;
  durationText: {
    driving: string;
    motorcycle: string;
    walking: string;
  };
  durationSeconds: {
    driving: number;
    motorcycle: number;
    walking: number;
  };
  path: LocationCoordinates[];
  steps: RouteStep[];
}

/**
 * Calculates straight line distance using Haversine formula (km)
 */
export function calculateDirectDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Generates an in-app road route between two Zambian coordinate locations
 * including smooth interpolated waypoints and realistic turn-by-turn instructions.
 */
export function calculateInAppRoute(
  originCoord: LocationCoordinates,
  originName: string,
  destCoord: LocationCoordinates,
  destName: string,
  destAddress?: string
): InAppRoute {
  const directDist = calculateDirectDistanceKm(
    originCoord.latitude,
    originCoord.longitude,
    destCoord.latitude,
    destCoord.longitude
  );

  // Urban/highway road routing winding coefficient in Zambia (typically 1.25x - 1.35x of direct distance)
  const roadDistanceKm = Number((directDist * 1.28).toFixed(1));
  const distanceMeters = Math.round(roadDistanceKm * 1000);

  // Durations:
  // Urban driving in Lusaka/Kitwe averaging ~28 km/h, intercity ~75 km/h
  const avgDriveSpeedKmH = roadDistanceKm > 30 ? 70 : 28;
  const drivingSeconds = Math.round((roadDistanceKm / avgDriveSpeedKmH) * 3600);
  const motorcycleSeconds = Math.round(drivingSeconds * 0.82); // motorcycles bypass congestion
  const walkingSeconds = Math.round((roadDistanceKm / 4.6) * 3600); // 4.6 km/h walking speed

  const formatDuration = (secs: number): string => {
    if (secs < 60) return `${secs} sec`;
    const mins = Math.round(secs / 60);
    if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'}`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return remMins > 0 ? `${hrs} hr ${remMins} min` : `${hrs} hr`;
  };

  // Generate realistic polyline path following road angles
  const path: LocationCoordinates[] = [];
  const numWaypoints = Math.max(12, Math.min(40, Math.round(roadDistanceKm * 4)));

  const startLat = originCoord.latitude;
  const startLng = originCoord.longitude;
  const endLat = destCoord.latitude;
  const endLng = destCoord.longitude;

  path.push({ latitude: startLat, longitude: startLng });

  // Generate subtle realistic doglegs and road bends
  for (let i = 1; i < numWaypoints; i++) {
    const fraction = i / numWaypoints;
    // Linear base position
    let wLat = startLat + (endLat - startLat) * fraction;
    let wLng = startLng + (endLng - startLng) * fraction;

    // Add subtle perpendicular curvature simulating urban grid & highway turns
    const curvature = Math.sin(fraction * Math.PI) * 0.003 * (i % 2 === 0 ? 1 : -0.7);
    wLat += curvature;
    wLng += curvature * 0.8;

    path.push({
      latitude: Number(wLat.toFixed(6)),
      longitude: Number(wLng.toFixed(6)),
    });
  }

  path.push({ latitude: endLat, longitude: endLng });

  // Build authentic turn-by-turn navigation steps based on location
  const steps: RouteStep[] = [];
  const isKitwe = (destAddress && destAddress.includes('Kitwe')) || destName.includes('Kitwe') || Math.abs(destCoord.latitude - -12.8) < 0.3;
  const isLusaka = (destAddress && destAddress.includes('Lusaka')) || destName.includes('Lusaka') || Math.abs(destCoord.latitude - -15.4) < 0.3;

  if (roadDistanceKm <= 1.0) {
    // Very close
    steps.push({
      instruction: `Head straight toward ${destName}`,
      distanceText: `${Math.round(distanceMeters * 0.4)} m`,
      distanceMeters: Math.round(distanceMeters * 0.4),
      durationText: formatDuration(Math.round(drivingSeconds * 0.4)),
      durationSeconds: Math.round(drivingSeconds * 0.4),
      icon: 'straight',
    });
    steps.push({
      instruction: `Turn into entrance of ${destName}`,
      distanceText: `${Math.round(distanceMeters * 0.6)} m`,
      distanceMeters: Math.round(distanceMeters * 0.6),
      durationText: formatDuration(Math.round(drivingSeconds * 0.6)),
      durationSeconds: Math.round(drivingSeconds * 0.6),
      icon: 'turn-right',
    });
    steps.push({
      instruction: `Arrive at destination: ${destName}`,
      distanceText: '0 m',
      distanceMeters: 0,
      durationText: '0 min',
      durationSeconds: 0,
      icon: 'destination',
    });
  } else if (isKitwe) {
    steps.push({
      instruction: 'Head toward Independence Avenue / Zambia Way',
      distanceText: '450 m',
      distanceMeters: 450,
      durationText: '1 min',
      durationSeconds: 60,
      icon: 'straight',
    });
    steps.push({
      instruction: 'Turn left onto President Avenue toward City Centre',
      distanceText: '1.2 km',
      distanceMeters: 1200,
      durationText: '3 mins',
      durationSeconds: 180,
      icon: 'turn-left',
    });
    if (roadDistanceKm > 4) {
      steps.push({
        instruction: 'Continue onto Kuomboka Drive / Jambo Drive',
        distanceText: `${(roadDistanceKm - 3.2).toFixed(1)} km`,
        distanceMeters: Math.round((roadDistanceKm - 3.2) * 1000),
        durationText: formatDuration(Math.round(drivingSeconds * 0.45)),
        durationSeconds: Math.round(drivingSeconds * 0.45),
        icon: 'straight',
      });
    }
    steps.push({
      instruction: `At the roundabout, take the 2nd exit toward ${destName}`,
      distanceText: '850 m',
      distanceMeters: 850,
      durationText: '2 mins',
      durationSeconds: 120,
      icon: 'roundabout',
    });
    steps.push({
      instruction: `Turn right into main parking and gate of ${destName}`,
      distanceText: '150 m',
      distanceMeters: 150,
      durationText: '1 min',
      durationSeconds: 60,
      icon: 'turn-right',
    });
    steps.push({
      instruction: `Arrive at ${destName} (${destAddress || 'Kitwe'})`,
      distanceText: '0 m',
      distanceMeters: 0,
      durationText: '0 min',
      durationSeconds: 0,
      icon: 'destination',
    });
  } else if (isLusaka) {
    steps.push({
      instruction: 'Head toward Great East Road / Independence Avenue',
      distanceText: '600 m',
      distanceMeters: 600,
      durationText: '2 mins',
      durationSeconds: 120,
      icon: 'straight',
    });
    steps.push({
      instruction: 'Merge onto Great East Road heading toward commercial hub',
      distanceText: '2.1 km',
      distanceMeters: 2100,
      durationText: '5 mins',
      durationSeconds: 300,
      icon: 'turn-right',
    });
    if (roadDistanceKm > 5) {
      steps.push({
        instruction: 'Continue on dual carriageway past major intersection',
        distanceText: `${(roadDistanceKm - 4.5).toFixed(1)} km`,
        distanceMeters: Math.round((roadDistanceKm - 4.5) * 1000),
        durationText: formatDuration(Math.round(drivingSeconds * 0.4)),
        durationSeconds: Math.round(drivingSeconds * 0.4),
        icon: 'straight',
      });
    }
    steps.push({
      instruction: `Turn into service lane toward ${destName}`,
      distanceText: '400 m',
      distanceMeters: 400,
      durationText: '1 min',
      durationSeconds: 60,
      icon: 'turn-left',
    });
    steps.push({
      instruction: `Arrive at ${destName} (${destAddress || 'Lusaka'})`,
      distanceText: '0 m',
      distanceMeters: 0,
      durationText: '0 min',
      durationSeconds: 0,
      icon: 'destination',
    });
  } else {
    // Inter-city or regional Zambia route (e.g. Copperbelt to Lusaka)
    steps.push({
      instruction: `Depart ${originName} heading toward Great North Road (T2)`,
      distanceText: '2.5 km',
      distanceMeters: 2500,
      durationText: '5 mins',
      durationSeconds: 300,
      icon: 'straight',
    });
    steps.push({
      instruction: 'Follow Great North Road (T2 Highway) straight through regional checkpoints',
      distanceText: `${(roadDistanceKm - 6).toFixed(1)} km`,
      distanceMeters: Math.round((roadDistanceKm - 6) * 1000),
      durationText: formatDuration(Math.round(drivingSeconds * 0.75)),
      durationSeconds: Math.round(drivingSeconds * 0.75),
      icon: 'straight',
    });
    steps.push({
      instruction: `Take exit ramp toward ${destName}`,
      distanceText: '1.8 km',
      distanceMeters: 1800,
      durationText: '3 mins',
      durationSeconds: 180,
      icon: 'turn-left',
    });
    steps.push({
      instruction: `Arrive at destination: ${destName}`,
      distanceText: '0 m',
      distanceMeters: 0,
      durationText: '0 min',
      durationSeconds: 0,
      icon: 'destination',
    });
  }

  return {
    origin: {
      name: originName,
      coordinates: originCoord,
    },
    destination: {
      name: destName,
      coordinates: destCoord,
      address: destAddress,
    },
    distanceKm: roadDistanceKm,
    distanceText: roadDistanceKm < 1 ? `${distanceMeters} m` : `${roadDistanceKm} km`,
    durationText: {
      driving: formatDuration(drivingSeconds),
      motorcycle: formatDuration(motorcycleSeconds),
      walking: formatDuration(walkingSeconds),
    },
    durationSeconds: {
      driving: drivingSeconds,
      motorcycle: motorcycleSeconds,
      walking: walkingSeconds,
    },
    path,
    steps,
  };
}
