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
import { APP_BASE_URL } from '../lib/constant'
import { addToast } from '../store/slices/uiSlice'

const Authentication = () => {
  const [loggedInUser, setLoggedInUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [mode, setMode] = useState<'signup' | 'signin'>('signup')

  useEffect(() => {
    if (location.pathname === '/login') setMode('signin')
    if (location.pathname === '/register') setMode('signup')
  }, [location.pathname])

  async function login(email: string, password: string) {
    console.log('[Login] Submitted credentials:', { email, password });
    if (isSubmitting) return
    setErrorMsg(null)
    setIsSubmitting(true)

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
        setIsSubmitting(false); 
        return;
      }
      // Graceful 429 handling and generic error mapping
      const code = Number(err?.code || err?.response?.status || 0)
      if (code === 429 || message.includes('rate limit')) {
        setErrorMsg('Too many login attempts. Please wait a moment and try again.')
      } else if (message.includes('invalid credentials')) {
        setErrorMsg('Invalid email or password. Please try again.')
      } else {
        setErrorMsg('Unable to sign in right now. Please try again later.')
      }
      setIsSubmitting(false)
      return;
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
    setIsSubmitting(false)
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
            {/* <img
              src={LOGO_URL}
              alt="Notarette Express"
              className="h-10 w-auto"
              loading="eager"
              decoding="async"
            /> */}
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
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                {mode === 'signin' && (
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      className="text-xs text-primary-600 hover:text-primary-700"
                      onClick={async () => {
                        if (!email) { setErrorMsg('Please enter your email first.'); return }
                        try {
                          setIsSubmitting(true)
                          setErrorMsg(null)
                          const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
                          const redirect = isLocal
                            ? `${window.location.origin}/reset-password`
                            : `${APP_BASE_URL}/reset-password`
                          await appwriteAccount.createRecovery(email, redirect)
                          dispatch(addToast({
                            type: 'success',
                            title: 'Reset email sent',
                            message: 'Check your inbox and spam folder. If not found, check Promotions/Updates.'
                          }))
                        } catch (e: any) {
                          const code = Number(e?.code || e?.response?.status)
                          const msg = String(e?.message || '').toLowerCase()
                          if (code === 429 || msg.includes('rate limit')) {
                            setErrorMsg('Too many attempts. Please wait a moment and try again.')
                          } else {
                            setErrorMsg('Unable to send reset email right now. Please try again later.')
                          }
                        } finally {
                          setIsSubmitting(false)
                        }
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {errorMsg && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded px-3 py-2">
                    {errorMsg}
                  </div>
                )}
                {mode === 'signup' ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                    onClick={async () => {
                      console.log('[Register] Submitted credentials:', { name, email, password });
                      if (isSubmitting) return
                      setErrorMsg(null)
                      setIsSubmitting(true)
                      try {
                        await appwriteAccount.create(ID.unique(), email, password, name);
                        await login(email, password);
                      } catch (e: any) {
                        const message = String(e?.message || '').toLowerCase()
                        if (Number(e?.code || e?.response?.status) === 429 || message.includes('rate limit')) {
                          setErrorMsg('Too many attempts. Please wait a moment and try again.')
                        } else {
                          setErrorMsg('Unable to create account right now. Please try again later.')
                        }
                        setIsSubmitting(false)
                      }
                    }}
                  >
                    {isSubmitting ? 'Please wait…' : 'Create Account'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                    onClick={() => login(email, password)}
                  >
                    {isSubmitting ? 'Signing in…' : 'Sign In'}
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
                        className="text-primary-600 hover:text-primary-700 font-medium"
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
                        className="text-primary-600 hover:text-primary-700 font-medium"
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


