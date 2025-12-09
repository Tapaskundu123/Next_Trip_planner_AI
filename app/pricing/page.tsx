'use client'

import Header from '@/_components/Header'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

const Page = () => {
  const router = useRouter()
  const hasChecked = useRef(false)

  useEffect(() => {
    if (hasChecked.current) return
    hasChecked.current = true

    const handlePrice = async () => {
      try {
        const res = await axios.get('/api/checkIsPurchased')

        if (res.data.isPurchased) {
          toast.success("You already purchased ✅")
          router.replace('/')  // ✅ better than push
        }
      } catch (error) {
        console.error(error)
      }
    }

    handlePrice()
  }, [])

  const handlePricing = async (price: number) => {
    try {
      const res = await axios.post('/api/price', {
        pricing: price,
      })

      if (res.status === 200) {
        toast.success("Successfully purchased 🎉")
        router.replace('/') // ✅ prevent extra mount
      }
    } catch (error) {
      toast.error("Something went wrong")
      console.error(error)
    }
  }

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold">Simple & Affordable Pricing</h1>
          <p className="text-gray-500 mt-2">
            Choose a plan that fits your needs
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="border rounded-xl p-6 bg-white shadow-sm">
            <h2 className="text-xl font-semibold">Free</h2>
            <p className="text-3xl font-bold mt-4">$0</p>

            <ul className="mt-4 space-y-2 text-gray-600">
              <li>✅ Basic features</li>
              <li>✅ Limited API calls (3 daily)</li>
              <li>✅ Community support</li>
            </ul>

            <button
              onClick={() => handlePricing(0)}
              className="mt-6 w-full bg-gray-900 text-white py-2 rounded-lg"
            >
              Get Started
            </button>
          </div>

          {/* Professional Plan */}
          <div className="border rounded-xl p-6 bg-white shadow-md">
            <h2 className="text-xl font-semibold">Professional</h2>
            <p className="text-3xl font-bold mt-4">
              ₹499<span className="text-base">/month</span>
            </p>

            <ul className="mt-4 space-y-2 text-gray-600">
              <li>✅ All Free features</li>
              <li>✅ Unlimited API calls</li>
              <li>✅ Priority support</li>
              <li>✅ Advanced analytics</li>
            </ul>

            <button
              onClick={() => handlePricing(499)}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Page
