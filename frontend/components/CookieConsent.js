import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Cookies from "js-cookie";
import Link from "next/link";
import { Switch } from "@headlessui/react";

export default function CookieConsent({ onConsent, locale = "en", openSettings = false, setOpenSettings }) {
  const [visible, setVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  const t = {
    en: {
      message: "We use cookies to enhance your experience. By continuing, you agree to our",
      privacy: "Privacy Policy",
      accept: "Accept All",
      settings: "Settings",
      decline: "Decline",
      categories: {
        necessary: "Necessary",
        analytics: "Analytics",
        marketing: "Marketing",
      },
      description: {
        necessary: "Essential for website functionality",
        analytics: "Helps us improve our services",
        marketing: "Personalized content and ads",
      },
    },
    ar: {
      message: "نستخدم ملفات تعريف الارتباط لتحسين تجربتك. بالاستمرار، أنت توافق على",
      privacy: "سياسة الخصوصية",
      accept: "قبول الكل",
      settings: "الإعدادات",
      decline: "رفض",
      categories: {
        necessary: "ضرورية",
        analytics: "تحليلات",
        marketing: "تسويق",
      },
      description: {
        necessary: "أساسية لعمل الموقع",
        analytics: "تساعدنا على تحسين خدماتنا",
        marketing: "محتوى وإعلانات مخصصة",
      },
    },
  }[locale];

  useEffect(() => {
    const saved = Cookies.get("cookie_consent");
    if (saved) {
      const consentData = JSON.parse(saved);
      setPreferences(consentData);
      onConsent?.(consentData);
    } else {
      setIsMounted(true);
      setTimeout(() => setVisible(true), 300);
    }
  }, []);

  const handleConsent = (type = "all") => {
    let consent = preferences;
    if (type === "all") consent = { necessary: true, analytics: true, marketing: true };
    else if (type === "necessary") consent = { necessary: true, analytics: false, marketing: false };

    Cookies.set("cookie_consent", JSON.stringify(consent), {
      expires: 365,
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
    });

    setVisible(false);
    setOpenSettings(false);
    onConsent?.(consent);
  };

  if (!isMounted) return null;

  return (
    <>
      {/* Banner */}
      <div
        role="dialog"
        aria-labelledby="cookie-consent-heading"
        className={`fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white transition-transform duration-300 ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p id="cookie-consent-heading" className="text-sm text-center sm:text-left">
            {t.message}{" "}
            <Link href="/privacy" className="text-ourArabGreen-400 underline hover:text-ourArabGreen-300">
              {t.privacy}
            </Link>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button onClick={() => setOpenSettings(true)} className="px-4 py-2 text-sm border border-gray-600 rounded hover:bg-gray-800">
              {t.settings}
            </button>
            <button onClick={() => handleConsent("necessary")} className="px-4 py-2 text-sm border border-gray-600 rounded hover:bg-gray-800">
              {t.decline}
            </button>
            <button onClick={() => handleConsent("all")} className="px-4 py-2 text-sm bg-ourArabGreen-500 hover:bg-ourArabGreen-600 rounded text-white">
              {t.accept}
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {openSettings && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 text-white rounded-lg p-6 max-w-2xl w-full" dir={locale === "ar" ? "rtl" : "ltr"}>
            <h2 className="text-xl font-bold mb-4">{t.settings}</h2>

            {/* Cookie Toggles */}
            {["necessary", "analytics", "marketing"].map((key) => (
              <div key={key} className="flex items-center justify-between p-4 border-b border-gray-800 last:border-b-0">
                <div>
                  <h3 className="font-medium">{t.categories[key]}</h3>
                  <p className="text-sm text-gray-400">{t.description[key]}</p>
                </div>
                <Switch
                  checked={preferences[key]}
                  disabled={key === "necessary"}
                  onChange={(checked) => setPreferences((p) => ({ ...p, [key]: checked }))}
                  className={`${
                    preferences[key] ? "bg-ourArabGreen-500" : "bg-gray-700"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    key === "necessary" ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <span className="sr-only">{t.categories[key]}</span>
                  <span
                    className={`${
                      preferences[key] ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
              </div>
            ))}

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setOpenSettings(false)} className="px-4 py-2 text-sm border border-gray-600 rounded hover:bg-gray-800">
                {locale === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button onClick={() => handleConsent("custom")} className="px-4 py-2 text-sm bg-ourArabGreen-500 hover:bg-ourArabGreen-600 rounded text-white">
                {locale === "ar" ? "حفظ الإعدادات" : "Save Settings"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

CookieConsent.propTypes = {
  onConsent: PropTypes.func,
  locale: PropTypes.oneOf(["en", "ar"]),
  openSettings: PropTypes.bool,
  setOpenSettings: PropTypes.func,
};
