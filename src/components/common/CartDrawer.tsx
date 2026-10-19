import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  Truck,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Phone,
  Lock,
  Wallet
} from 'lucide-react';
import { useCart, PaymentMethod, Order } from '../../context/CartContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess?: (order: Order) => void;
  isAuthenticated?: boolean;
  isNrcVerified?: boolean;
  onRequireLogin?: () => void;
  onStartNrcVerification?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
  isAuthenticated = false,
  isNrcVerified = false,
  onRequireLogin,
  onStartNrcVerification,
}) => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    totalItems,
    subtotal,
    deliveryFee,
    bwanaSplitFee,
    total,
    createOrder,
    walletBalance,
  } = useCart();

  const [step, setStep] = useState<'cart' | 'checkout' | 'confirmed'>('cart');
  const [customerName, setCustomerName] = useState('Mwamba Chisanga');
  const [customerPhone, setCustomerPhone] = useState('+260 97 711 8330');
  const [deliveryAddress, setDeliveryAddress] = useState('Plot 418, Riverside Ext, Kitwe');
  const [notes, setNotes] = useState('Call upon arrival at the gate');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mtn_momo');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const order = createOrder({
        customerName,
        customerPhone,
        deliveryAddress,
        paymentMethod,
        notes,
      });

      setIsProcessing(false);
      if (order) {
        setCreatedOrder(order);
        setStep('confirmed');
        if (onOrderSuccess) onOrderSuccess(order);
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-950/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 h-full shadow-2xl flex flex-col z-10 border-l border-stone-200 dark:border-stone-800 animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold font-display text-stone-900 dark:text-white text-base">
                {step === 'cart' ? `Bwana Cart (${totalItems})` : step === 'checkout' ? 'Instant Checkout' : 'Order Placed ✓'}
              </h2>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                1% Fair Platform Split · Local Kitwe & Lusaka
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {step === 'cart' && (
            <>
              {items.length === 0 ? (
                <div className="p-12 text-center text-stone-500 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto text-stone-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-sm text-stone-800 dark:text-stone-200">Your cart is empty</h3>
                  <p className="text-xs text-stone-400 max-w-xs mx-auto">
                    Browse verified hardware stores, grocery kantembas, or restaurants and add items to purchase.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-stone-400 truncate uppercase tracking-wider font-semibold">
                          {item.businessName}
                        </div>
                        <h4 className="font-semibold text-stone-900 dark:text-white text-xs truncate">
                          {item.product.name}
                        </h4>
                        <div className="text-emerald-700 dark:text-emerald-400 font-mono font-bold mt-0.5">
                          {item.product.currency} {item.product.price.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-stone-500 hover:text-stone-900 dark:hover:text-white cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-mono font-bold text-xs">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-stone-500 hover:text-stone-900 dark:hover:text-white cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Pricing Breakdown & 1% Platform Split Indicator */}
                  <div className="p-3.5 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 space-y-2">
                    <div className="flex justify-between text-stone-600 dark:text-stone-400">
                      <span>Items Subtotal</span>
                      <span className="font-mono font-semibold">ZMW {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-stone-600 dark:text-stone-400">
                      <span>Doorstep Courier Delivery (Kitwe Metro)</span>
                      <span className="font-mono font-semibold">ZMW {deliveryFee.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-700/60 flex justify-between items-center text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                      <span>Bwana 1% Fair Auto-Split:</span>
                      <span>ZMW {bwanaSplitFee.toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t border-stone-200 dark:border-stone-700 flex justify-between text-sm font-bold text-stone-900 dark:text-white">
                      <span>Total Due</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">ZMW {total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Order Access Limitation Banner for Unverified Users */}
                  {isAuthenticated && !isNrcVerified && (
                    <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
                        <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>Order Access Restricted</span>
                      </div>
                      <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                        Under Zambian commerce safety rules, placing orders and checkout requires completing NRC & facial verification. You can leave business reviews freely, but order access unlocks upon identity verification.
                      </p>
                      {onStartNrcVerification && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onStartNrcVerification();
                          }}
                          className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verify NRC & Face in Dashboard</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {step === 'checkout' && !isNrcVerified && (
            <div className="p-6 text-center space-y-4 my-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-600 mx-auto flex items-center justify-center">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 px-2.5 py-0.5 rounded-full uppercase">
                  Permission Restricted: Order Access
                </span>
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  NRC & Facial Scan Required
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-sm mx-auto">
                  To protect consumers and merchants, placing orders and dispatching couriers requires an approved Zambian National Registration Card and live facial scan.
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2 max-w-xs mx-auto w-full">
                {onStartNrcVerification && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onStartNrcVerification();
                    }}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-xs cursor-pointer shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify NRC & Face in Dashboard</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="w-full py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-semibold text-xs cursor-pointer"
                >
                  Return to Cart
                </button>
              </div>
            </div>
          )}

          {step === 'checkout' && isNrcVerified && (
            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300">MoMo Phone Number (MTN / Airtel)</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl font-mono text-stone-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300">Delivery Address / Location</label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300">Special Delivery Instructions</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                  rows={2}
                />
              </div>

              {/* Payment Methods (MoMo, Airtel, Bwana Wallet, Cash) */}
              <div className="space-y-2 pt-2">
                <label className="font-bold text-stone-700 dark:text-stone-300 block">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mtn_momo')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between cursor-pointer ${
                      paymentMethod === 'mtn_momo'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                        : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <span className="font-bold">MTN MoMo</span>
                    <span className="text-[10px] text-stone-500">Instant Push Prompt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('airtel_money')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between cursor-pointer ${
                      paymentMethod === 'airtel_money'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                        : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <span className="font-bold">Airtel Money</span>
                    <span className="text-[10px] text-stone-500">Direct Mobile PIN</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bwana_wallet')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between cursor-pointer ${
                      paymentMethod === 'bwana_wallet'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                        : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-bold">
                      <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Bwana Wallet</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700">K{walletBalance.toFixed(2)} float</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash_on_delivery')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between cursor-pointer ${
                      paymentMethod === 'cash_on_delivery'
                        ? 'border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white'
                        : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <span className="font-bold">Cash on Delivery</span>
                    <span className="text-[10px] text-stone-500">POD to Courier Rider</span>
                  </button>
                </div>
              </div>

              {/* Order total confirmation */}
              <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 flex justify-between items-center text-xs">
                <span>Total Charge:</span>
                <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  ZMW {total.toLocaleString()}
                </span>
              </div>

              {/* Verification Gating for Order Access */}
              {!isNrcVerified ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-300 dark:border-amber-800 text-xs space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold text-amber-950 dark:text-amber-100 block">
                        Order Access Restricted (NRC Verification Required)
                      </span>
                      <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                        As a registered user, you have limited permissions. Placing orders and processing payment settlements requires verified Zambian NRC and live facial recognition.
                      </p>
                    </div>
                  </div>
                  {onStartNrcVerification ? (
                    <button
                      type="button"
                      onClick={onStartNrcVerification}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Complete NRC Verification in Dashboard</span>
                    </button>
                  ) : null}
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Processing MoMo Payment...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Confirm & Pay ZMW {total.toLocaleString()}</span>
                    </>
                  )}
                </button>
              )}
            </form>
          )}

          {step === 'confirmed' && createdOrder && (
            <div className="p-4 space-y-4 text-center">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold font-display text-lg text-stone-900 dark:text-white">
                  Payment Received & Order Dispatched!
                </h3>
                <p className="text-stone-500 text-xs mt-1">
                  Tracking No: <span className="font-mono font-bold text-stone-900 dark:text-white">{createdOrder.trackingNumber}</span>
                </p>
              </div>

              <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-xl text-left space-y-2 text-xs border border-stone-200 dark:border-stone-700">
                <div className="flex justify-between font-semibold">
                  <span>Merchant:</span>
                  <span>{createdOrder.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Courier Assigned:</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">{createdOrder.courierName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Courier Phone:</span>
                  <span className="font-mono">{createdOrder.courierPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Merchant Payout (99%):</span>
                  <span className="font-mono font-semibold">ZMW {createdOrder.merchantPayout.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-mono font-bold">
                  <span>Bwana 1% Commission:</span>
                  <span>ZMW {createdOrder.platformSplitFee.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setStep('cart');
                  onClose();
                }}
                className="w-full py-2.5 bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 text-white rounded-xl font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step === 'cart' && items.length > 0 && (
          <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-stone-400 block">Total Due:</span>
              <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                ZMW {total.toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  if (onRequireLogin) onRequireLogin();
                  return;
                }
                if (!isNrcVerified) {
                  if (onStartNrcVerification) {
                    onClose();
                    onStartNrcVerification();
                  }
                  return;
                }
                setStep('checkout');
              }}
              className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-sm text-xs transition-colors ${
                !isAuthenticated
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : !isNrcVerified
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {!isAuthenticated ? (
                <>
                  <span>Sign In to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : !isNrcVerified ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Verify NRC to Order</span>
                </>
              ) : (
                <>
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
