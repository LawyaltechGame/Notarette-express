import React, { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { appwriteAccount } from '../lib/appwrite'
import PageBackground from '../components/layout/PageBackground'

const ResetPassword: React.FC = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const userId = useMemo(() => params.get('userId') || params.get('user_id') || '', [params])
  const secret = useMemo(() => params.get('secret') || '', [params])

  const canSubmit = userId && secret && password.length >= 8 && password === confirm && !isSubmitting

  return (
    <PageBackground>
      <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
        <Card>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Reset password</h1>
          {!userId || !secret ? (
            <p className="text-sm text-red-600 dark:text-red-400">Invalid or expired reset link.</p>
          ) : (
            <div className="space-y-4">
              {errorMsg && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded px-3 py-2">{errorMsg}</div>
              )}
              {successMsg && (
                <div className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded px-3 py-2">{successMsg}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button
                type="button"
                variant="primary"
                className="w-full"
                disabled={!canSubmit}
                onClick={async () => {
                  if (!canSubmit) return
                  setIsSubmitting(true)
                  setErrorMsg(null)
                  setSuccessMsg(null)
                  try {
                    await appwriteAccount.updateRecovery(userId, secret, password)
                    setSuccessMsg('Password updated. You can now sign in.')
                    setTimeout(() => navigate('/login', { replace: true }), 1200)
                  } catch (e: any) {
                    const code = Number(e?.code || e?.response?.status)
                    const msg = String(e?.message || '').toLowerCase()
                    if (code === 429 || msg.includes('rate limit')) {
                      setErrorMsg('Too many attempts. Please wait a moment and try again.')
                    } else if (msg.includes('invalid secret') || msg.includes('expired')) {
                      setErrorMsg('Reset link expired or invalid. Please request a new one.')
                    } else {
                      setErrorMsg('Failed to reset password. Please try again.')
                    }
                  } finally {
                    setIsSubmitting(false)
                  }
                }}
              >
                {isSubmitting ? 'Updating…' : 'Update password'}
              </Button>
            </div>
          )}
        </Card>
        </div>
      </div>
    </PageBackground>
  )
}

export default ResetPassword


