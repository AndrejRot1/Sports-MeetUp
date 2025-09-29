
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Key, Save, CalendarDays, Users as GenderIcon, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { SPORTS } from '@/constants/sports';

function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    age: '',
    gender: '',
    favoriteSports: [],
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        username: user.user_metadata?.username || '',
        email: user.email || '',
        age: user.user_metadata?.age || '',
        gender: user.user_metadata?.gender || '',
        favoriteSports: Array.isArray(user.user_metadata?.favorite_sports) ? user.user_metadata.favorite_sports : [],
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (value) => {
    setFormData(prev => ({ ...prev, gender: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const initialData = {
      name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      username: user.user_metadata?.username || '',
      email: user.email || '',
      age: user.user_metadata?.age || '',
      gender: user.user_metadata?.gender || '',
      favoriteSports: Array.isArray(user.user_metadata?.favorite_sports) ? user.user_metadata.favorite_sports : [],
    };

    const changedFields = Object.keys(formData).filter(key => 
        key !== 'currentPassword' && 
        key !== 'newPassword' && 
        key !== 'confirmPassword' &&
        JSON.stringify(formData[key]) !== JSON.stringify(initialData[key])
    );

    if (changedFields.length === 0 && !formData.newPassword) {
      setError(t('noChangesToSave'));
      return;
    }
    
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setError(t('currentPasswordRequired'));
        return;
      }
      if (formData.newPassword.length < 6) {
        setError(t('newPasswordMinLength'));
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError(t('newPasswordsDoNotMatch'));
        return;
      }
    }

    if (formData.age && (isNaN(parseInt(formData.age)) || parseInt(formData.age) <= 0)) {
      setError(t('enterValidAge'));
      return;
    }
    
    setIsLoading(true);
    
    try {
      const updates = {};
      if (formData.name !== initialData.name) updates.name = formData.name;
      if (formData.username !== initialData.username) updates.username = formData.username;
      if (formData.email !== initialData.email) updates.email = formData.email;
      if (formData.age && formData.age !== initialData.age) updates.age = parseInt(formData.age);
      if (formData.gender && formData.gender !== initialData.gender) updates.gender = formData.gender;
      if (JSON.stringify(formData.favoriteSports) !== JSON.stringify(initialData.favoriteSports)) updates.favoriteSports = formData.favoriteSports.slice(0,3);
      
      if (formData.newPassword) {
        updates.password = formData.newPassword;
      }
      
      const result = await updateProfile(updates);
      
      if (result.success) {
        setSuccess(t('profileUpdatedDescription'));
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        setError(result.error || t('updateFailedTitle'));
      }
    } catch (err) {
      setError(t('unexpectedError'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h1 className="text-2xl font-bold">{t('yourProfile')}</h1>
            <p className="text-blue-100">{t('manageAccountInfo')}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">{t('personalInformation')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-base flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {t('fullNameLabel')}
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                   <div>
                    <Label htmlFor="username" className="text-base flex items-center">
                      <Hash className="h-4 w-4 mr-1" />
                      {t('usernameLabel')}
                    </Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-base flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {t('emailAddressLabel')}
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="age" className="text-base flex items-center">
                      <CalendarDays className="h-4 w-4 mr-1" />
                      {t('ageLabel')}
                    </Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender" className="text-base flex items-center">
                      <GenderIcon className="h-4 w-4 mr-1" />
                      {t('genderLabel')}
                    </Label>
                     <Select onValueChange={handleGenderChange} value={formData.gender}>
                      <SelectTrigger id="gender" className="mt-1">
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
              </div>
              
              <div className="md:col-span-2">
                <Label className="text-base">{t('favoriteSports')}</Label>
                <p className="text-xs text-gray-500">{t('selectUpToThree')}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {SPORTS.map((sport) => {
                    const selected = formData.favoriteSports.includes(sport.value);
                    return (
                      <Button
                        key={sport.value}
                        type="button"
                        variant={selected ? 'default' : 'outline'}
                        className="justify-center"
                        onClick={() => {
                          setFormData((prev) => {
                            const current = prev.favoriteSports || [];
                            if (current.includes(sport.value)) {
                              return { ...prev, favoriteSports: current.filter((s) => s !== sport.value) };
                            }
                            if (current.length >= 3) {
                              return prev;
                            }
                            return { ...prev, favoriteSports: [...current, sport.value] };
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
              
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">{t('changePassword')}</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword" className="text-base flex items-center">
                      <Key className="h-4 w-4 mr-1" />
                      {t('currentPasswordLabel')}
                    </Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="newPassword" className="text-base">
                      {t('newPasswordLabel')}
                    </Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword" className="text-base">
                      {t('confirmNewPasswordLabel')}
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            
            {success && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                {success}
              </div>
            )}
            
            <div className="flex justify-end pt-4">
              <Button type="submit" className="flex items-center" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                    {t('saving')}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t('saveChanges')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default ProfilePage;
