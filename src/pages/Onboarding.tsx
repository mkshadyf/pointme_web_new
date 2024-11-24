import { motion } from 'framer-motion';
import { MapPin, Briefcase, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function Onboarding() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full space-y-8"
      >
        <div className="text-center">
          <MapPin className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to PointMe
          </h2>
          <p className="mt-2 text-gray-600">
            Choose how you want to use our platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/signup/customer">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <User className="mx-auto h-12 w-12 text-blue-600" />
                  <div>
                    <h3 className="text-xl font-semibold">I'm a Customer</h3>
                    <p className="text-gray-600 mt-2">
                      Looking to book services and appointments
                    </p>
                  </div>
                  <Button className="w-full">
                    Sign Up as Customer
                  </Button>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/signup/business">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Briefcase className="mx-auto h-12 w-12 text-blue-600" />
                  <div>
                    <h3 className="text-xl font-semibold">I'm a Business</h3>
                    <p className="text-gray-600 mt-2">
                      Looking to manage my services and appointments
                    </p>
                  </div>
                  <Button className="w-full">
                    Sign Up as Business
                  </Button>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        <p className="text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
} 