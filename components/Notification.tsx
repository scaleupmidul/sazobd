
import React from 'react';
import { Check, AlertCircle, Info } from 'lucide-react';
import { Notification as NotificationType } from '../types';

interface NotificationProps {
  notification: NotificationType | null;
}

const Notification: React.FC<NotificationProps> = ({ notification }) => {
  if (!notification) return null;

  const config = {
    success: {
      icon: Check,
      bgClass: 'bg-emerald-50', // Soft premium green background
      iconClass: 'text-emerald-600',
      labelClass: 'text-emerald-700',
      label: 'Success'
    },
    error: {
      icon: AlertCircle, // Changed to Circle to match premium look
      bgClass: 'bg-rose-50', // Soft premium red background
      iconClass: 'text-rose-600',
      labelClass: 'text-rose-700',
      label: 'Error'
    },
    info: {
      icon: Info,
      bgClass: 'bg-blue-50',
      iconClass: 'text-blue-600',
      labelClass: 'text-blue-700',
      label: 'Info'
    }
  };

  const { icon: Icon, bgClass, iconClass, labelClass, label } = config[notification.type];

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] animate-notification w-auto max-w-[90vw] sm:max-w-md">
      <div className="flex items-center gap-3.5 pl-2 pr-6 py-2.5 bg-white/95 backdrop-blur-xl border border-stone-100 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/5">
        
        {/* Icon Circle */}
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${bgClass} ${iconClass} flex-shrink-0 shadow-sm`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>

        {/* Text Content */}
        <div className="flex flex-col justify-center min-w-[120px]">
           {/* Label (Success/Error) - Uppercase & Bold */}
           <span className={`text-[10px] font-extrabold uppercase tracking-[0.15em] leading-none mb-0.5 ${labelClass}`}>
             {label}
           </span>
           
           {/* Message - Clean sans-serif */}
           <span className="text-[13px] font-semibold text-stone-700 leading-tight">
             {notification.message}
           </span>
        </div>

      </div>
    </div>
  );
};

export default Notification;
