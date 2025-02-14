'use client'

import { motion } from 'framer-motion'
import { Package, ShoppingCart, Truck, CheckCircle } from 'lucide-react'

const steps = [
  {
    title: 'Choose Your Service',
    description: 'Select between direct shipping or Buy4Me service based on your needs',
    icon: Package,
    color: 'bg-blue-500',
  },
  {
    title: 'Place Your Order',
    description: 'Provide shipping details or shopping links for your desired items',
    icon: ShoppingCart,
    color: 'bg-green-500',
  },
  {
    title: 'We Process & Ship',
    description: 'We handle the purchase, consolidation, and shipping of your items',
    icon: Truck,
    color: 'bg-purple-500',
  },
  {
    title: 'Delivery',
    description: 'Receive your package at your doorstep with real-time tracking',
    icon: CheckCircle,
    color: 'bg-red-500',
  },
]

export function HowItWorks() {
  return (
    <section className="py-24 bg-gray-50" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Simple steps to get your packages delivered worldwide
          </p>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 hidden md:block" />

          <div className="grid grid-cols-1 gap-12 md:grid-cols-4 relative">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-full ${step.color} flex items-center justify-center mb-6 relative z-10 bg-white border-4 border-white`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}