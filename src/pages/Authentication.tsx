import  { useEffect, useState } from 'react';
import { motion } from 'framer-motion'
import type { Models } from 'appwrite';
import { appwriteAccount , ID} from '../lib/appwrite';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { loginSuccess } from '../store/slices/userSlice';
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Mail, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react'
import { LOGO_URL } from '../lib/constant'

const Authentication = () => {
  const [loggedInUser, setLoggedInUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState<'signup' | 'signin'>('signup')

  useEffect(() => {
    if (location.pathname === '/login') setMode('signin')
    if (location.pathname === '/register') setMode('signup')
  }, [location.pathname])

  async function login(email: string, password: string) {
    console.log('[Login] Submitted credentials:', { email, password });

    // If a session is already active, reuse it
    try {
      const existing = await appwriteAccount.get();
      if (existing) {
        setLoggedInUser(existing);
        const [firstName = '', lastName = ''] = (existing.name ?? '').split(' ');
        dispatch(loginSuccess({
          user: {
            uid: existing.$id,
            email: existing.email ?? null,
            firstName,
            lastName,
            phone: '',
          },
        }));
        navigate('/services', { replace: true });
        return;
      }
    } catch {}

    // No active session: create one
    try {
      await appwriteAccount.createEmailPasswordSession(email, password);
    } catch (err: any) {
      const message = String(err?.message || '').toLowerCase();
      if (message.includes('session is active')) {
        const profile = await appwriteAccount.get();
        setLoggedInUser(profile);
        const [firstName = '', lastName = ''] = (profile.name ?? '').split(' ');
        dispatch(loginSuccess({
          user: {
            uid: profile.$id,
            email: profile.email ?? null,
            firstName,
            lastName,
            phone: '',
          },
        }));
        navigate('/services', { replace: true });
        return;
      }
      throw err;
    }

    const profile = await appwriteAccount.get();
    setLoggedInUser(profile);
    const [firstName = '', lastName = ''] = (profile.name ?? '').split(' ');
    dispatch(loginSuccess({
      user: {
        uid: profile.$id,
        email: profile.email ?? null,
        firstName,
        lastName,
        phone: '',
      },
    }));
    navigate('/services', { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/services" className="flex items-center justify-center space-x-2 mb-6">
            <img
              src={LOGO_URL}
              alt="Notarette Express"
              className="h-10 w-auto"
              loading="eager"
              decoding="async"
            />
            <span className="brand-font font-semibold text-2xl text-gray-900 dark:text-white">
              Notarette Express
            </span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {mode === 'signup' ? 'Sign up to access our notarization services' : 'Sign in to access your account and manage your orders'}
          </p>
          {loggedInUser && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Logged in as {loggedInUser.name ?? ''}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <div className="space-y-6">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
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
              </div>

              <div className="space-y-3">
                {mode === 'signup' ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={async () => {
                      console.log('[Register] Submitted credentials:', { name, email, password });
                      await appwriteAccount.create(ID.unique(), email, password, name);
                      login(email, password);
                    }}
                  >
                    Create Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => login(email, password)}
                  >
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}

                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  {mode === 'signup' ? (
                    <span>
                      Have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setMode('signin')}
                        className="text-teal-600 hover:text-teal-700 font-medium"
                      >
                        Sign in here
                      </button>
                    </span>
                  ) : (
                    <span>
                      New here?{' '}
                      <button
                        type="button"
                        onClick={() => setMode('signup')}
                        className="text-teal-600 hover:text-teal-700 font-medium"
                      >
                        Create an account
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <Lock className="w-3 h-3" />
            <span>Secured Authentication</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Authentication;


