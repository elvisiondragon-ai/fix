import { supabase } from './supabaseClient';

// ─── IP ───────────────────────────────────────────────────────────────────────
export const getClientIp = async (): Promise<string | null> => {
  try {
    const res = await fetch('https://api64.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
  } catch {
    return null;
  }
};

// ─── SHA-256 ──────────────────────────────────────────────────────────────────
export const sha256 = async (message: string): Promise<string> => {
  if (!message) return '';
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message.trim().toLowerCase()));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
};

// ─── Cookie helpers ───────────────────────────────────────────────────────────
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const val = `; ${document.cookie}`;
  const parts = val.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const setCookie = (name: string, value: string, days = 90) => {
  if (typeof document === 'undefined') return;
  const exp = new Date(Date.now() + days * 864e5).toUTCString();
  const host = window.location.hostname;
  const parts = host.split('.');
  const domain = parts.length >= 2 && !host.includes('localhost') ? '.' + parts.slice(-2).join('.') : host;
  document.cookie = `${name}=${value}; expires=${exp}; path=/; domain=${domain}; SameSite=Lax`;
  document.cookie = `${name}=${value}; expires=${exp}; path=/; SameSite=Lax`;
};

// ─── FBC/FBP ──────────────────────────────────────────────────────────────────
const getFbclidFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  const p = new URLSearchParams(window.location.search);
  const fbclid = p.get('fbclid');
  if (!fbclid || fbclid.length < 20 || /test/i.test(fbclid)) return null;
  return fbclid;
};

export const handleFbcCookieManager = () => {
  const fbclid = getFbclidFromUrl();
  if (fbclid) {
    const fbc = `fb.1.${Date.now()}.${fbclid}`;
    setCookie('_fbc', fbc, 90);
    localStorage.setItem('_fbc_backup', fbc);
  }
};

export const getFbcFbpCookies = (): { fbc: string | null; fbp: string | null } => {
  if (typeof document === 'undefined') return { fbc: null, fbp: null };
  let fbc = getCookie('_fbc');
  const fbp = getCookie('_fbp');
  if (!fbc) {
    const fbclid = getFbclidFromUrl();
    if (fbclid) fbc = `fb.1.${Date.now()}.${fbclid}`;
  }
  if (!fbc) fbc = localStorage.getItem('_fbc_backup');
  return { fbc, fbp };
};

// ─── Pixel init ───────────────────────────────────────────────────────────────
const initializedPixels = new Set<string>();

export const initFacebookPixelWithLogging = (pixelId: string) => {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem('DISABLE_FB_PIXEL')) return;
  handleFbcCookieManager();
  if (!(window as any).fbq) {
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = true; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  }
  if (!initializedPixels.has(pixelId)) {
    (window as any).fbq('init', pixelId);
    initializedPixels.add(pixelId);
  }
};

// ─── Standard events ──────────────────────────────────────────────────────────
const STANDARD = ['PageView', 'ViewContent', 'AddPaymentInfo', 'Purchase', 'Lead', 'CompleteRegistration',
  'AddToCart', 'InitiateCheckout', 'Search', 'Subscribe'];

const trackPixel = (eventName: string, data: object, pixelId: string) => {
  if (typeof window === 'undefined' || !(window as any).fbq) return;
  if (localStorage.getItem('DISABLE_FB_PIXEL')) return;
  const isStd = STANDARD.includes(eventName);
  (window as any).fbq(isStd ? 'trackSingle' : 'trackSingleCustom', pixelId, eventName, data);
};

export const trackPageViewEvent = (pixelId: string) => trackPixel('PageView', {}, pixelId);
export const trackViewContentEvent = (data: object, pixelId: string) => trackPixel('ViewContent', data, pixelId);

// ─── CAPI via Supabase edge function ─────────────────────────────────────────
export const sendCAPI = async (opts: {
  pixelId: string;
  eventName: string;
  customData?: object;
  userData?: {
    fbc?: string | null;
    fbp?: string | null;
    fn?: string;
    ph?: string;
    em?: string;
    client_ip_address?: string | null;
    external_id?: string;
  };
}) => {
  try {
    await supabase.functions.invoke('capi-universal', {
      body: {
        pixelId: opts.pixelId,
        eventName: opts.eventName,
        eventSourceUrl: window.location.href,
        customData: opts.customData ?? {},
        userData: opts.userData ?? {},
      },
    });
  } catch (e) {
    console.error(`CAPI ${opts.eventName} error`, e);
  }
};
