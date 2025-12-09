'use client'

import Header from '@/_components/Header'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { Send, CheckCircle, AlertCircle, Mail, MessageSquare, User } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.name.trim()) return toast.error('Please enter your name')
    if (!formData.email.trim()) return toast.error('Please enter your email')
    if (!formData.email.includes('@')) return toast.error('Please enter a valid email')
    if (!formData.message.trim()) return toast.error('Please write your message')
    if (formData.message.length < 10) return toast.error('Message should be at least 10 characters')

    setIsSubmitting(true)

    try {
      await axios.post('/api/contact', formData)

      toast.success('Thank you! Your message has been sent successfully 🎉 We\'ll reply within 24 hours.')
      
      // Reset form
      setFormData({ name: '', email: '', message: '' })
    } catch (error: any) {
      console.error('Contact form error:', error)
      toast.error(
        error?.response?.data?.message || 
        'Failed to send message. Please try again later.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have a question? Need help with anything? We're here to help you 24/7.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-blue-600" />
                Send us a message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <User className="w-5 h-5" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <Mail className="w-5 h-5" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <MessageSquare className="w-5 h-5" />
                    Your Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Hi! I'd like to know more about..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all resize-none"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-3 transition-all transform hover:scale-105 ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Info & Support */}
            <div className="space-y-8">
              {/* Support Card */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold mb-4">We're Here to Help</h3>
                <p className="text-blue-100 leading-relaxed">
                  Our team typically responds within <strong className="text-white">2–4 hours</strong> during business days 
                  and within <strong className="text-white">24 hours</strong> on weekends.
                </p>
              </div>

              {/* Quick Contact Info */}
              <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-7 h-7 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Response Time</h4>
                    <p className="text-gray-600">Usually under 4 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Email Us</h4>
                    <p className="text-gray-600">tapaskundu3762@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-7 h-7 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Having Issues?</h4>
                    <p className="text-gray-600">Describe your problem clearly and we'll fix it fast!</p>
                  </div>
                </div>
              </div>

              <div className="text-center text-gray-500 text-sm">
                <p>We read every single message 💙</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}