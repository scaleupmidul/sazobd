
import React from 'react';
import { Check, AlertOctagon, Info } from 'lucide-react';
import { Notification as NotificationType } from '../types';

interface NotificationProps {
  notification: NotificationType | null;
}

const Notification: React.FC<NotificationProps> = ({ notification }) => {
  if (!notification) return null;

  const config = {
    success: {
      icon: Check,
      textClass: 'text-emerald-600',
      bgClass: 'bg-emerald-100',
      iconClass: 'text-emerald-700',
      label: 'Success'
    },
    error: {
      icon: AlertOctagon,
      textClass: 'text-rose-600',
      bgClass: 'bg-rose-100',
      iconClass: 'text-rose-700',
      label: 'Error'
    },
    info: {
      icon: Info,
      textClass: 'text-blue-600',
      bgClass: 'bg-blue-100',
      iconClass: 'text-blue-700',
      label: 'Information'
    }
  };

  const { icon: Icon, textClass, bgClass, iconClass, label } = config[notification.type];

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] animate-notification">
      <div className="flex items-center p-2 pr-6 bg-white/95 backdrop-blur-xl border border-stone-200/60 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        
        {/* Circular Icon Wrapper */}
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${bgClass} ${iconClass} shadow-inner flex-shrink-0`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>

        {/* Text Content */}
        <div className="ml-4 flex flex-col justify-center min-w-[200px] max-w-[300px]">
           <span className={`text-[10px] font-bold uppercase tracking-widest ${textClass} opacity-90 leading-tight mb-0.5`}>
             {label}
           </span>
           <span className="text-sm font-semibold text-stone-800 leading-snug line-clamp-2">
             {notification.message}
           </span>
        </div>

      </div>
    </div>
  );
};

export default Notification;
