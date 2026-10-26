import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  Phone,
  Mail,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  Smartphone,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface CustomerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA / Canada', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
];

export const CustomerLoginModal: React.FC<CustomerLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginWithOtp, signInWithGoogle, signInAsAdmin } = useAuth();

  const [channel, setChannel] = useState<'sms' | 'email'>('sms');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  // Step state: 'input' | 'otp' | 'success'
  const [step, setStep] = useState<'input' | 'otp' | 'success'>('input');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isOtpShaking, setIsOtpShaking] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [serverSimulatedOtp, setServerSimulatedOtp] = useState<string | null>(null);
  const [verifiedCustomerName, setVerifiedCustomerName] = useState<string>('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for resending OTP
  useEffect(() => {
    let timer: any;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Focus first digit box when transitioning to OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  if (!isOpen) return null;

  const currentIdentifier = channel === 'sms'
    ? `${selectedCountry.code} ${phoneInput.trim()}`
    : emailInput.trim();

  // Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (channel === 'sms') {
      const cleanDigits = phoneInput.replace(/\D/g, '');
      if (cleanDigits.length < 8) {
        setErrorMsg('Please enter a valid mobile number (at least 8-10 digits)');
        return;
      }
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
        setErrorMsg('Please enter a valid email address');
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: currentIdentifier,
          channel,
          name: nameInput.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to dispatch verification code');
        setLoading(false);
        return;
      }

      setServerSimulatedOtp(data.otpPreview);
      setStep('otp');
      setCountdown(data.cooldownSeconds || 25);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
    } catch (err: any) {
      console.warn('Send OTP network error:', err);
      // Client-side fallback if server offline
      const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
      setServerSimulatedOtp(mockCode);
      setStep('otp');
      setCountdown(25);
      setCanResend(false);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const fullOtp = codeToVerify || otpDigits.join('');
    if (fullOtp.length !== 6) {
      setErrorMsg('Please enter all 6 digits of your OTP');
      triggerShake();
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: currentIdentifier,
          otp: fullOtp,
          channel,
          name: nameInput.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Incorrect OTP code');
        triggerShake();
        setLoading(false);
        return;
      }

      // Success!
      setVerifiedCustomerName(data.user?.displayName || 'Customer');
      setStep('success');

      // Update auth context
      loginWithOtp({
        uid: data.user.uid,
        displayName: data.user.displayName,
        email: data.user.email,
        photoURL: data.user.photoURL,
        role: 'customer',
      });

      // Auto-dismiss after celebration
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        // Reset state for next time
        setStep('input');
        setOtpDigits(['', '', '', '', '', '']);
      }, 1800);
    } catch {
      // Offline verification fallback against simulated preview
      if (serverSimulatedOtp && fullOtp === serverSimulatedOtp) {
        setVerifiedCustomerName(nameInput || 'Customer');
        setStep('success');
        loginWithOtp({
          uid: `usr_offline_${Date.now()}`,
          displayName: nameInput || 'FoodInside Customer',
          email: channel === 'email' ? currentIdentifier : 'customer@foodinside.app',
          photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
          role: 'customer',
        });
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
          setStep('input');
        }, 1800);
      } else {
        setErrorMsg('Invalid code. Please try again.');
        triggerShake();
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: currentIdentifier,
          channel,
          name: nameInput.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setServerSimulatedOtp(data.otpPreview);
        setCountdown(data.cooldownSeconds || 25);
        setCanResend(false);
        setOtpDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setErrorMsg(data.error || 'Could not resend OTP');
      }
    } catch {
      const newMock = Math.floor(100000 + Math.random() * 900000).toString();
      setServerSimulatedOtp(newMock);
      setCountdown(25);
      setCanResend(false);
    } finally {
      setLoading(false);
    }
  };

  // Shake animation on error
  const triggerShake = () => {
    setIsOtpShaking(true);
    setTimeout(() => setIsOtpShaking(false), 450);
  };

  // Single digit input handler
  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1); // Only take last typed character
    if (char && !/^\d$/.test(char)) return; // Only allow digits

    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);
    setErrorMsg(null);

    // If digit entered, advance to next box
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all 6 digits entered, auto-verify
    if (char && index === 5 && newDigits.every(d => d !== '')) {
      handleVerifyOtp(newDigits.join(''));
    }
  };

  // Backspace & arrow keys navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        // Move back to previous box and clear it
        const newDigits = [...otpDigits];
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...otpDigits];
        newDigits[index] = '';
        setOtpDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Paste 6-digit code
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setOtpDigits(newDigits);

    // Focus appropriate box
    const nextIdx = Math.min(pasted.length, 5);
    inputRefs.current[nextIdx]?.focus();

    if (pasted.length === 6) {
      handleVerifyOtp(pasted);
    }
  };

  // Quick auto-fill button for testing convenience
  const handleAutoFillPreview = () => {
    if (!serverSimulatedOtp) return;
    const digits = serverSimulatedOtp.split('').slice(0, 6);
    setOtpDigits(digits);
    handleVerifyOtp(serverSimulatedOtp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden animate-otp-pop-in">
        {/* Decorative Top Accent Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer z-10"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Real-Time SMS Simulation Notification Banner */}
        {step === 'otp' && serverSimulatedOtp && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-200/90 flex items-start gap-2.5 animate-in slide-in-from-top-3 duration-300 shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700">
                  Real-Time OTP Dispatched
                </span>
                <span className="text-[10px] text-amber-700 font-medium">Just now</span>
              </div>
              <p className="text-xs text-slate-800 mt-0.5">
                Your FoodInside verification code is{' '}
                <strong className="text-orange-600 font-mono tracking-wider font-extrabold text-sm px-1.5 py-0.5 bg-orange-100 rounded">
                  {serverSimulatedOtp}
                </strong>
              </p>
              <button
                type="button"
                onClick={handleAutoFillPreview}
                className="mt-1.5 text-[11px] font-bold text-orange-700 hover:text-orange-900 flex items-center gap-1 cursor-pointer underline underline-offset-2"
              >
                <Sparkles className="w-3 h-3 text-orange-600" />
                <span>Tap to Auto-Fill & Verify</span>
              </button>
            </div>
          </div>
        )}

        <div className="p-6 sm:p-7">
          {/* STEP 1: IDENTIFIER INPUT */}
          {step === 'input' && (
            <div>
              {/* Header */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Flame className="w-6 h-6 fill-white" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    Customer Login & Sign Up
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Order fresh food with 1-click real-time OTP
                  </p>
                </div>
              </div>

              {/* Mode Toggle: Mobile SMS / Email */}
              <div className="flex rounded-xl bg-slate-100 p-1 my-5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setChannel('sms');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    channel === 'sms'
                      ? 'bg-white text-orange-600 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Mobile OTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChannel('email');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    channel === 'email'
                      ? 'bg-white text-orange-600 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email OTP</span>
                </button>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                {/* Optional Customer Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Your Name <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none transition-all"
                  />
                </div>

                {/* Identifier Input */}
                {channel === 'sms' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Mobile Number
                    </label>
                    <div className="flex gap-2">
                      {/* Country Code Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                          className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center gap-1.5 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
                        >
                          <span>{selectedCountry.flag}</span>
                          <span>{selectedCountry.code}</span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        </button>

                        {countryDropdownOpen && (
                          <div className="absolute left-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-20 max-h-48 overflow-y-auto">
                            {COUNTRY_CODES.map(c => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => {
                                  setSelectedCountry(c);
                                  setCountryDropdownOpen(false);
                                }}
                                className="w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 hover:bg-orange-50 text-slate-700"
                              >
                                <span>{c.flag}</span>
                                <span className="font-semibold">{c.code}</span>
                                <span className="text-[10px] text-slate-400 truncate">{c.country}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Number input */}
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={e => setPhoneInput(e.target.value)}
                        placeholder="98765 43210"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none tracking-wide transition-all"
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none transition-all"
                      required
                      autoFocus
                    />
                  </div>
                )}

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Submit button with animation */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending Secure OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Get Real-Time OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Alternative Auth Dividers */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Or instant access
                </span>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    signInWithGoogle();
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="w-4 h-4"
                  />
                  <span>Sign in with Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    signInAsAdmin();
                    onClose();
                  }}
                  className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                  <span>Super Admin Demo (Hemant Mahant)</span>
                </button>
              </div>

              <p className="mt-5 text-center text-[10px] text-slate-400">
                By continuing, you agree to FoodInside's Terms of Service & Privacy Policy.
              </p>
            </div>
          )}

          {/* STEP 2: 6-DIGIT OTP VERIFICATION */}
          {step === 'otp' && (
            <div>
              {/* Header */}
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-2 animate-otp-glow shadow-xs">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Verify 6-Digit Code
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Sent to <strong className="text-slate-800 font-semibold">{currentIdentifier}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStep('input');
                    setErrorMsg(null);
                  }}
                  className="text-[11px] font-bold text-orange-600 hover:text-orange-700 mt-0.5 inline-block cursor-pointer underline"
                >
                  Edit phone / email
                </button>
              </div>

              {/* 6 Digit Input Boxes */}
              <div
                className={`flex items-center justify-between gap-1.5 sm:gap-2 my-5 ${
                  isOtpShaking ? 'animate-otp-shake' : ''
                }`}
                onPaste={handlePaste}
              >
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleDigitChange(idx, e.target.value)}
                    onKeyDown={e => handleKeyDown(idx, e)}
                    className={`w-11 sm:w-12 h-13 sm:h-14 text-center text-xl font-bold font-mono rounded-2xl border transition-all outline-none ${
                      errorMsg
                        ? 'border-red-400 bg-red-50 text-red-600 focus:ring-2 focus:ring-red-400/30'
                        : digit
                        ? 'border-orange-500 bg-orange-50/30 text-slate-900 focus:ring-2 focus:ring-orange-500/30'
                        : 'border-slate-200 bg-slate-50 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/30'
                    }`}
                  />
                ))}
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center justify-center gap-2 mb-4 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Verify Button */}
              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                disabled={loading || otpDigits.some(d => d === '')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying OTP...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm & Sign In</span>
                  </>
                )}
              </button>

              {/* Resend Timer */}
              <div className="mt-5 text-center text-xs">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="font-bold text-orange-600 hover:text-orange-700 flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resend OTP Code</span>
                  </button>
                ) : (
                  <p className="text-slate-400 font-medium">
                    Resend code in{' '}
                    <span className="font-mono font-bold text-slate-700">
                      00:{countdown < 10 ? `0${countdown}` : countdown}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS CELEBRATION */}
          {step === 'success' && (
            <div className="text-center py-6 animate-otp-success">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Verification Successful!
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Welcome to FoodInside, <strong className="text-slate-800">{verifiedCustomerName}</strong>!
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Session Active • Ready to Order</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
