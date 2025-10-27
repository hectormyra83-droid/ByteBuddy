import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Logo from '../Logo';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { sendPasswordResetCode } = useAuthContext();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    const result = await sendPasswordResetCode(email);
    if (result.success) {
      setSuccess(result.message);
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

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
          <h1 className="text-3xl font-heading font-bold text-center mb-2">Forgot Password</h1>
          
          {success ? (
            <div className="text-center">
                <p className="text-green-400 my-4">{success}</p>
                <Link to="/login">
                    <Button className="w-full text-base py-3 h-12 mt-4">
                        Back to Sign In
                    </Button>
                </Link>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground text-center mb-6">Enter your email to receive a password reset link.</p>
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
                </div>
                {error && <p className="text-sm text-destructive-foreground text-center bg-destructive/50 p-2 rounded-md">{error}</p>}
                <Button type="submit" className="w-full text-base py-3 h-12" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Remembered your password?{' '}
                <Link to="/login" className="font-semibold text-primary hover:text-transparent bg-clip-text hover:bg-gradient-to-r from-primary to-accent transition-all">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
