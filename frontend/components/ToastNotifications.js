import { ToastBar, Toaster } from 'react-hot-toast';

export default function ToastNotifications() {
  return (
    <Toaster
      position="bottom-right"
      gutter={8}
      toastOptions={{
        duration: 5000,
        // Add dark mode support
        className: 'dark:bg-gray-800 dark:text-white',
        // Universal styles
        style: {
          maxWidth: '420px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        },
        // Type-specific configs
        success: {
          iconTheme: {
            primary: '#3B82F6',
            secondary: 'white',
          },
          ariaProps: {
            role: 'status',
            'aria-live': 'polite',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: 'white',
          },
          ariaProps: {
            role: 'alert',
            'aria-live': 'assertive',
          },
        },
      }}
      // Accessibility features
      containerStyle={{
        zIndex: 9999,
      }}
      // Mobile optimization
      containerClassName="px-safe-4 pb-safe-4"
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <div 
              className="flex items-start gap-3 group"
              role={t.type === 'error' ? 'alert' : 'status'}
            >
              {/* Icon Container */}
              <div className="shrink-0">
                {icon}
              </div>
              
              {/* Message with Truncation */}
              <div className="flex-1 text-sm break-words line-clamp-3">
                {message}
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => toast.dismiss(t.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity
                         text-gray-400 hover:text-gray-600 dark:text-gray-300
                         p-1 -mr-2"
                aria-label="Dismiss notification"
              >
                <svg width="14" height="14" viewBox="0 0 24 24">
                  <path 
                    fill="currentColor" 
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                  />
                </svg>
              </button>
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
}