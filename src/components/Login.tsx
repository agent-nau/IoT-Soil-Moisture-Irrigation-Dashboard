import React, { useState } from 'react';
import { supabase, supabaseConfigured } from '../supabase';
import { Droplets, Lock, Mail, ArrowRight, Loader2, Github } from 'lucide-react';
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
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during Google login');
      setLoading(false);
    }
  };

  const handleDiscordLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during Discord login');
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

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              disabled={loading || !supabaseConfigured}
              onClick={handleGoogleLogin}
              className="bg-white hover:bg-gold-50 disabled:opacity-50 text-gray-900 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-black/20 hover:shadow-gold-500/20 hover:scale-[1.02] border border-transparent hover:border-gold-300"
              title="Sign in with Google"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              <span className="text-sm">Google</span>
            </button>
            
            <button
              type="button"
              disabled={loading || !supabaseConfigured}
              onClick={handleDiscordLogin}
              className="bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-black/20 hover:shadow-[#5865F2]/20 hover:scale-[1.02]"
              title="Sign in with Discord"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.076.076 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.947 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span className="text-sm">Discord</span>
            </button>
          </div>
          
          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-gold-300 hover:text-gold-100 text-sm font-medium transition-colors underline underline-offset-4"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
          
          <p className="text-[10px] text-center text-maroon-300/50 px-4 mt-6">
            By signing in, you agree to the Liceo Moisture Detection System terms of service and privacy policy.
          </p>
        </div>
        
        {/* Footer content */}
        <div className="flex flex-col items-center gap-3 mt-8">
          <a 
            href="https://github.com/agent-nau/IoT-Soil-Moisture-Irrigation-Dashboard" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-maroon-400/70 hover:text-gold-400 transition-colors text-xs font-medium"
          >
            <Github size={14} />
            <span>Public Project</span>
          </a>
          <p className="text-center text-maroon-400/40 text-[10px] uppercase tracking-widest font-bold">
            © 2026 Liceo Moisture Monitor
          </p>
        </div>
      </motion.div>
    </div>
  );
};
