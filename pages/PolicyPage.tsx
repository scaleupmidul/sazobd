
import React from 'react';
import { useAppStore } from '../StoreContext';

const PolicyPage: React.FC = () => {
  const { settings } = useAppStore();

  const policyText = settings.privacyPolicy.replace('{{CONTACT_EMAIL}}', settings.contactEmail);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 border-b-2 border-pink-100 pb-2">Privacy Policy</h2>
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-pink-100 space-y-6 text-sm text-gray-700 leading-relaxed">
        <div className="whitespace-pre-wrap">{policyText}</div>
      </div>
    </main>
  );
};

export default PolicyPage;