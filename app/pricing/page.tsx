'use client';

import Header from '@/_components/Header';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import {
  Check, Sparkles, Shield, Zap, Crown, ArrowRight,
  Loader2, AlertCircle, RefreshCw, CheckCircle2, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Dynamically load Razorpay checkout script
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PricingPage = () => {
  const router = useRouter();
  const [isPurchased, setIsPurchased] = useState(false);
  const [loadingCheck, setLoadingCheck] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [devModalOpen, setDevModalOpen] = useState(false);
  const [pendingDevOrder, setPendingDevOrder] = useState<any>(null);

  // Check existing purchase status
  useEffect(() => {
    const checkPurchaseStatus = async () => {
      try {
        const res = await axios.get('/api/checkIsPurchased');
        if (res.data?.isPurchased) {
          setIsPurchased(true);
        }
      } catch {
        // user not logged in or error
      } finally {
        setLoadingCheck(false);
      }
    };

    checkPurchaseStatus();
  }, []);

  // Complete Dev Simulation
  const handleCompleteDevPayment = async (order: any) => {
    try {
      setIsProcessing(true);
      const fakePaymentId = `pay_dev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const verifyRes = await axios.post('/api/razorpay/verify', {
        razorpay_order_id: order.orderId,
        razorpay_payment_id: fakePaymentId,
        razorpay_signature: `dev_sig_${Date.now()}`,
        amount: 499,
        isDevelopmentMode: true,
      });

      if (verifyRes.data?.success) {
        toast.success("Payment Verified! Welcome to Professional 🎉");
        setIsPurchased(true);
        setDevModalOpen(false);
        router.replace('/payment-success');
      } else {
        toast.error(verifyRes.data?.message || "Verification failed");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Payment simulation error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Main Razorpay checkout handler
  const handleRazorpayPayment = async (price: number) => {
    if (price === 0) {
      router.push('/create-new-trip');
      return;
    }

    if (isPurchased) {
      toast.success("You already have an active Professional plan!");
      router.push('/dashboard');
      return;
    }

    try {
      setIsProcessing(true);
      toast.loading("Initiating Razorpay gateway...", { id: "rzp-init" });

      // 1. Create order on backend
      const res = await axios.post('/api/razorpay/create-order', {
        amount: price,
      });

      toast.dismiss("rzp-init");

      if (!res.data?.success) {
        toast.error(res.data?.message || "Failed to create payment order");
        return;
      }

      const orderData = res.data;

      // 2. If in development mode with placeholder keys, show interactive dev modal
      if (orderData.isDevelopmentMode || orderData.keyId === 'rzp_test_devmode') {
        setPendingDevOrder(orderData);
        setDevModalOpen(true);
        setIsProcessing(false);
        return;
      }

      // 3. Load standard Razorpay script for live/test keys
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        // Fallback to dev modal if script blocked
        setPendingDevOrder(orderData);
        setDevModalOpen(true);
        setIsProcessing(false);
        return;
      }

      // 4. Open Razorpay Standard Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'AI Trip Planner',
        description: 'Professional Plan — Unlimited Trips & Priority AI',
        image: '/logo.svg',
        order_id: orderData.orderId,
        prefill: {
          name: orderData.user?.name || '',
          email: orderData.user?.email || '',
          contact: '9999999999',
        },
        theme: {
          color: '#2563eb',
        },
        handler: async function (response: any) {
          try {
            toast.loading("Verifying payment signature...", { id: "rzp-verify" });

            const verifyRes = await axios.post('/api/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: price,
              isDevelopmentMode: false,
            });

            toast.dismiss("rzp-verify");

            if (verifyRes.data?.success) {
              toast.success("Payment Successful! Plan Activated 🎉");
              setIsPurchased(true);
              router.replace('/payment-success');
            } else {
              toast.error(verifyRes.data?.message || "Signature verification failed");
            }
          } catch (err: any) {
            toast.dismiss("rzp-verify");
            toast.error(err?.response?.data?.message || "Failed to verify payment");
          }
        },
        modal: {
          ondismiss: function () {
            toast("Payment window closed");
            setIsProcessing(false);
          },
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.on('payment.failed', function (resp: any) {
        toast.error(`Payment failed: ${resp.error?.description || "Transaction declined"}`);
        setIsProcessing(false);
      });

      razorpayInstance.open();
    } catch (error: any) {
      toast.dismiss("rzp-init");
      if (error?.response?.status === 401) {
        toast.error("Please log in to upgrade your subscription");
        router.push('/login');
      } else {
        toast.error(error?.response?.data?.message || "Something went wrong initiating payment");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12">
        {/* ── Page Header ── */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" /> Razorpay Secured Payment
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Simple & Transparent <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Pricing</span>
          </h1>

          <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
            Choose the perfect plan to fuel your travels. Upgrade anytime with instant activation powered by Razorpay.
          </p>

          {/* Development Mode Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Razorpay Development & Test Mode Active</span>
          </div>
        </div>

        {/* ── Pricing Cards Grid ── */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* Free Plan */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Basic Tier</span>
                <h2 className="text-2xl font-bold text-slate-900">Explorer (Free)</h2>
                <p className="text-xs text-slate-500">Perfect for occasional weekend getaways and trip ideas.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-slate-900">₹0</span>
                <span className="text-sm font-semibold text-slate-400">/forever</span>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">What&apos;s Included:</p>
                {[
                  "3 AI-generated trip plans per day",
                  "Interactive Map with pinned attractions",
                  "Standard Budget & Packing list estimates",
                  "Booking.com direct flight & hotel links",
                  "Community and standard support",
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <Button
                variant="outline"
                onClick={() => handleRazorpayPayment(0)}
                className="w-full py-6 rounded-2xl font-bold border-slate-200 hover:bg-slate-50 text-slate-700"
              >
                Continue with Free
              </Button>
            </div>
          </div>

          {/* Professional Plan (Razorpay Integrated) */}
          <div className="relative bg-gradient-to-b from-white to-blue-50/50 border-2 border-blue-600 rounded-3xl p-8 shadow-xl flex flex-col justify-between hover:shadow-2xl transition">
            {/* Popular Badge */}
            <div className="absolute -top-3.5 right-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-yellow-300 fill-current" /> Most Popular
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Full Access</span>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <span>Professional</span>
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </h2>
                <p className="text-xs text-slate-500">For avid adventurers who want unlimited freedom & speed.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-slate-900">₹499</span>
                <span className="text-sm font-semibold text-slate-500">/lifetime access</span>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Everything in Free, plus:</p>
                {[
                  "Unlimited AI trip generation (no daily limits)",
                  "Save unlimited trips to your Personal Dashboard",
                  "AI Section Editing (re-generate hotel & day plans)",
                  "1-Click Offline PDF Itinerary downloads",
                  "Instant Booking.com deep links with live pricing",
                  "Priority AI generation speed",
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-slate-800 font-medium">
                    <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Razorpay Supported Payment Methods Badge */}
              <div className="bg-white rounded-2xl p-3.5 border border-blue-100 text-xs text-slate-500 space-y-1.5">
                <span className="font-semibold text-slate-700 block">Accepted Payment Methods:</span>
                <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
                  <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">⚡ UPI (GPay, PhonePe, Paytm)</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">💳 Cards (Visa, Mastercard, RuPay)</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">🏦 NetBanking</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              {isPurchased ? (
                <div className="space-y-2 text-center">
                  <div className="w-full py-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-sm flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Plan Already Active
                  </div>
                  <Button
                    onClick={() => router.push('/dashboard')}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-6 rounded-2xl"
                  >
                    Go to My Dashboard
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => handleRazorpayPayment(499)}
                  disabled={isProcessing}
                  className="w-full py-6 rounded-2xl font-extrabold text-base text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/25 transition transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Processing Razorpay…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>Upgrade to Pro with Razorpay</span>
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ── FAQ Section ── */}
        <div className="max-w-3xl mx-auto pt-8 border-t border-slate-200 space-y-6">
          <h3 className="text-xl font-bold text-center text-slate-900 flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" /> Frequently Asked Questions
          </h3>

          <div className="space-y-4 text-sm">
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-1">Is this a one-time fee or monthly subscription?</h4>
              <p className="text-slate-600 leading-relaxed">
                ₹499 grants you complete lifetime access to all current and upcoming Pro features. No hidden renewal charges.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-1">How does Razorpay payment work?</h4>
              <p className="text-slate-600 leading-relaxed">
                You can pay securely via any Indian UPI app (Google Pay, PhonePe, Paytm), credit/debit cards, or net banking. Transactions are encrypted end-to-end.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-1">How does development mode work?</h4>
              <p className="text-slate-600 leading-relaxed">
                In development mode, you can test the entire payment and fulfillment workflow without spending real money. A simulator modal allows you to test both successful activations and error recovery.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ── Razorpay Development Sandbox Simulator Modal ── */}
      {devModalOpen && pendingDevOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            {/* Modal Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-sm">
                <Zap className="w-7 h-7 fill-current" />
              </div>
              <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-0.5 rounded-full text-xs font-bold text-amber-800">
                Razorpay Test / Dev Sandbox
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Complete Test Transaction
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You are testing in development mode. Simulating this transaction will activate your Pro subscription in the database and unlock all features.
              </p>
            </div>

            {/* Order Details Preview */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Plan:</span>
                <span className="font-bold text-slate-800">Professional Plan</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-mono text-slate-700 truncate max-w-[200px]">{pendingDevOrder.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-bold text-blue-600 text-sm">₹499.00 INR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway:</span>
                <span className="font-semibold text-slate-700">Razorpay (Test / Dev)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <Button
                onClick={() => handleCompleteDevPayment(pendingDevOrder)}
                disabled={isProcessing}
                className="w-full py-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Simulate Payment Success (Dev Mode)
                  </span>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setDevModalOpen(false);
                  setIsProcessing(false);
                  toast("Test payment cancelled");
                }}
                disabled={isProcessing}
                className="w-full py-5 rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel Transaction
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingPage;
