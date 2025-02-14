'use client'

import { motion } from 'framer-motion'
import { Package, ShoppingBag, Truck, Clock, Globe, CreditCard } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const services = [
  {
    title: 'International Shipping',
    description: 'Fast and reliable shipping services to over 100+ countries worldwide',
    icon: Globe,
    color: 'text-blue-500',
  },
  {
    title: 'Buy4Me Service',
    description: 'We help you purchase items from your favorite stores and ship them to you',
    icon: ShoppingBag,
    color: 'text-green-500',
  },
  {
    title: 'Express Delivery',
    description: 'Priority shipping options for time-sensitive deliveries',
    icon: Truck,
    color: 'text-red-500',
  },
  {
    title: 'Real-time Tracking',
    description: 'Track your shipments 24/7 with our advanced tracking system',
    icon: Clock,
    color: 'text-purple-500',
  },
  {
    title: 'Consolidation',
    description: 'Combine multiple packages into one shipment to save on shipping costs',
    icon: Package,
    color: 'text-orange-500',
  },
  {
    title: 'Secure Payment',
    description: 'Multiple payment options with secure transaction processing',
    icon: CreditCard,
    color: 'text-indigo-500',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export function ServicesOverview() {
  return (
    <section className="py-24 bg-gray-50" id="services">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Our Services
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Comprehensive logistics and shopping solutions tailored to your needs
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <motion.div key={service.title} variants={itemVariants}>
                <Card className="h-full transition-transform duration-300 hover:scale-105">
                  <CardHeader>
                    <Icon className={`h-8 w-8 ${service.color}`} />
                    <CardTitle className="mt-4">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Add more content or features specific to each service */}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}