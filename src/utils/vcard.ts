import { QRContent } from '../types/qr';

/**
 * Generates an RFC 6350 / vCard 3.0 formatted text string
 * Compatible with Apple Contacts (iOS), Google Contacts (Android), Outlook, etc.
 */
export function generateVCardString(content: QRContent): string {
  const firstName = content.firstName?.trim() || '';
  const lastName = content.lastName?.trim() || '';
  const fullName = content.fullName?.trim() || `${firstName} ${lastName}`.trim() || 'Contact';
  
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVCardText(fullName)}`,
    `N:${escapeVCardText(lastName)};${escapeVCardText(firstName)};${escapeVCardText(content.middleName || '')};${escapeVCardText(content.civility || '')};`,
  ];

  if (content.company) {
    lines.push(`ORG:${escapeVCardText(content.company)}`);
  }

  if (content.department) {
    lines.push(`DEPT:${escapeVCardText(content.department)}`);
  }

  if (content.jobTitle) {
    lines.push(`TITLE:${escapeVCardText(content.jobTitle)}`);
  }

  if (content.primaryPhone) {
    lines.push(`TEL;TYPE=CELL,VOICE,pref:${sanitizePhone(content.primaryPhone)}`);
  }

  if (content.secondaryPhone && !content.privacy?.hideSecondaryPhone) {
    lines.push(`TEL;TYPE=HOME,VOICE:${sanitizePhone(content.secondaryPhone)}`);
  }

  if (content.workPhone) {
    lines.push(`TEL;TYPE=WORK,VOICE:${sanitizePhone(content.workPhone)}`);
  }

  if (content.whatsappNumber) {
    // WhatsApp custom property and cell entry
    lines.push(`TEL;TYPE=WHATSAPP:${sanitizePhone(content.whatsappNumber)}`);
    lines.push(`X-SOCIALPROFILE;type=whatsapp:https://wa.me/${sanitizePhone(content.whatsappNumber).replace('+', '')}`);
  }

  if (content.email) {
    lines.push(`EMAIL;TYPE=INTERNET,pref:${escapeVCardText(content.email.trim())}`);
  }

  if (content.workEmail) {
    lines.push(`EMAIL;TYPE=INTERNET,WORK:${escapeVCardText(content.workEmail.trim())}`);
  }

  if (content.websiteUrl) {
    lines.push(`URL:${escapeVCardText(content.websiteUrl.trim())}`);
  }

  // Address
  if ((content.address || content.city || content.region || content.postalCode || content.country) && !content.privacy?.hideAddress) {
    const street = escapeVCardText(content.address || '');
    const city = escapeVCardText(content.city || '');
    const region = escapeVCardText(content.region || '');
    const postCode = escapeVCardText(content.postalCode || '');
    const country = escapeVCardText(content.country || '');
    lines.push(`ADR;TYPE=WORK,pref:;;${street};${city};${region};${postCode};${country}`);
  }

  // Geo GPS
  if (!content.privacy?.hideAddress && content.latitude != null && content.longitude != null) {
    lines.push(`GEO:${content.latitude};${content.longitude}`);
  }

  // Location Link / Maps
  if (!content.privacy?.hideAddress && content.locationLink) {
    lines.push(`URL;type=LOCATION:${escapeVCardText(content.locationLink.trim())}`);
  }

  // Slogan as TITLE suffix or NOTE
  let noteParts: string[] = [];
  if (content.professionalTitle) {
    noteParts.push(`Titre professionnel : ${content.professionalTitle}`);
  }
  if (content.acronym && content.acronymDesc) {
    noteParts.push(`${content.acronym} : ${content.acronymDesc}`);
  }
  if (content.slogan) {
    noteParts.push(`Devise / Slogan : ${content.slogan}`);
  }
  if (content.department) {
    noteParts.push(`Département : ${content.department}`);
  }
  if (content.bio) {
    noteParts.push(content.bio);
  }
  if (content.languagesSpoken && content.languagesSpoken.length > 0) {
    noteParts.push(`Langues : ${content.languagesSpoken.join(', ')}`);
  }
  if (content.availabilityHours) {
    noteParts.push(`Disponibilité : ${content.availabilityHours}`);
  }
  if (content.servicesOffered && content.servicesOffered.length > 0) {
    noteParts.push(`Services offerts : ${content.servicesOffered.join(', ')}`);
  }
  if (content.publicNotes) {
    noteParts.push(`Notes : ${content.publicNotes}`);
  }
  if (content.catalogUrl) {
    noteParts.push(`Catalogue : ${content.catalogUrl}`);
  }
  if (content.brochurePdfUrl) {
    noteParts.push(`Brochure : ${content.brochurePdfUrl}`);
  }
  if (content.bookingLink) {
    noteParts.push(`Réservation : ${content.bookingLink}`);
  }
  if (content.paymentLink) {
    noteParts.push(`Paiement : ${content.paymentLink}`);
  }
  if (!content.privacy?.hideAddress && content.locationLink) {
    noteParts.push(`Lien de localisation : ${content.locationLink.trim()}`);
  }
  if (content.otherInformation) {
    noteParts.push(`Autres informations : ${content.otherInformation.trim()}`);
  }
  if (content.operatingZone) {
    noteParts.push(`Zone d'intervention : ${content.operatingZone}`);
  }
  if (content.customFields && content.customFields.length > 0) {
    const extra = content.customFields
      .filter(f => !f.isPrivate)
      .map(f => `${f.label}: ${f.value}`)
      .join(' | ');
    if (extra) {
      noteParts.push(extra);
    }
  }

  if (noteParts.length > 0) {
    lines.push(`NOTE:${escapeVCardText(noteParts.join('\n'))}`);
  }

  // Social profiles as X-SOCIALPROFILE
  content.socialLinks?.forEach(s => {
    if (s.url) {
      lines.push(`X-SOCIALPROFILE;type=${escapeVCardText(s.platform)}:${escapeVCardText(s.url)}`);
    }
  });

  // Base64 Photo if present and compact
  if (content.photoUrl && content.photoUrl.startsWith('data:image/')) {
    const mimeMatch = content.photoUrl.match(/data:image\/([a-zA-Z]+);base64,/);
    if (mimeMatch) {
      const imgType = mimeMatch[1].toUpperCase();
      const base64Data = content.photoUrl.replace(/data:image\/[a-zA-Z]+;base64,/, '');
      // Include photo if under 200KB to prevent bloated vcards
      if (base64Data.length < 300000) {
        lines.push(`PHOTO;ENCODING=b;TYPE=${imgType === 'JPEG' ? 'JPEG' : 'PNG'}:${base64Data}`);
      }
    }
  }

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

/**
 * Trigger immediate browser download of the .vcf file
 */
export function downloadVCard(content: QRContent, filename?: string): void {
  const vcardStr = generateVCardString(content);
  const name = content.fullName || `${content.firstName || ''} ${content.lastName || ''}`.trim() || 'contact';
  const cleanFilename = (filename || `${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.vcf`).replace(/\s+/g, '_');

  const blob = new Blob([vcardStr], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', cleanFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeVCardText(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}
