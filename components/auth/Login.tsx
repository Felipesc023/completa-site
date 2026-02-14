import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

type AuthMode = 'login' | 'register';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword, error: authError } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  const toggleMode = (newMode: AuthMode) => {
    setMode(newMode);
    setLocalError('');
    setSuccessMessage('');
    setShowForgotPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');
    setLoading(true);

    let success = false;

    if (showForgotPassword) {
      if (!email) {
        setLocalError('Digite seu e-mail para recuperar a senha.');
        setLoading(false);
        return;
      }
      success = await resetPassword(email);
      if (success) {
        setSuccessMessage('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
        setShowForgotPassword(false);
        setMode('login');
      } else {
        setLocalError(authError || 'Erro ao enviar e-mail.');
      }
      setLoading(false);
      return;
    }

    if (mode === 'login') {
      success = await loginWithEmail(email, password);
    } else {
      // Validations for Register
      if (password !== confirmPassword) {
        setLocalError('As senhas não coincidem.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setLocalError('A senha deve ter pelo menos 6 caracteres.');
        setLoading(false);
        return;
      }
      success = await registerWithEmail(name, email, password);
    }

    setLoading(false);
    if (success) {
      navigate('/');
    } else if (!showForgotPassword) {
      setLocalError(authError || 'Ocorreu um erro. Verifique seus dados.');
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError('');
    setLoading(true);
    const success = await loginWithGoogle();
    if (success) {
      navigate('/');
    } else {
      setLocalError('Falha ao conectar com Google.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-offwhite flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative font-sans">
       
       {/* Background Decoration Subtle */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-40">
          <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-brand-gold/5 blur-[80px]"></div>
          <div className="absolute bottom-[0%] left-[0%] w-[40%] h-[40%] rounded-full bg-brand-brown/5 blur-[60px]"></div>
       </div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-stone-100 z-10 relative overflow-hidden">
        
        {/* Header Clean */}
        <div className="px-8 pt-8 pb-4 relative">
          <Link to="/" className="absolute left-6 top-6 text-stone-400 hover:text-brand-dark transition-colors" title="Voltar para a loja">
            <ArrowLeft size={20} />
          </Link>
          <h2 className="text-2xl font-serif text-brand-dark text-center font-medium">
            {showForgotPassword ? 'Recuperar Senha' : (mode === 'login' ? 'Entrar' : 'Criar Conta')}
          </h2>
          <p className="text-center text-xs text-stone-400 mt-1 uppercase tracking-widest">
            {showForgotPassword ? 'Digite seu e-mail abaixo' : (mode === 'login' ? 'Bem-vinda de volta' : 'Preencha seus dados')}
          </p>
        </div>

        {/* Tabs */}
        {!showForgotPassword && (
          <div className="flex border-b border-stone-100">
            <button 
              onClick={() => toggleMode('login')}
              className={`flex-1 py-4 text-sm font-medium transition-colors relative ${mode === 'login' ? 'text-brand-dark' : 'text-stone-400 hover:text-stone-600'}`}
            >
              Entrar
              {mode === 'login' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-gold"></div>}
            </button>
            <button 
              onClick={() => toggleMode('register')}
              className={`flex-1 py-4 text-sm font-medium transition-colors relative ${mode === 'register' ? 'text-brand-dark' : 'text-stone-400 hover:text-stone-600'}`}
            >
              Cadastrar
              {mode === 'register' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-gold"></div>}
            </button>
          </div>
        )}

        <div className="p-8">
          
          {/* Google Button - Always visible unless recovering password */}
          {!showForgotPassword && (
            <>
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-stone-200 rounded-lg bg-white text-stone-600 hover:bg-stone-50 hover:border-brand-gold transition-all duration-300 shadow-sm group"
              >
                {loading && !email ? (
                    <div className="w-5 h-5 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                )}
                <span className="text-sm font-medium group-hover:text-brand-dark">Continuar com Google</span>
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-2 bg-white text-stone-400">ou</span>
                </div>
              </div>
            </>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Register: Name Field */}
            {mode === 'register' && !showForgotPassword && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-stone-400" />
                </div>
                <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 bg-stone-50 border border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand-gold/50 focus:border-brand-gold/50 transition-all text-brand-dark placeholder-stone-400"
                    placeholder="Nome Completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            {/* Email Field */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-stone-400" />
                </div>
                <input
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 bg-stone-50 border border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand-gold/50 focus:border-brand-gold/50 transition-all text-brand-dark placeholder-stone-400"
                    placeholder="Seu e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            {/* Password Fields */}
            {!showForgotPassword && (
                <>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-stone-400" />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            className="block w-full pl-10 pr-10 py-3 bg-stone-50 border border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand-gold/50 focus:border-brand-gold/50 transition-all text-brand-dark placeholder-stone-400"
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {mode === 'register' && (
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-stone-400" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="block w-full pl-10 pr-3 py-3 bg-stone-50 border border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand-gold/50 focus:border-brand-gold/50 transition-all text-brand-dark placeholder-stone-400"
                                placeholder="Confirmar Senha"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    )}
                </>
            )}

            {/* Forgot Password Link */}
            {!showForgotPassword && mode === 'login' && (
                <div className="flex justify-end">
                    <button 
                        type="button" 
                        onClick={() => { setShowForgotPassword(true); setLocalError(''); setSuccessMessage(''); }}
                        className="text-xs text-brand-gold hover:text-brand-brown hover:underline transition-colors"
                    >
                        Esqueci minha senha
                    </button>
                </div>
            )}

            {/* Messages */}
            {(localError || authError) && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-500 text-xs text-center animate-fade-in">
                    {localError || authError}
                </div>
            )}
            
            {successMessage && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-green-600 text-xs text-center animate-fade-in">
                    {successMessage}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-xs font-bold uppercase tracking-[0.15em] rounded-lg text-white bg-brand-brown hover:bg-brand-gold focus:outline-none shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
                {loading && email ? 'Processando...' : (
                    showForgotPassword ? 'Enviar E-mail' : (mode === 'login' ? 'Entrar' : 'Criar Conta')
                )}
            </button>
            
            {showForgotPassword && (
                 <button 
                    type="button"
                    onClick={() => { setShowForgotPassword(false); setLocalError(''); setSuccessMessage(''); }}
                    className="w-full text-center text-xs text-stone-500 hover:text-brand-dark mt-4"
                >
                    Voltar para Login
                </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};