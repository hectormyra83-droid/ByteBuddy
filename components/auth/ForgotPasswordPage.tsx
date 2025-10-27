import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Logo from '../Logo';

const ShowPasswordIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const HidePasswordIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;

const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [displayedCode, setDisplayedCode] = useState(''); // For demo purposes
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { sendPasswordResetCode, resetPassword } = useAuthContext();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await sendPasswordResetCode(email);
    if (result.success) {
      setDisplayedCode(result.code!); // Display code for demo
      setStep('code');
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setError('');
    setSuccess('');
    setIsLoading(true);

    const result = await resetPassword(email, code, newPassword);
    if (result.success) {
      setSuccess(result.message + " You can now log in.");
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  const renderEmailStep = () => (
    <>
      <h1 className="text-3xl font-heading font-bold text-center mb-2">Forgot Password</h1>
      <p className="text-muted-foreground text-center mb-6">Enter your email to receive a verification code.</p>
      <form onSubmit={handleSendCode} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
        </div>
        {error && <p className="text-sm text-destructive-foreground text-center bg-destructive/50 p-2 rounded-md">{error}</p>}
        <Button type="submit" className="w-full text-base py-3 h-12" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Verification Code'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered your password?{' '}
        <Link to="/login" className="font-semibold text-primary hover:text-transparent bg-clip-text hover:bg-gradient-to-r from-primary to-accent transition-all">
          Sign in
        </Link>
      </p>
    </>
  );

  const renderCodeStep = () => (
     <>
        <h1 className="text-3xl font-heading font-bold text-center mb-2">Check Your Email</h1>
        <p className="text-muted-foreground text-center mb-6">We've sent a 6-digit code to {email}.</p>
        
        {/* For demo purposes, display the code */}
        <div className="my-4 p-3 bg-secondary rounded-lg text-center">
            <p className="text-sm text-muted-foreground">For this demo, your code is:</p>
            <p className="text-2xl font-bold tracking-widest text-accent">{displayedCode}</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input id="code" type="text" placeholder="123456" value={code} onChange={(e) => setCode(e.target.value)} required disabled={isLoading} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <HidePasswordIcon /> : <ShowPasswordIcon />}
                  </button>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                 <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <HidePasswordIcon /> : <ShowPasswordIcon />}
                  </button>
                </div>
            </div>
            {error && <p className="text-sm text-destructive-foreground text-center bg-destructive/50 p-2 rounded-md">{error}</p>}
            <Button type="submit" className="w-full text-base py-3 h-12" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
            Entered the wrong email?{' '}
            <button onClick={() => { setStep('email'); setError(''); }} className="font-semibold text-primary hover:underline">
                Go Back
            </button>
        </p>
    </>
  );
  
  const renderSuccessStep = () => (
      <div className="text-center">
        <h1 className="text-3xl font-heading font-bold text-center mb-2">Success!</h1>
        <p className="text-lg text-green-400 my-4">{success}</p>
        <Link to="/login">
            <Button className="w-full text-base py-3 h-12">
                Back to Sign In
            </Button>
        </Link>
    </div>
  );


  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 bg-aurora-animate">
      <div className="relative w-full max-w-md z-10">
        <div className="flex justify-center mb-6">
           <div className="relative">
              <div className="absolute -inset-2 rounded-full bg-primary/30 blur-xl opacity-75"></div>
              <Logo className="w-20 h-20 relative" />
           </div>
        </div>
        <div className="bg-card/80 p-8 rounded-xl border border-border backdrop-blur-lg shadow-2xl shadow-black/30">
          {success ? renderSuccessStep() : (step === 'email' ? renderEmailStep() : renderCodeStep())}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;