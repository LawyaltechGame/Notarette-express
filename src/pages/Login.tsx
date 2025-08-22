import React from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAppDispatch } from '../hooks/useAppDispatch'
import { loginSuccess } from '../store/slices/userSlice'
import { addToast } from '../store/slices/uiSlice'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { Link, useNavigate } from 'react-router-dom'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

const Login: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock successful login
      const mockUser = {
        id: 'user_123',
        email: data.email,
        name: 'John Doe',
        role: 'customer' as const,
      }
      
      dispatch(loginSuccess({
        user: mockUser,
        token: 'mock_jwt_token',
      }))
      
      dispatch(addToast({
        type: 'success',
        title: 'Login successful!',
        message: 'Welcome back to Notarette Express.',
      }))
      
      navigate('/portal')
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        title: 'Login failed',
        message: 'Invalid email or password. Please try again.',
      }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">NE</span>
            </div>
            <span className="font-bold text-2xl text-gray-900 dark:text-white">
              Notarette Express
            </span>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to access your account and manage your orders
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 dark:border-gray-600 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    Remember me
                  </span>
                </label>
                
                <Link to="/forgot-password" className="text-sm text-teal-600 hover:text-teal-700">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
              >
                Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            {/* Demo Login */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                Demo Account
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const demoCustomer = {
                      id: 'customer_demo',
                      email: 'customer@demo.com',
                      name: 'Demo Customer',
                      role: 'customer' as const,
                    }
                    dispatch(loginSuccess({ user: demoCustomer, token: 'demo_token' }))
                    navigate('/portal')
                  }}
                >
                  Customer Demo
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const demoAdmin = {
                      id: 'admin_demo',
                      email: 'admin@demo.com',
                      name: 'Demo Admin',
                      role: 'admin' as const,
                    }
                    dispatch(loginSuccess({ user: demoAdmin, token: 'demo_token' }))
                    navigate('/admin')
                  }}
                >
                  Admin Demo
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-teal-600 hover:text-teal-700 font-medium">
                  Sign up here
                </Link>
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <Lock className="w-3 h-3" />
            <span>Secured with 256-bit SSL encryption</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login