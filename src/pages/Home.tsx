import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <div className="space-y-16">
      <motion.section 
        className="text-center space-y-8"
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        <motion.h1 
          className="text-5xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
          variants={fadeIn}
        >
          Book Services with Confidence
        </motion.h1>
        <motion.p 
          className="text-xl text-gray-600 max-w-2xl mx-auto"
          variants={fadeIn}
        >
          Streamline your scheduling experience with our intuitive booking platform.
          Connect with service providers and manage appointments effortlessly.
        </motion.p>
        <motion.div variants={fadeIn}>
          <Button asChild size="lg">
            <Link to="/services" className="group">
              Browse Services
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </motion.section>

      <motion.section 
        className="grid md:grid-cols-3 gap-8"
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        {[
          {
            icon: Calendar,
            title: 'Easy Scheduling',
            description: 'Book appointments with just a few clicks. View real-time availability and confirm instantly.'
          },
          {
            icon: Clock,
            title: 'Time Management',
            description: 'Manage your bookings efficiently with automated reminders and easy rescheduling options.'
          },
          {
            icon: Shield,
            title: 'Secure Platform',
            description: 'Your data is protected with enterprise-grade security. Book with confidence.'
          }
        ].map((feature, index) => (
          <motion.div key={index} variants={fadeIn}>
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader>
                <feature.icon className="w-10 h-10 text-blue-600" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.section>

      <motion.section 
        className="space-y-8"
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        <motion.div 
          className="flex items-center justify-between"
          variants={fadeIn}
        >
          <h2 className="text-3xl font-bold text-gray-900">Popular Services</h2>
          <Button variant="ghost" asChild>
            <Link to="/services" className="group">
              View all
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Haircut & Styling',
              image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
              price: '$45'
            },
            {
              title: 'Massage Therapy',
              image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
              price: '$75'
            },
            {
              title: 'Personal Training',
              image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
              price: '$60'
            }
          ].map((service, index) => (
            <motion.div 
              key={index}
              variants={fadeIn}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-6">
                  <CardTitle className="mb-2">{service.title}</CardTitle>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-semibold">{service.price}</span>
                    <Button variant="ghost" asChild>
                      <Link to="/services" className="group">
                        Book Now
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}