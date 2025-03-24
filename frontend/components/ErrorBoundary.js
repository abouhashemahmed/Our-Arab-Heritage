// components/ErrorBoundary.js
import { Component } from 'react';
import PropTypes from 'prop-types';
import * as Sentry from '@sentry/nextjs';
import { useRouter } from 'next/router';

class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null,
    errorInfo: null,
    eventId: null,
  };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to Sentry with component stack and custom tag
    const eventId = Sentry.captureException(error, {
      extra: { errorInfo },
      tags: { component_stack: errorInfo.componentStack },
    });

    this.setState({ errorInfo, eventId });
    console.error('Error Boundary Caught:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onReset?.();

    // Full reload (optional: replace with soft navigation if preferred)
    if (typeof window !== 'undefined') {
      window.location.reload();
    }

    // Optional: Soft reset via router (commented out)
    // this.props.router.push('/');
  };

  handleReportError = () => {
    const { eventId } = this.state;
    if (!eventId) return;

    Sentry.showReportDialog({
      eventId,
      title: 'Oops! Please help us fix this',
      subtitle: 'Our team has been notified.',
      subtitle2: 'If you’d like to help, tell us what happened below.',
      labelName: 'Name',
      labelEmail: 'Email',
      labelComments: 'What happened?',
      labelClose: 'Close',
      labelSubmit: 'Submit Report',
      errorFormEntry: 'Please fill out all required fields',
      successMessage: 'Thank you! Your report has been submitted.',
    });
  };

  render() {
    const { hasError, error, errorInfo, eventId } = this.state;
    const { children, locale = 'en' } = this.props;

    // ✅ Fallback locale-safe messages
    const messages = {
      en: {
        title: '⚠️ Oops! Something went wrong',
        tryAgain: 'Try Again',
        contact: 'Still having issues?',
        report: 'Report Error',
        details: 'Error Details (Development Only)',
        contactSupport: 'Contact Support',
      },
      ar: {
        title: '⚠️ عفوا! حدث خطأ ما',
        tryAgain: 'حاول مرة أخرى',
        contact: 'لا تزال تواجه مشكلات؟',
        report: 'الإبلاغ عن خطأ',
        details: 'تفاصيل الخطأ (للتنمية فقط)',
        contactSupport: 'اتصل بالدعم',
      },
    };

    const t = messages[locale] || messages.en;

    if (hasError) {
      return (
        <div className="p-4 max-w-2xl mx-auto text-center" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          <h1 className="text-red-600 text-2xl font-bold mb-4">
            {t.title}
          </h1>

          {process.env.NODE_ENV === 'development' && (
            <details className="mb-4 text-left bg-red-50 p-4 rounded">
              <summary className="font-medium cursor-pointer">
                {t.details}
              </summary>
              <pre className="whitespace-pre-wrap mt-2 text-red-700">
                {error?.toString()}
                {"\n"}
                {errorInfo?.componentStack}
              </pre>
              {eventId && (
                <p className="mt-2 text-sm text-gray-500">Error ID: {eventId}</p>
              )}
            </details>
          )}

          <div className="space-y-4">
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={this.resetError}
                className="bg-ourArabGreen-500 text-white px-6 py-3 rounded-lg hover:bg-ourArabGreen-600 transition-colors"
              >
                {t.tryAgain}
              </button>

              <button
                onClick={this.handleReportError}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t.report}
              </button>
            </div>

            <p className="text-gray-600 mt-4">
              {t.contact}{' '}
              <a
                href="mailto:support@example.com"
                className="text-ourArabGreen-600 hover:underline"
              >
                {t.contactSupport}
              </a>
            </p>
          </div>
        </div>
      );
    }

    return children;
  }
}

// ✅ Prop validation
ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onReset: PropTypes.func,
  locale: PropTypes.oneOf(['en', 'ar']),
  router: PropTypes.object,
};

// ✅ Wrap with router to support soft navigation resets
export default function ErrorBoundaryWrapper(props) {
  const router = useRouter();
  return <ErrorBoundary {...props} router={router} />;
}
