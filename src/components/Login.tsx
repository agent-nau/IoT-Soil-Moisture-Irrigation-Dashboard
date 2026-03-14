import React, { useState } from 'react';
import { supabase, supabaseConfigured } from '../supabase';
import { Droplets, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear URL error parameters on load
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorMsg = params.get('error_description') || params.get('error');
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg.replace(/\+/g, ' ')));
      // Clean the URL without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during Google login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-maroon-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-maroon-800/20 rounded-full blur-3xl"></div>
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(120,53,15,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(120,53,15,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative"
      >
        {/* Main card */}
        <div className="bg-gradient-to-br from-maroon-900 via-maroon-800 to-maroon-900 border border-gold-500/30 rounded-3xl p-8 shadow-2xl shadow-black/50">
          <div className="flex flex-col items-center mb-8">
            <div className="w-28 h-28 rounded-2xl flex items-center justify-center mb-4 overflow-hidden">
              <img 
                src="/liceo.png" 
                alt="Liceo Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-3xl font-bold text-gold-400 tracking-tight">LDCU Irrigation System</h1>
            <p className="text-gold-200/70 text-sm mt-1">Soil Moisture Detection System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!supabaseConfigured && (
              <div className="p-3 bg-gold-900/30 border border-gold-500/30 rounded-xl text-gold-200 text-sm text-center">
                ⚠️ Supabase not configured. Add <code className="font-mono text-gold-400">VITE_SUPABASE_URL</code> and <code className="font-mono text-gold-400">VITE_SUPABASE_ANON_KEY</code> to your <code className="font-mono text-gold-400">.env</code> file.
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gold-400 ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-gold-500 to-amber-600 rounded-xl blur opacity-0 group-focus-within:opacity-30 transition-opacity duration-300"></div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-400" size={20} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-maroon-950/80 border border-gold-500/30 rounded-xl py-3 pl-11 pr-4 text-gold-50 placeholder:text-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 transition-all font-sans"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gold-400 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-gold-500 to-amber-600 rounded-xl blur opacity-0 group-focus-within:opacity-30 transition-opacity duration-300"></div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-400" size={20} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-maroon-950/80 border border-gold-500/30 rounded-xl py-3 pl-11 pr-4 text-gold-50 placeholder:text-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 transition-all font-sans"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-950/50 border border-red-800/50 rounded-xl text-red-200 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:via-gold-300 hover:to-gold-400 disabled:opacity-50 text-maroon-950 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold-500/30 hover:shadow-gold-500/50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={22} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gold-500/20"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-maroon-900 px-2 text-gold-500/50 font-bold tracking-widest">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            disabled={loading || !supabaseConfigured}
            onClick={handleGoogleLogin}
            className="w-full bg-white hover:bg-gold-50 disabled:opacity-50 text-gray-900 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40 hover:scale-[1.01]"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>
          
          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-gold-300 hover:text-gold-100 text-sm font-medium transition-colors underline underline-offset-4"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
          
          <p className="text-[10px] text-center text-maroon-300/50 px-4 mt-6">
            By signing in, you agree to the sture Detection System terms of service and privacy policy.
          </p>
        </div>
        
        {/* Footer text */}
        <p className="text-center text-maroon-400/50 text-xs mt-6">
          © 2026 LDCU: Grade 11, ICT 1. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};
