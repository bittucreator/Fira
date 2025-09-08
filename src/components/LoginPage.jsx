import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Sparkles, 
  Brain, 
  Zap, 
  Shield, 
  ArrowRight,
  Github,
  Mail,
  Eye,
  EyeOff
} from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const { error } = isSignUp 
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;
    } catch (error) {
      console.error('Auth error:', error);
      alert(error.message);
    }
    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Google auth error:', error);
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements with Notion colors */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-5 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-gray-400 to-slate-500 rounded-full opacity-5 animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Side - Hero Content */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <img 
                  src="/Logo.svg" 
                  alt="Fira AI" 
                  className="w-12 h-12"
                  style={{ 
                    filter: darkMode ? 'brightness(0) saturate(100%) invert(100%)' : 'none' 
                  }}
                />
              </div>
              <h1 className="text-3xl font-bold notion-text">
                Fira AI
              </h1>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold notion-title leading-tight">
              Your intelligent
              <span className="block text-blue-600">
                writing companion
              </span>
            </h2>
            
            <p className="text-xl notion-subtext leading-relaxed max-w-lg">
              Transform your thoughts into powerful content with AI assistance. 
              Write, edit, and enhance your notes like never before.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: 'AI-Powered',
                description: 'Smart suggestions and content enhancement',
                color: 'from-blue-500 to-indigo-600'
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Instant sync across all your devices',
                color: 'from-yellow-500 to-orange-500'
              },
              {
                icon: Shield,
                title: 'Secure',
                description: 'Your data is encrypted and private',
                color: 'from-green-500 to-emerald-600'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center space-y-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto shadow-md" 
                     style={{ 
                       backgroundColor: index === 0 ? '#1d1d1f' : index === 1 ? '#1d1d1f' : '#1d1d1f' 
                     }}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold notion-text">{feature.title}</h3>
                <p className="text-sm notion-subtext leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex justify-center lg:justify-end">
          <Card className="w-full max-w-md shadow-xl border border-gray-200 bg-white">
            <CardHeader className="space-y-4 pb-6">
              <div className="text-center">
                <CardTitle className="text-2xl font-bold notion-text">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </CardTitle>
                <CardDescription className="notion-subtext mt-2">
                  {isSignUp 
                    ? 'Start your journey with AI-powered note-taking' 
                    : 'Sign in to continue to your notes'
                  }
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Google Sign In */}
              <Button
                onClick={handleGoogleAuth}
                disabled={loading}
                variant="outline"
                className="w-full h-12 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 notion-transition"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="notion-text">Continue with Google</span>
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white notion-subtext">Or continue with email</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium notion-text">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 notion-input"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium notion-text">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 h-12 notion-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 notion-transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 notion-button font-medium notion-transition shadow-sm"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium notion-transition"
                >
                  {isSignUp 
                    ? 'Already have an account? Sign in' 
                    : "Don't have an account? Sign up"
                  }
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
