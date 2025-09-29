
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

function NotFoundPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-[calc(100vh-128px)] flex flex-col items-center justify-center text-center px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-white p-8 rounded-xl shadow-2xl">
          <AlertTriangle className="mx-auto h-20 w-20 text-yellow-400 mb-6" />
          <h1 className="text-5xl font-extrabold text-gray-800 mb-3">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">{t('pageNotFound')}</h2>
          <p className="text-gray-600 mb-8">
            {t('pageNotFoundDescription')}
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
            <Link to="/">{t('goBackHome')}</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default NotFoundPage;
