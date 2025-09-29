
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; 
import { useLanguage } from '@/contexts/LanguageContext';
import { SPORTS } from '@/constants/sports';

function RegisterPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [favoriteSports, setFavoriteSports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }
    
    if (password.length < 6) {
      setError(t('passwordMinLength'));
      return;
    }

    if (isNaN(parseInt(age)) || parseInt(age) <= 0) {
      setError(t('enterValidAge'));
      return;
    }

    if (favoriteSports.length > 3) {
      setError(t('selectUpToThree'));
      return;
    }
    
    setIsLoading(true);
    
    try {
      const registrationData = {
        email,
        password,
        name,
        username,
        age: parseInt(age),
        gender,
        favoriteSports
      };
      const result = await register(registrationData);
      if (result.success) {
        navigate('/verify-email');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(t('unexpectedError'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">SM</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">{t('createAnAccount')}</CardTitle>
            <CardDescription className="text-center">
              {t('createAccountDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('fullNameLabel')}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">{t('usernameLabel')}</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('emailLabel')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
               <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">{t('ageLabel')}</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="e.g., 25"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">{t('genderLabel')}</Label>
                  <Select onValueChange={setGender} value={gender}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder={t('selectGender')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t('male')}</SelectItem>
                      <SelectItem value="female">{t('female')}</SelectItem>
                      <SelectItem value="other">{t('other')}</SelectItem>
                      <SelectItem value="prefer_not_to_say">{t('preferNotToSay')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label className="text-base">{t('favoriteSports')}</Label>
                <p className="text-xs text-gray-500">{t('selectUpToThree')}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SPORTS.map((sport) => {
                    const selected = favoriteSports.includes(sport.value);
                    return (
                      <Button
                        key={sport.value}
                        type="button"
                        variant={selected ? 'default' : 'outline'}
                        className="justify-center"
                        onClick={() => {
                          setFavoriteSports((prev) => {
                            if (prev.includes(sport.value)) {
                              return prev.filter((s) => s !== sport.value);
                            }
                            if (prev.length >= 3) {
                              return prev; // ignore beyond 3
                            }
                            return [...prev, sport.value];
                          });
                        }}
                        aria-pressed={selected}
                      >
                        {t(sport.labelKey)}
                      </Button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('passwordLabel')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('confirmPasswordLabel')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                    {t('creatingAccount')}
                  </div>
                ) : (
                  t('signUp')
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-gray-600">
              {t('alreadyHaveAccount')}{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                {t('login')}
              </Link>
            </div>
            <div className="text-xs text-center text-gray-500">
              {t('termsAndPrivacy')}
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

export default RegisterPage;
