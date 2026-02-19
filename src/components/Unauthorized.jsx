import React from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <AlertTriangle className="h-16 w-16 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>

        <p className="text-gray-600 mb-8">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>

        <div className="space-y-4">
          <Link
            to="/"
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Go to Homepage
          </Link>

          <Link
            to="/login"
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Login as Different User
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Unauthorized