/**
 * Vector SVG Enterprise Logos
 * High-definition, scalable, lightweight logos for physical cards and digital displays.
 */

// 1. Canaan Services (Imprimerie, Gadgets Publicitaires & Prestations)
export const CANAAN_SERVICES_LOGO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <linearGradient id="splashPink" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF2E93"/>
      <stop offset="100%" stop-color="#D91B62"/>
    </linearGradient>
    <linearGradient id="splashCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00C4FF"/>
      <stop offset="100%" stop-color="#0077B6"/>
    </linearGradient>
    <linearGradient id="splashYellow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFDD00"/>
      <stop offset="100%" stop-color="#FFAA00"/>
    </linearGradient>
    <linearGradient id="splashGreen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
  </defs>
  
  <!-- Outer Rounded White Box -->
  <rect width="160" height="160" rx="32" fill="#FFFFFF"/>
  <rect x="2" y="2" width="156" height="156" rx="30" fill="none" stroke="#E2E8F0" stroke-width="2"/>
  
  <!-- Colorful Ink / Paint Splashes and Droplets (CMYK Printing Theme) -->
  <!-- Top Left Magenta/Pink Splatter -->
  <path d="M 28 36 C 22 28, 34 16, 44 24 C 48 18, 56 22, 54 30 C 50 34, 38 38, 28 36 Z" fill="url(#splashPink)"/>
  <circle cx="22" cy="24" r="4" fill="url(#splashPink)"/>
  <circle cx="32" cy="16" r="2.5" fill="url(#splashPink)"/>
  
  <!-- Top Center Yellow Splash -->
  <path d="M 64 22 C 70 14, 82 16, 86 24 C 92 20, 98 26, 94 32 C 86 34, 72 32, 64 22 Z" fill="url(#splashYellow)"/>
  <circle cx="78" cy="12" r="3.5" fill="url(#splashYellow)"/>
  
  <!-- Top Right Cyan Splash -->
  <path d="M 106 28 C 114 18, 128 22, 132 32 C 140 32, 138 42, 130 46 C 122 46, 112 38, 106 28 Z" fill="url(#splashCyan)"/>
  <circle cx="136" cy="22" r="4" fill="url(#splashCyan)"/>
  <circle cx="144" cy="34" r="2.5" fill="url(#splashCyan)"/>
  
  <!-- Mid Right Purple/Green Droplets -->
  <circle cx="140" cy="52" r="3" fill="#8B5CF6"/>
  <circle cx="134" cy="62" r="4" fill="url(#splashGreen)"/>
  <circle cx="18" cy="48" r="3.5" fill="url(#splashGreen)"/>
  <circle cx="22" cy="60" r="2.5" fill="url(#splashCyan)"/>

  <!-- Logo Typography -->
  <!-- CANAAN in Bold Black/Dark with stylized arc over C and N -->
  <text x="80" y="74" font-family="system-ui, -apple-system, 'Montserrat', 'Arial Black', sans-serif" font-size="23" font-weight="900" fill="#1E293B" text-anchor="middle" letter-spacing="1.2">CANAAN</text>
  
  <!-- Swash arc accent on C -->
  <path d="M 28 66 Q 34 54 44 60" fill="none" stroke="url(#splashPink)" stroke-width="3" stroke-linecap="round"/>
  <!-- Swash arc accent on N -->
  <path d="M 118 60 Q 128 54 132 66" fill="none" stroke="url(#splashCyan)" stroke-width="3" stroke-linecap="round"/>

  <!-- Services in Cursive / Calligraphy Red -->
  <text x="80" y="96" font-family="'Brush Script MT', 'Segoe Script', cursive, sans-serif" font-size="21" font-style="italic" font-weight="bold" fill="#DC2626" text-anchor="middle">Services</text>

  <!-- Slogan: Donner vie à vos idées -->
  <text x="80" y="116" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-style="italic" font-weight="700" fill="#0D9488" text-anchor="middle">Donner vie à vos idées</text>

  <!-- Phone line -->
  <text x="80" y="134" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="800" fill="#0284C7" text-anchor="middle" letter-spacing="0.5">+225 06 64 41 65 15</text>
</svg>
`)}`;

