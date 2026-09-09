'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Home, Sparkles, Zap, Shield, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function PaymentSuccessPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const checkIsPurchased= async () => {
            const res= await axios.get('/api/checkIsPurchased');
            const {isPurchased}= res.data;
            if(!isPurchased){
                toast.error("payment filed or doesn't found");
                router.push('/pricing');
                return;
            }
            return;
        }
        checkIsPurchased();
        setMounted(true);

        // Trigger confetti animation
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;

        const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        };

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'],
            });

            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'],
            });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    const benefits = [
        {
            icon: <Zap className="w-6 h-6 text-yellow-500" />,
            title: "Unlimited Trip Planning",
            description: "Create as many trips as you want with AI assistance"
        },
        {
            icon: <Sparkles className="w-6 h-6 text-purple-500" />,
            title: "Premium AI Features",
            description: "Access advanced AI capabilities for better recommendations"
        },
        {
            icon: <Shield className="w-6 h-6 text-blue-500" />,
            title: "Priority Support",
            description: "Get help whenever you need with dedicated support"
        },
        {
            icon: <Crown className="w-6 h-6 text-amber-500" />,
            title: "Exclusive Perks",
            description: "Early access to new features and special offers"
        },
    ];

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Success Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
                    {/* Success Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                            <div className="relative bg-gradient-to-br from-green-400 to-emerald-500 rounded-full p-6">
                                <CheckCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>

                    {/* Success Message */}
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Welcome to Premium! 🎉
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Your payment was successful. You're now a premium member!
                    </p>

                    {/* Premium Badge */}
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-3 rounded-full font-bold text-lg mb-10 shadow-lg">
                        <Crown className="w-5 h-5" />
                        Premium Member
                    </div>

                    {/* Benefits Grid */}
                    <div className="grid md:grid-cols-2 gap-6 mb-10">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 text-left hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="bg-white rounded-xl p-3 shadow-sm">
                                        {benefit.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">
                                            {benefit.title}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {benefit.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Call to Action */}
                    <div className="space-y-4">
                        <Button
                            onClick={() => router.push('/')}
                            size="lg"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                            <Home className="w-5 h-5 mr-2" />
                            Start Planning Your Next Trip
                        </Button>

                        <p className="text-sm text-gray-500">
                            Need help? <a href="/contact-us" className="text-blue-600 hover:underline font-medium">Contact our support team</a>
                        </p>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="text-center text-gray-600 mt-8 text-sm">
                    You'll receive a confirmation email shortly with your receipt.
                </p>
            </div>
        </div>
    );
}