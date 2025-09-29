
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MailCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

function VerifyEmailPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <MailCheck className="mx-auto h-12 w-12 text-green-500" />
            <CardTitle className="text-2xl font-bold">{t('verifyYourEmail')}</CardTitle>
            <CardDescription>
              {t('verificationLinkSent')}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              {t('ifNoEmail')}
            </p>
            <Button variant="outline" className="w-full mb-4">
              {t('resendVerification')}
            </Button>
            <div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
              <p className="text-xs text-yellow-700">
                {t('verificationEmailSentDescription')}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/login">{t('backToLogin')}</Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

export default VerifyEmailPage;
