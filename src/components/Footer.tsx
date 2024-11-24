import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-6 w-6 text-primary-600" />
              <span className="text-xl font-semibold">PointMe</span>
            </div>
            <p className="mt-4 text-gray-600">
              Book local services with ease
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Customers</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/services" className="text-gray-600 hover:text-primary-600">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="text-gray-600 hover:text-primary-600">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-gray-600 hover:text-primary-600">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Businesses</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/signup/business" className="text-gray-600 hover:text-primary-600">
                  List Your Business
                </Link>
              </li>
              <li>
                <Link to="/business" className="text-gray-600 hover:text-primary-600">
                  Business Dashboard
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 hover:text-primary-600">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-primary-600">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-primary-600">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-primary-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-primary-600">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} PointMe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 