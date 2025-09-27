import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import eeuLogo from 'figma:asset/a7b96e6fbe59cc65b1f1fae75f58ca6158a2d650.png';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { email: 'admin@eeu.gov.et', password: 'admin123', role: 'Administrator' },
    { email: 'manager@eeu.gov.et', password: 'manager123', role: 'Manager' },
    { email: 'staff@eeu.gov.et', password: 'staff123', role: 'Staff' },
    { email: 'customer@eeu.gov.et', password: 'customer123', role: 'Customer' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center">
            <img 
              src={eeuLogo} 
              alt="Ethiopian Electric Utility" 
              className="w-20 h-20 object-contain mb-2"
            />
            <h1 className="text-2xl font-bold text-orange-500">EEU CMS</h1>
            <p className="text-gray-700 font-medium">Ethiopian Electric Utility</p>
            <p className="text-sm text-gray-600">የኢትዮጵያ ኤሌክትሪክ ኃይል ኮርፖሬሽን</p>
            <p className="text-sm text-gray-500 mt-2">Complaint Management System</p>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-green-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 italic">
              "Powering Ethiopia's Future with Reliable Energy"
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}
              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              Demo Accounts
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                Mock Data
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {demoAccounts.map((account, index) => (
              <button
                key={index}
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                }}
                className="w-full text-left p-2 rounded-md hover:bg-orange-50 border border-orange-200 transition-colors"
              >
                <div className="text-sm font-medium">{account.role}</div>
                <div className="text-xs text-gray-500">{account.email}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="text-center space-y-2">
          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
            Running in demo mode with mock data. To connect to a real backend, 
            configure your Google Apps Script URL in the API settings.
          </div>
          <div className="text-xs text-gray-500">
            Designed by: WORKU MESAFINT ADDIS [504530]
          </div>
        </div>
      </div>
    </div>
  );
}