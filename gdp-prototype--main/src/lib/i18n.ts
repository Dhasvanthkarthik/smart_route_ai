// Lightweight i18n translation map.
// Keys match the English label; values are per-language translations.

export type Language = 'English' | 'Hindi' | 'Spanish' | 'French' | 'German' | 'Arabic' | 'Chinese';

export const LANGUAGE_CODES: Record<Language, string> = {
  English: 'en',
  Hindi: 'hi',
  Spanish: 'es',
  French: 'fr',
  German: 'de',
  Arabic: 'ar',
  Chinese: 'zh',
};

type TranslationMap = Record<string, string>;

const translations: Record<Language, TranslationMap> = {
  English: {
    Dashboard: 'Dashboard',
    Shipments: 'Shipments',
    'Live Tracking': 'Live Tracking',
    Alerts: 'Alerts',
    Analytics: 'Analytics',
    Settings: 'Settings',
    'New Shipment': 'New Shipment',
    'Kinetic Orchestrator': 'Kinetic Orchestrator',
  },
  Hindi: {
    Dashboard: 'डैशबोर्ड',
    Shipments: 'शिपमेंट',
    'Live Tracking': 'लाइव ट्रैकिंग',
    Alerts: 'अलर्ट',
    Analytics: 'विश्लेषण',
    Settings: 'सेटिंग्स',
    'New Shipment': 'नई शिपमेंट',
    'Kinetic Orchestrator': 'काइनेटिक ऑर्केस्ट्रेटर',
  },
  Spanish: {
    Dashboard: 'Panel de control',
    Shipments: 'Envíos',
    'Live Tracking': 'Seguimiento en vivo',
    Alerts: 'Alertas',
    Analytics: 'Análisis',
    Settings: 'Ajustes',
    'New Shipment': 'Nuevo Envío',
    'Kinetic Orchestrator': 'Orquestador Cinético',
  },
  French: {
    Dashboard: 'Tableau de bord',
    Shipments: 'Expéditions',
    'Live Tracking': 'Suivi en direct',
    Alerts: 'Alertes',
    Analytics: 'Analytique',
    Settings: 'Paramètres',
    'New Shipment': 'Nouvelle Expédition',
    'Kinetic Orchestrator': 'Orchestrateur Cinétique',
  },
  German: {
    Dashboard: 'Übersicht',
    Shipments: 'Sendungen',
    'Live Tracking': 'Live-Verfolgung',
    Alerts: 'Alarme',
    Analytics: 'Analytik',
    Settings: 'Einstellungen',
    'New Shipment': 'Neue Sendung',
    'Kinetic Orchestrator': 'Kinetischer Orchestrator',
  },
  Arabic: {
    Dashboard: 'لوحة التحكم',
    Shipments: 'الشحنات',
    'Live Tracking': 'التتبع المباشر',
    Alerts: 'التنبيهات',
    Analytics: 'التحليلات',
    Settings: 'الإعدادات',
    'New Shipment': 'شحنة جديدة',
    'Kinetic Orchestrator': 'المنسق الحركي',
  },
  Chinese: {
    Dashboard: '仪表板',
    Shipments: '货运',
    'Live Tracking': '实时追踪',
    Alerts: '警报',
    Analytics: '分析',
    Settings: '设置',
    'New Shipment': '新货运',
    'Kinetic Orchestrator': '动力协调器',
  },
};

/** Returns the translated string for the given key and language. Falls back to the key itself. */
export function t(key: string, language: Language): string {
  return translations[language]?.[key] ?? key;
}

export default translations;
