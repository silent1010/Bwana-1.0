import React, { useState, useEffect } from 'react';
import {
  X,
  Truck,
  Car,
  Navigation,
  MapPin,
  Clock,
  CheckCircle,
  ShieldCheck,
  Phone,
  Camera,
  KeyRound,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { INITIAL_COURIERS, INITIAL_RIDES } from '../../data/mockData';
import { CourierDriver, RideRequest } from '../../types';
import {
  subscribeToCouriers,
  subscribeToRides,
  createRideInFirestore
} from '../../services/firebase';

interface CourierLogisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated?: boolean;
  isNrcVerified?: boolean;
  onRequireLogin?: () => void;
  onStartNrcVerification?: () => void;
}

export const CourierLogisticsModal: React.FC<CourierLogisticsModalProps> = ({
  isOpen,
  onClose,
  isAuthenticated = false,
  isNrcVerified = false,
  onRequireLogin,
  onStartNrcVerification,
}) => {
  const [activeTab, setActiveTab] = useState<'delivery_tracking' | 'ride_hailing' | 'courier_pwa'>('delivery_tracking');

  // Simulated live delivery tracking state
  const [deliveryStep, setDeliveryStep] = useState<'order_placed' | 'courier_assigned' | 'in_transit' | 'delivered'>('in_transit');
  const [courierLocationProgress, setCourierLocationProgress] = useState(45); // percentage towards destination
  const [etaMinutes, setEtaMinutes] = useState(14);
  const [otpCode, setOtpCode] = useState('7842');
  const [podPhotoVerified, setPodPhotoVerified] = useState(false);

  // Ride Hailing state
  const [pickupSpot, setPickupSpot] = useState('Parklands, Independence Ave');
  const [dropoffSpot, setDropoffSpot] = useState('Riverside Ext, Jambo Drive');
  const [rideDistanceKm, setRideDistanceKm] = useState(4.5);
  const [selectedRideType, setSelectedRideType] = useState<'bwana_bike' | 'bwana_cab'>('bwana_bike');
  const [rideBooked, setRideBooked] = useState(false);
  const [couriers, setCouriers] = useState<CourierDriver[]>(INITIAL_COURIERS);
  const [assignedDriver, setAssignedDriver] = useState<CourierDriver | null>(INITIAL_COURIERS[0]);

  // Synchronize with live Firestore couriers
  useEffect(() => {
    const unsub = subscribeToCouriers((liveCouriers) => {
      if (liveCouriers && liveCouriers.length > 0) {
        setCouriers(liveCouriers);
        if (!assignedDriver) {
          setAssignedDriver(liveCouriers[0]);
        }
      }
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // Courier PWA dispatch job state
  const [pwaJobStatus, setPwaJobStatus] = useState<'available' | 'accepted' | 'picked_up' | 'delivered'>('available');
  const [driverOtpInput, setDriverOtpInput] = useState('');
  const [driverPodCaptured, setDriverPodCaptured] = useState(false);

  // Auto-increment progress every 4 seconds to simulate 10s GPS polling
  useEffect(() => {
    if (!isOpen || deliveryStep !== 'in_transit') return;

    const timer = setInterval(() => {
      setCourierLocationProgress((prev) => {
        if (prev >= 95) {
          return 95;
        }
        return prev + 5;
      });
      setEtaMinutes((prev) => Math.max(1, prev - 1));
    }, 4000);

    return () => clearInterval(timer);
  }, [isOpen, deliveryStep]);

  if (!isOpen) return null;

  // Pricing Engine: Base K20 + K4/km (for bike) or Base K35 + K7/km (for cab)
  const calculateRideFare = () => {
    if (selectedRideType === 'bwana_bike') {
      const base = 20;
      const rate = 4;
      return base + (rideDistanceKm * rate);
    } else {
      const base = 35;
      const rate = 7;
      return base + (rideDistanceKm * rate);
    }
  };

  const handleBookRide = (e: React.FormEvent) => {
    e.preventDefault();
    setRideBooked(true);

    const newRide: RideRequest = {
      id: `ride-${Date.now()}`,
      passengerName: 'Mwamba Chisanga',
      passengerPhone: '+260 97 711 8330',
      pickupLocation: pickupSpot,
      dropoffLocation: dropoffSpot,
      distanceKm: rideDistanceKm,
      baseFare: selectedRideType === 'bwana_bike' ? 20 : 35,
      perKmRate: selectedRideType === 'bwana_bike' ? 4 : 7,
      totalFare: calculateRideFare(),
      status: 'driver_assigned',
      driverId: assignedDriver?.id || couriers[0]?.id,
      driverName: assignedDriver?.name || couriers[0]?.name,
      createdAt: new Date().toISOString(),
    };

    createRideInFirestore(newRide).catch((err) => {
      console.warn('Failed to save ride to Firestore:', err);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-stone-950 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-display text-white">Bwana Express Logistics & Rides</h3>
                <span className="text-[11px] font-mono bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded font-bold">
                  Phase 2 Live
                </span>
              </div>
              <p className="text-xs text-stone-400">
                GPS Tracking, Courier PWA Dispatch & Pricing Engine (Kitwe & Lusaka)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 px-6">
          <button
            onClick={() => setActiveTab('delivery_tracking')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'delivery_tracking'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            📦 Live Delivery Tracker & POD
          </button>
          <button
            onClick={() => setActiveTab('ride_hailing')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'ride_hailing'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            🛵 Bwana Rides (Base K20 + K4/km)
          </button>
          <button
            onClick={() => setActiveTab('courier_pwa')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'courier_pwa'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            📱 Courier Rider PWA Simulator
          </button>
        </div>

        {/* Permission Gate for Delivery Access */}
        {!isAuthenticated ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-500 mx-auto flex items-center justify-center">
              <Truck className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-base font-bold text-stone-900 dark:text-white">
                Sign In Required for Delivery Access
              </h4>
              <p className="text-xs text-stone-500">
                To access live delivery tracking, book on-demand motorcycle dispatches, and use courier services in Kitwe and Lusaka, please sign in or create an account.
              </p>
            </div>
            {onRequireLogin && (
              <button
                type="button"
                onClick={onRequireLogin}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Sign In / Register
              </button>
            )}
          </div>
        ) : !isNrcVerified ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-600 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full uppercase">
                Permission Restricted: Delivery Access
              </span>
              <h4 className="text-base font-bold text-stone-900 dark:text-white">
                Zambian NRC & Biometric Verification Required
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                As a registered user, you can browse and write business reviews. However, under national logistics and courier security standards, booking rider deliveries, courier dispatches, and live parcel tracking requires a verified National Registration Card and live facial scan.
              </p>
            </div>
            {onStartNrcVerification && (
              <button
                type="button"
                onClick={onStartNrcVerification}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 mx-auto cursor-pointer shadow-sm transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify NRC & Face in Dashboard</span>
              </button>
            )}
          </div>
        ) : (
          /* Content */
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* TAB 1: LIVE DELIVERY TRACKING */}
            {activeTab === 'delivery_tracking' && (
              <div className="space-y-6">
                {/* Live Map Radar Graphic */}
                <div className="relative aspect-16/7 bg-stone-950 rounded-xl overflow-hidden border border-stone-800 p-4 flex flex-col justify-between text-white">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-mono text-emerald-400">GPS Ping: Active (every 10s)</span>
                  </div>
                  <span className="font-mono text-stone-400">Tracking: #BW-9941-KTW</span>
                </div>

                {/* Progress bar visual */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-stone-300">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      ABC Hardware (Parklands)
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      ETA: ~{etaMinutes} mins
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      Riverside Ext, Plot 418
                    </span>
                  </div>

                  <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden relative">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-700"
                      style={{ width: `${courierLocationProgress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-400">
                    <span>Courier Kelvin Mwewa (Bajaj Boxer 150)</span>
                    <span>Distance Covered: {(courierLocationProgress * 0.04).toFixed(1)} / 4.0 km</span>
                  </div>
                </div>
              </div>

              {/* Delivery Steps & OTP Proof of Delivery */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Proof of Delivery (POD) Security</span>
                  </h4>
                  <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-3 rounded-lg text-center">
                    <span className="text-[11px] text-stone-500 block">Your 4-Digit Delivery OTP Code:</span>
                    <span className="text-2xl font-mono font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400 block mt-1">
                      {otpCode}
                    </span>
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      Give this code to rider Kelvin only upon receiving your items.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
                    <Camera className="w-4 h-4 text-stone-400" />
                    <span>Courier takes photo of parcel upon delivery handover.</span>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl space-y-2 text-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                    Assigned Courier Details
                  </h4>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-stone-500">Rider:</span>
                    <span className="font-bold text-stone-900 dark:text-white">Kelvin Mwewa ★ 4.9</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Vehicle:</span>
                    <span className="font-mono text-stone-800 dark:text-stone-200">ABC 2894 ZM (Motorcycle)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Completed Deliveries:</span>
                    <span className="font-semibold text-emerald-600">342 verified trips</span>
                  </div>
                  <div className="pt-2">
                    <a
                      href="tel:+260971234567"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors text-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Courier (+260 97 123 4567)</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RIDE HAILING & PRICING ENGINE */}
          {activeTab === 'ride_hailing' && (
            <div className="space-y-6">
              <div className="p-4 bg-stone-950 text-white rounded-xl border border-stone-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Bwana Ride Pricing Engine</span>
                  </div>
                  <div className="text-lg font-bold font-display mt-0.5">
                    Kitwe & Lusaka Standard Fare Matrix
                  </div>
                  <div className="text-xs text-stone-400 mt-1">
                    Motorcycle: Base K20 + K4/km · Bwana Cab: Base K35 + K7/km
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-stone-400 block">Est. Fare</span>
                  <span className="text-2xl font-mono font-extrabold text-amber-400">
                    ZMW {calculateRideFare().toFixed(0)}
                  </span>
                </div>
              </div>

              <form onSubmit={handleBookRide} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Pickup Location
                    </label>
                    <input
                      type="text"
                      value={pickupSpot}
                      onChange={(e) => setPickupSpot(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Dropoff Destination
                    </label>
                    <input
                      type="text"
                      value={dropoffSpot}
                      onChange={(e) => setDropoffSpot(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Distance (km): {rideDistanceKm} km
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={25}
                      step={0.5}
                      value={rideDistanceKm}
                      onChange={(e) => setRideDistanceKm(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRideType('bwana_bike')}
                      className={`flex-1 p-2 rounded-lg text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center ${
                        selectedRideType === 'bwana_bike'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'border-stone-200 dark:border-stone-700 text-stone-600'
                      }`}
                    >
                      <Navigation className="w-4 h-4 mb-0.5" />
                      <span>Motorcycle (K20+K4/km)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRideType('bwana_cab')}
                      className={`flex-1 p-2 rounded-lg text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center ${
                        selectedRideType === 'bwana_cab'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'border-stone-200 dark:border-stone-700 text-stone-600'
                      }`}
                    >
                      <Car className="w-4 h-4 mb-0.5" />
                      <span>Bwana Cab (K35+K7/km)</span>
                    </button>
                  </div>
                </div>

                {rideBooked ? (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" />
                        <span>Driver Dispatched! Kelvin Mwewa arriving in 4 mins</span>
                      </div>
                      <div className="text-stone-500 mt-0.5">
                        {pickupSpot} → {dropoffSpot} (Fare: ZMW {calculateRideFare().toFixed(0)})
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRideBooked(false)}
                      className="px-3 py-1 bg-stone-200 dark:bg-stone-800 rounded font-semibold text-stone-700 dark:text-stone-300"
                    >
                      Reset
                    </button>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Request Bwana Ride · ZMW {calculateRideFare().toFixed(0)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </form>
            </div>
          )}

          {/* TAB 3: COURIER PWA RIDER SIMULATOR */}
          {activeTab === 'courier_pwa' && (
            <div className="space-y-4">
              <div className="p-4 bg-stone-900 text-white rounded-xl border border-stone-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold block">
                      COURIER RIDER PWA VIEW (Bajaj Boxer #ABC 2894)
                    </span>
                    <h4 className="font-bold text-sm text-stone-100 mt-0.5">
                      Incoming Delivery Order #ORD-9941
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/40">
                    Earn K32.00 (80% split)
                  </span>
                </div>
                <div className="text-xs text-stone-400 mt-2 space-y-1">
                  <div>Pickup: ABC Hardware, Parklands (Independence Ave)</div>
                  <div>Dropoff: Plot 418, Riverside Ext, Kitwe</div>
                  <div>Items: 1x DeWalt Hammer Drill, 2x Brass Ball Valves</div>
                </div>
              </div>

              {/* Rider Action Flow */}
              <div className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-700 dark:text-stone-300">Rider Job State:</span>
                  <span className="font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400">
                    {pwaJobStatus}
                  </span>
                </div>

                {pwaJobStatus === 'available' && (
                  <button
                    onClick={() => setPwaJobStatus('accepted')}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer"
                  >
                    1. Accept Delivery Job (K32 Rider Fee)
                  </button>
                )}

                {pwaJobStatus === 'accepted' && (
                  <button
                    onClick={() => setPwaJobStatus('picked_up')}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer"
                  >
                    2. Arrived at Shop & Picked Up Goods
                  </button>
                )}

                {pwaJobStatus === 'picked_up' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Enter Customer OTP to Complete Handover (Try '7842'):
                      </label>
                      <input
                        type="text"
                        placeholder="4-digit OTP"
                        value={driverOtpInput}
                        onChange={(e) => setDriverOtpInput(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (driverOtpInput === '7842') {
                          setPwaJobStatus('delivered');
                          setDriverPodCaptured(true);
                        } else {
                          alert('Invalid OTP. Code is 7842.');
                        }
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-4 h-4" />
                      <span>3. Verify OTP & Capture POD Photo</span>
                    </button>
                  </div>
                )}

                {pwaJobStatus === 'delivered' && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 rounded-lg text-xs text-center space-y-2">
                    <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto" />
                    <div className="font-bold text-emerald-800 dark:text-emerald-300">
                      Delivery Completed & Verified via OTP #7842!
                    </div>
                    <div className="text-stone-500 text-[11px]">
                      K32.00 rider payout instantly credited to your MoMo wallet.
                    </div>
                    <button
                      onClick={() => {
                        setPwaJobStatus('available');
                        setDriverOtpInput('');
                      }}
                      className="px-3 py-1 bg-stone-200 dark:bg-stone-800 rounded font-semibold text-stone-700 dark:text-stone-300 mt-2"
                    >
                      Reset Simulator
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

        {/* Footer */}
        <div className="p-4 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
          <span>Bwana Logistics Protocol · Live Courier Realtime Sync</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-800 dark:text-stone-200 rounded-lg font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
