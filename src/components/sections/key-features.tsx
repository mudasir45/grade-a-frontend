'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Shield, Clock, Globe, DollarSign } from 'lucide-react'

const features = [
  {
    name: 'Secure Shipping',
    description: 'Your packages are fully insured and handled with care throughout the journey.',
    icon: Shield,
    value: '100%',
    suffix: '',
  },
  {
    name: 'Fast Delivery',
    description: 'Express shipping options available for urgent deliveries.',
    icon: Clock,
    value: '2-5',
    suffix: ' Days',
  },
  {
    name: 'Global Coverage',
    description: 'Shipping services available to and from countries worldwide.',
    icon: Globe,
    value: '100+',
    suffix: ' Countries',
  },
  {
    name: 'Cost Effective',
    description: 'Competitive rates with no hidden fees.',
    icon: DollarSign,
    value: '30%',
    suffix: ' Savings',
  },
]

export function KeyFeatures() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="py-24 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Why Choose RedBox Express?
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            We provide reliable, efficient, and cost-effective logistics solutions
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <feature.icon className="h-8 w-8 text-red-600" aria-hidden="true" />
              </div>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                className="mt-6 text-2xl font-semibold tracking-tight text-gray-900"
              >
                {feature.value}{feature.suffix}
              </motion.h3>
              <h4 className="text-base font-semibold leading-7 text-gray-900">{feature.name}</h4>
              <p className="mt-2 text-sm leading-7 text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}