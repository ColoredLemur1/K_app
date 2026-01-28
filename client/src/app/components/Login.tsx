import { Camera, Mail, Lock } from 'lucide-react';

interface LoginProps {
  onNavigate: (page: string) => void;
}

export function Login({ onNavigate }: LoginProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-400 rounded-full mb-4">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl text-emerald-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Login to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form className="space-y-6">
            <div>
              <label htmlFor="login-email" className="block text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="login-email"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="login-password"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-emerald-400 rounded focus:ring-emerald-400" />
                <span className="text-gray-700 text-sm">Remember me</span>
              </label>
              <button type="button" className="text-emerald-600 text-sm hover:text-emerald-700">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-400 text-white rounded-lg hover:bg-emerald-500 transition-colors"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <button className="text-emerald-600 hover:text-emerald-700">
                Sign up
              </button>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => onNavigate('home')}
            className="text-emerald-600 hover:text-emerald-700"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