// 2. AGB Digital Engineering / AGB Studio
export const AGB_ENGINEERING_LOGO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="agbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="50%" stop-color="#6366F1"/>
      <stop offset="100%" stop-color="#8B5CF6"/>
    </linearGradient>
    <linearGradient id="agbBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
  </defs>
  
  <rect width="120" height="120" rx="26" fill="url(#agbBg)"/>
  <rect x="4" y="4" width="112" height="112" rx="22" fill="none" stroke="url(#agbGrad)" stroke-width="2" stroke-opacity="0.5"/>
  
  <!-- Hexagonal Tech Core & Circuit Symbol -->
  <polygon points="60,24 88,40 88,72 60,88 32,72 32,40" fill="none" stroke="url(#agbGrad)" stroke-width="5" stroke-linejoin="round"/>
  <circle cx="60" cy="56" r="10" fill="url(#agbGrad)"/>
  <line x1="60" y1="24" x2="60" y2="46" stroke="#60A5FA" stroke-width="3"/>
  <line x1="32" y1="72" x2="50" y2="62" stroke="#60A5FA" stroke-width="3"/>
  <line x1="88" y1="72" x2="70" y2="62" stroke="#60A5FA" stroke-width="3"/>
  
  <text x="60" y="110" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="900" fill="#93C5FD" text-anchor="middle" letter-spacing="2">AGB STUDIO</text>
</svg>
`)}`;

// 3. ICG Africa (Conseil en Stratégie & Finance)
export const ICG_AFRICA_LOGO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="icgGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD34D"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
    <linearGradient id="icgBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0A192F"/>
      <stop offset="100%" stop-color="#020C1B"/>
    </linearGradient>
  </defs>
  
  <rect width="120" height="120" rx="26" fill="url(#icgBg)"/>
  <rect x="4" y="4" width="112" height="112" rx="22" fill="none" stroke="url(#icgGold)" stroke-width="2" stroke-opacity="0.5"/>
  
  <!-- Financial Growth Tri-Pillars / Diamond Crest -->
  <path d="M60 26 L86 64 L60 84 L34 64 Z" fill="none" stroke="url(#icgGold)" stroke-width="4.5" stroke-linejoin="round"/>
  <line x1="60" y1="26" x2="60" y2="84" stroke="url(#icgGold)" stroke-width="3.5"/>
  <circle cx="60" cy="55" r="6" fill="#FDE68A"/>
  
  <text x="60" y="108" font-family="system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="900" fill="#FDE68A" text-anchor="middle" letter-spacing="2">ICG AFRICA</text>
</svg>
`)}`;

// 4. Centre Médical Sainte-Victoire (Santé & Cardiologie)
export const SAINTE_VICTOIRE_LOGO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="medGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#14B8A6"/>
      <stop offset="100%" stop-color="#0F766E"/>
    </linearGradient>
    <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F43F5E"/>
      <stop offset="100%" stop-color="#BE123C"/>
    </linearGradient>
  </defs>
  
  <rect width="120" height="120" rx="26" fill="#FFFFFF"/>
  <rect x="3" y="3" width="114" height="114" rx="23" fill="none" stroke="#E2E8F0" stroke-width="2"/>
  
  <!-- Medical Cross & Cardio Pulse Wave -->
  <rect x="48" y="24" width="24" height="60" rx="6" fill="url(#medGrad)"/>
  <rect x="30" y="42" width="60" height="24" rx="6" fill="url(#medGrad)"/>
  
  <!-- ECG Heart Wave -->
  <path d="M 36 54 L 46 54 L 52 40 L 58 68 L 64 48 L 70 58 L 74 54 L 84 54" 
        fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        
  <text x="60" y="106" font-family="system-ui, -apple-system, sans-serif" font-size="7.5" font-weight="900" fill="#0F766E" text-anchor="middle" letter-spacing="1">STE-VICTOIRE</text>
</svg>
`)}`;

/**
 * Resolve the official default logo for known companies
 */
export function getCompanyDefaultLogo(companyName?: string): string {
  if (!companyName) return '';
  const lower = companyName.toLowerCase().trim();

  if (lower.includes('canaan')) {
    return CANAAN_SERVICES_LOGO;
  }
  if (lower.includes('agb') || lower.includes('digital engineering')) {
    return AGB_ENGINEERING_LOGO;
  }
  if (lower.includes('icg') || lower.includes('africa')) {
    return ICG_AFRICA_LOGO;
  }
  if (lower.includes('victoire') || lower.includes('médical') || lower.includes('medical') || lower.includes('sainte')) {
    return SAINTE_VICTOIRE_LOGO;
  }

  // Generate a dynamic professional vector badge SVG on the fly for any other company
  const words = companyName.trim().split(/\s+/).filter(Boolean);
  const initials = words.length >= 2 
    ? `${words[0][0]}${words[1][0]}`.toUpperCase() 
    : companyName.slice(0, 2).toUpperCase();

  return `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="dynBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563EB"/>
      <stop offset="100%" stop-color="#1E40AF"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="22" fill="url(#dynBg)"/>
  <rect x="3" y="3" width="94" height="94" rx="19" fill="none" stroke="#60A5FA" stroke-width="2" stroke-opacity="0.4"/>
  <text x="50" y="58" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="900" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle" letter-spacing="1">${initials}</text>
</svg>
`)}`;
}
