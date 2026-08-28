import { 
  QRCodeItem, 
  ScanEvent, 
  ClientProfile, 
  HistoryLogItem, 
  DesignerProfile, 
  CardModelId, 
  CardFormat 
} from '../types/qr';
import { 
  CANAAN_SERVICES_LOGO, 
  AGB_ENGINEERING_LOGO, 
  ICG_AFRICA_LOGO, 
  SAINTE_VICTOIRE_LOGO, 
  getCompanyDefaultLogo 
} from './defaultLogos';
import { db, auth } from '../firebase';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

const CARDS_STORAGE_KEY = 'smart_qr_items_v2';
const CLIENTS_STORAGE_KEY = 'smart_qr_clients_v2';
const SCANS_STORAGE_KEY = 'smart_qr_scans_v2';
const HISTORY_STORAGE_KEY = 'smart_qr_history_v2';
const DESIGNER_STORAGE_KEY = 'smart_qr_designer_v2';

export const DEFAULT_DESIGNER_PROFILE: DesignerProfile = {
  name: 'Gilles Brice ATSÉ',
  agencyName: 'AGB Studio & Conception',
  logoUrl: AGB_ENGINEERING_LOGO,
  phone: '+225 01 04 00 00 00',
  whatsapp: '+225 01 04 00 00 00',
  email: 'atsegillesbrice@gmail.com',
  website: 'https://agb-solutions.ci',
  address: 'Cocody Riviera, Abidjan, Côte d\'Ivoire',
  slogan: 'Conception professionnelle de cartes de visite physiques connectées & fiches vCard sur mesure',
  defaultFormat: '85x55'
};

export const INITIAL_CLIENTS: ClientProfile[] = [
  {
    id: 'client_001',
    clientNumber: 'CLT-2026-0001',
    firstName: 'Gilles Brice',
    lastName: 'ATSÉ',
    fullName: 'Gilles Brice ATSÉ',
    company: 'AGB',
    commercialName: 'AGB Digital Engineering',
    jobTitle: 'Concepteur d\'applications mobiles & Web',
    industry: 'Technologies & Ingénierie Logicielle',
    photoUrl: '',
    logoUrl: AGB_ENGINEERING_LOGO,
    primaryPhone: '+225 01 04 00 00 00',
    secondaryPhone: '+225 07 97 00 00 00',
    whatsappNumber: '+225 01 04 00 00 00',
    workPhone: '+225 27 22 00 00 00',
    email: 'atsegillesbrice@gmail.com',
    workEmail: 'contact@agb-solutions.ci',
    websiteUrl: 'https://agb-solutions.ci',
    address: 'Cocody Riviera 3',
    commune: 'Cocody',
    neighborhood: 'Riviera Bonoumin',
    city: 'Abidjan',
    country: 'Côte d\'Ivoire',
    locationLink: 'https://maps.google.com/?q=5.3599,-3.9870',
    slogan: 'L\'innovation technologique et le développement sur mesure au service de vos projets',
    bio: 'Conception et ingénierie d\'applications mobiles iOS & Android, architectures Web performantes, logiciels de gestion d\'entreprise et solutions SaaS scalables.',
    servicesList: [
      'Applications mobiles (iOS & Android)',
      'Applications Web & SaaS sur mesure',
      'Logiciels de gestion ERP & CRM',
      'Cartes de visite connectées vCard',
      'Intégration d\'API & Systèmes Cloud'
    ],
    productsList: [
      'Pack Carte Connectée Pro AGB',
      'Audit & Architecture Applicative'
    ],
    businessTaxId: 'CC-2409817-A',
    businessRegisterNumber: 'CI-ABJ-2024-B-12849',
    socialLinks: [
      { id: 's1', platform: 'whatsapp', url: 'https://wa.me/2250104000000', displayOrder: 1 },
      { id: 's2', platform: 'linkedin', url: 'https://linkedin.com/in/gilles-brice-atse', displayOrder: 2 },
      { id: 's3', platform: 'github', url: 'https://github.com/atsegillesbrice', displayOrder: 3 },
      { id: 's4', platform: 'website', url: 'https://agb-solutions.ci', displayOrder: 4 },
      { id: 's5', platform: 'facebook', url: 'https://facebook.com', displayOrder: 5 }
    ],
    internalNotes: 'Client VIP et Fondateur. Carte imprimée sur support PVC Noir Carbone Mat 85x55mm.',
    associatedCardIds: ['qr_demo_01'],
    createdAt: '2026-08-10T08:00:00.000Z',
    updatedAt: '2026-08-21T08:00:00.000Z'
  },
  {
    id: 'client_002',
    clientNumber: 'CLT-2026-0002',
    firstName: 'Sarah',
    lastName: 'KOUASSI',
    fullName: 'Sarah KOUASSI',
    company: 'Ivoire Consulting Group',
    commercialName: 'ICG Africa',
    jobTitle: 'Directrice Générale & Stratégie',
    industry: 'Conseil en Stratégie & Finance',
    photoUrl: '',
    logoUrl: ICG_AFRICA_LOGO,
    primaryPhone: '+225 07 45 12 34 56',
    secondaryPhone: '+225 01 02 03 04 05',
    whatsappNumber: '+225 07 45 12 34 56',
    email: 'sarah.kouassi@ivoire-consulting.ci',
    websiteUrl: 'https://ivoire-consulting.ci',
    address: 'Boulevard de la République',
    commune: 'Plateau',
    neighborhood: 'Centre des Affaires',
    city: 'Abidjan',
    country: 'Côte d\'Ivoire',
    locationLink: 'https://maps.google.com/?q=5.3261,-4.0200',
    slogan: 'L\'excellence stratégique pour transformer vos investissements en réussites durables',
    bio: 'Cabinet d\'accompagnement en gouvernance, restructuration financière, levée de fonds et transformation des organisations en Afrique.',
    servicesList: [
      'Gouvernance & Management Stratégique',
      'Conseil Financier & Levée de fonds',
      'Audit Organisationnel & RH'
    ],
    businessTaxId: 'CC-1904532-B',
    businessRegisterNumber: 'CI-ABJ-2021-M-08941',
    socialLinks: [
      { id: 's21', platform: 'whatsapp', url: 'https://wa.me/2250745123456', displayOrder: 1 },
      { id: 's22', platform: 'linkedin', url: 'https://linkedin.com', displayOrder: 2 },
      { id: 's23', platform: 'website', url: 'https://ivoire-consulting.ci', displayOrder: 3 }
    ],
    internalNotes: 'Carte de visite Recto/Verso avec finition Bleu Nuit Prestige. Commande de 200 exemplaires.',
    associatedCardIds: ['qr_demo_02'],
    createdAt: '2026-08-15T10:00:00.000Z',
    updatedAt: '2026-08-20T14:30:00.000Z'
  },
  {
    id: 'client_003',
    clientNumber: 'CLT-2026-0003',
    firstName: 'Dr. Marc',
    lastName: 'BAMBA',
    fullName: 'Dr. Marc BAMBA',
    company: 'Polyclinique Sainte-Victoire',
    commercialName: 'Centre Médical Sainte-Victoire',
    jobTitle: 'Médecin Cardiologue & Fondateur',
    industry: 'Santé & Médecine Spécialisée',
    photoUrl: '',
    logoUrl: SAINTE_VICTOIRE_LOGO,
    primaryPhone: '+225 05 88 99 00 11',
    secondaryPhone: '+225 27 21 00 11 22',
    whatsappNumber: '+225 05 88 99 00 11',
    email: 'secretariat@saintevictoire-sante.ci',
    websiteUrl: 'https://saintevictoire-sante.ci',
    address: 'Rue des Jardins, Deux Plateaux',
    commune: 'Cocody',
    neighborhood: 'Vallon',
    city: 'Abidjan',
    country: 'Côte d\'Ivoire',
    locationLink: 'https://maps.google.com/?q=5.3700,-3.9900',
    slogan: 'L\'expertise médicale et l\'écoute bienveillante au cœur de votre santé',
    bio: 'Consultations de cardiologie, bilans cardiovasculaires avancés, urgences médicales et hospitalisation de jour.',
    servicesList: [
      'Cardiologie & Échographie cardiaque',
      'Bilan de santé préventif',
      'Urgences 24h/24 & Soins continus'
    ],
    socialLinks: [
      { id: 's31', platform: 'whatsapp', url: 'https://wa.me/2250588990011', displayOrder: 1 },
      { id: 's32', platform: 'website', url: 'https://saintevictoire-sante.ci', displayOrder: 2 }
    ],
    internalNotes: 'Impression fond Blanc Épuré avec QR Code central haute lisibilité. Livré.',
    associatedCardIds: ['qr_demo_03'],
    createdAt: '2026-08-18T09:15:00.000Z',
    updatedAt: '2026-08-21T11:00:00.000Z'
  },
  {
    id: 'client_004',
    clientNumber: 'CLT-2026-0004',
    firstName: 'Richmond',
    lastName: 'DONGO',
    fullName: 'Richmond DONGO',
    company: 'Canaan Services',
    commercialName: 'Canaan Services',
    jobTitle: 'Responsable commercial',
    industry: 'Imprimerie & Gadgets Publicitaires',
    photoUrl: '',
    logoUrl: CANAAN_SERVICES_LOGO,
    primaryPhone: '+225 07 08 07 66 90',
    secondaryPhone: '+225 01 71 29 47 67',
    whatsappNumber: '+225 07 08 07 66 90',
    workPhone: '+225 01 71 29 47 67',
    email: 'Dongorichmond94@gmail.com',
    websiteUrl: '',
    address: 'Yopougon Saint André',
    commune: 'Yopougon',
    neighborhood: 'Saint André',
    city: 'Abidjan',
    country: 'Côte d\'Ivoire',
    operatingZone: 'Côte d\'Ivoire et Internationales',
    locationLink: 'https://maps.google.com/?q=Yopougon+Saint+Andre+Abidjan',
    slogan: 'Donner vie à vos idées',
    bio: 'Canaan Services : Votre partenaire d\'excellence pour l\'imprimerie moderne, les gadgets publicitaires et les prestations diverses en Côte d\'Ivoire et à l\'international.',
    servicesList: [
      'Imprimerie professionnelle (Flyers, Bâches, Affiches, Dépliants, Roll-up)',
      'Gadgets publicitaires personnalisés (T-shirts, Casquettes, Clés USB, Stylos, Tasses)',
      'Prestations de services diverses & Accompagnement commercial'
    ],
    openingHours: [
      { day: 'Lundi', isOpen: true, openTime: '08:00', closeTime: '19:00' },
      { day: 'Mardi', isOpen: true, openTime: '08:00', closeTime: '19:00' },
      { day: 'Mercredi', isOpen: true, openTime: '08:00', closeTime: '19:00' },
      { day: 'Jeudi', isOpen: true, openTime: '08:00', closeTime: '19:00' },
      { day: 'Vendredi', isOpen: true, openTime: '08:00', closeTime: '19:00' },
      { day: 'Samedi', isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { day: 'Dimanche', isOpen: false, openTime: 'Fermé', closeTime: 'Fermé' }
    ],
    socialLinks: [
      { id: 's41', platform: 'whatsapp', url: 'https://wa.me/2250708076690', displayOrder: 1 },
      { id: 's42', platform: 'facebook', url: 'https://facebook.com', displayOrder: 2 },
      { id: 's43', platform: 'other', url: 'mailto:Dongorichmond94@gmail.com', displayOrder: 3 }
    ],
    internalNotes: 'Client Canaan Services. Carte connectée vCard Recto-Verso 85x55 mm haute qualité.',
    associatedCardIds: ['qr_canaan_01'],
    createdAt: '2026-08-23T08:00:00.000Z',
    updatedAt: '2026-08-23T08:00:00.000Z'
  }
];

export const INITIAL_QR_ITEMS: QRCodeItem[] = [
  {
    id: 'qr_canaan_01',
    cardNumber: 'CARD-2026-0004',
    publicId: 'CANAAN01',
    clientId: 'client_004',
    title: 'Richmond DONGO — Canaan Services',
    type: 'vcard',
    mode: 'dynamic',
    status: 'active',
    modelId: 'model_luxury',
    cardFormat: '85x55',
    createdAt: '2026-08-23T08:00:00.000Z',
    updatedAt: '2026-08-23T08:00:00.000Z',
    scanCount: 18,
    lastScannedAt: '2026-08-23T04:15:00.000Z',
    tags: ['Imprimerie', 'Gadgets', 'Commercial', 'Canaan Services', 'Yopougon'],
    content: {
      firstName: 'Richmond',
      lastName: 'DONGO',
      fullName: 'Richmond DONGO',
      jobTitle: 'Responsable commercial',
      company: 'Canaan Services',
      commercialName: 'Canaan Services',
      department: 'Direction Commerciale',
      industry: 'Imprimerie & Gadgets Publicitaires',
      slogan: 'Donner vie à vos idées',
      bio: 'Canaan Services vous accompagne pour donner vie à vos idées : imprimerie professionnelle, gadgets publicitaires personnalisés et prestations diverses en Côte d\'Ivoire et à l\'international.',
      photoUrl: '',
      logoUrl: CANAAN_SERVICES_LOGO,
      primaryPhone: '+225 07 08 07 66 90',
      secondaryPhone: '+225 01 71 29 47 67',
      whatsappNumber: '+225 07 08 07 66 90',
      workPhone: '+225 01 71 29 47 67',
      email: 'Dongorichmond94@gmail.com',
      workEmail: 'Dongorichmond94@gmail.com',
      websiteUrl: '',
      address: 'Yopougon Saint André',
      commune: 'Yopougon',
      neighborhood: 'Saint André',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      operatingZone: 'Côte d\'Ivoire et Internationales',
      locationLink: 'https://maps.google.com/?q=Yopougon+Saint+Andre+Abidjan',
      googleMapsUrl: 'https://maps.google.com/?q=Yopougon+Saint+Andre+Abidjan',
      businessRegisterNumber: '',
      businessTaxId: '',
      servicesList: [
        'Imprimerie (Flyers, Bâches, Affiches, Dépliants, Roll-up)',
        'Gadgets publicitaires (T-shirts, Stylos, Porte-clés, Tasses, Calendriers)',
        'Prestations diverses de communication & Support commercial'
      ],
      openingHours: [
        { day: 'Lundi', isOpen: true, openTime: '08:00', closeTime: '19:00' },
        { day: 'Mardi', isOpen: true, openTime: '08:00', closeTime: '19:00' },
        { day: 'Mercredi', isOpen: true, openTime: '08:00', closeTime: '19:00' },
        { day: 'Jeudi', isOpen: true, openTime: '08:00', closeTime: '19:00' },
        { day: 'Vendredi', isOpen: true, openTime: '08:00', closeTime: '19:00' },
        { day: 'Samedi', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { day: 'Dimanche', isOpen: false, openTime: 'Fermé', closeTime: 'Fermé' }
      ],
      socialLinks: [
        { id: 's41', platform: 'whatsapp', url: 'https://wa.me/2250708076690', displayOrder: 1 },
        { id: 's42', platform: 'facebook', url: 'https://facebook.com', displayOrder: 2 },
        { id: 's43', platform: 'other', url: 'mailto:Dongorichmond94@gmail.com', displayOrder: 3 }
      ],
      customFields: [
        { id: 'c1', label: 'Horaires d\'ouverture', value: 'Lun - Ven: 08h00 - 19h00 | Sam: 09h00 - 18h00' },
        { id: 'c2', label: 'Zone d\'intervention', value: 'Côte d\'Ivoire et Internationales' }
      ],
      otherInformation: 'Horaires d\'ouverture : du lundi au vendredi de 08h00 à 19h00 et le samedi de 09h00 à 18h00.',
      emergencyContactNote: '+225 07 08 07 66 90 (WhatsApp Direct)',
      internalNotes: 'Carte de visite connectée haute définition pour Canaan Services. Format 85x55mm.',
      privacy: {
        hideAddress: false,
        hideSecondaryPhone: false,
        hideTaxInfo: false
      }
    },
    styling: {
      fgColor: '#0f172a',
      bgColor: '#ffffff',
      transparentBg: false,
      moduleStyle: 'rounded',
      eyeStyle: 'rounded',
      eyeColor: '#d97706',
      errorCorrectionLevel: 'H',
      margin: 3,
      size: 320,
      cardBackgroundTheme: 'emerald_luxe',
      logoUrl: CANAAN_SERVICES_LOGO,
      logoSizeRatio: 0.22,
      logoBackground: true,
      logoBgColor: '#ffffff',
      logoBorderRadius: 8,
      bottomText: 'SCANNEZ POUR CONTACTER CANAAN SERVICES',
      bottomTextColor: '#0f172a',
      bottomTextBg: '#fef3c7',
      cardFormat: '85x55'
    }
  },
  {
    id: 'qr_demo_01',
    cardNumber: 'CARD-2026-0001',
    publicId: 'AGB2026X',
    clientId: 'client_001',
    title: 'Gilles Brice ATSÉ — Concepteur d\'applications',
    type: 'vcard',
    mode: 'dynamic',
    status: 'active',
    modelId: 'model_luxury',
    cardFormat: '85x55',
    createdAt: '2026-08-10T08:00:00.000Z',
    updatedAt: '2026-08-21T08:00:00.000Z',
    scanCount: 184,
    lastScannedAt: '2026-08-21T05:30:00.000Z',
    tags: ['Carte Pro', 'Développeur', 'AGB', 'VIP'],
    content: {
      firstName: 'Gilles Brice',
      lastName: 'ATSÉ',
      fullName: 'Gilles Brice ATSÉ',
      jobTitle: 'Concepteur d\'applications mobiles & solutions Web sur mesure',
      company: 'AGB',
      commercialName: 'AGB Digital Engineering',
      department: 'Ingénierie Logicielle & Conseil',
      industry: 'Technologies de l\'Information & Digital',
      slogan: 'L\'innovation technologique et le développement sur mesure au service de vos projets',
      bio: 'Conception et ingénierie d\'applications mobiles iOS & Android, architectures Web performantes, logiciels de gestion d\'entreprise et solutions SaaS scalables.',
      photoUrl: '',
      logoUrl: AGB_ENGINEERING_LOGO,
      primaryPhone: '+225 01 04 00 00 00',
      secondaryPhone: '+225 07 97 00 00 00',
      whatsappNumber: '+225 01 04 00 00 00',
      workPhone: '+225 27 22 00 00 00',
      email: 'atsegillesbrice@gmail.com',
      workEmail: 'contact@agb-solutions.ci',
      websiteUrl: 'https://agb-solutions.ci',
      address: 'Cocody Riviera 3',
      commune: 'Cocody',
      neighborhood: 'Riviera Bonoumin',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      operatingZone: 'Abidjan, Côte d\'Ivoire & International (Afrique de l\'Ouest, Remote)',
      latitude: 5.3599,
      longitude: -3.9870,
      locationLink: 'https://maps.google.com/?q=5.3599,-3.9870',
      googleMapsUrl: 'https://maps.google.com/?q=5.3599,-3.9870',
      businessRegisterNumber: 'CI-ABJ-2024-B-12849',
      businessTaxId: 'CC-2409817-A',
      servicesList: [
        'Applications mobiles (iOS & Android)',
        'Applications Web sur mesure',
        'Logiciels de gestion & ERP/CRM',
        'Cartes de visite connectées vCard',
        'Solutions SaaS & Cloud'
      ],
      productsList: [
        'Pack Carte Connectée Pro AGB'
      ],
      socialLinks: [
        { id: 's1', platform: 'whatsapp', url: 'https://wa.me/2250104000000', displayOrder: 1 },
        { id: 's2', platform: 'linkedin', url: 'https://linkedin.com/in/gilles-brice-atse', displayOrder: 2 },
        { id: 's3', platform: 'github', url: 'https://github.com/atsegillesbrice', displayOrder: 3 },
        { id: 's4', platform: 'website', url: 'https://agb-solutions.ci', displayOrder: 4 },
        { id: 's5', platform: 'facebook', url: 'https://facebook.com', displayOrder: 5 }
      ],
      customFields: [
        { id: 'c1', label: 'Stack Technique', value: 'Flutter, React Native, React/Next.js, Node.js, PostgreSQL, Cloud' },
        { id: 'c2', label: 'Disponibilité', value: 'Conseil, missions & projets sur mesure' }
      ],
      otherInformation: 'Rendez-vous et consultations sur confirmation préalable.',
      emergencyContactNote: '+225 01 04 00 00 00',
      internalNotes: 'Client VIP. Carte imprimée en finition Noir Carbone Mat.',
      privacy: {
        hideAddress: false,
        hideSecondaryPhone: false,
        hideTaxInfo: false
      }
    },
    styling: {
      fgColor: '#0f172a',
      bgColor: '#ffffff',
      transparentBg: false,
      moduleStyle: 'rounded',
      eyeStyle: 'rounded',
      eyeColor: '#2563eb',
      errorCorrectionLevel: 'H',
      margin: 3,
      size: 320,
      cardBackgroundTheme: 'matte_dark',
      logoUrl: AGB_ENGINEERING_LOGO,
      logoSizeRatio: 0.22,
      logoBackground: true,
      logoBgColor: '#ffffff',
      logoBorderRadius: 8,
      bottomText: 'SCANNEZ POUR MA FICHE COMPLÈTE',
      bottomTextColor: '#0f172a',
      bottomTextBg: '#f1f5f9',
      cardFormat: '85x55'
    }
  },
  {
    id: 'qr_demo_02',
    cardNumber: 'CARD-2026-0002',
    publicId: 'ICG9982S',
    clientId: 'client_002',
    title: 'Sarah KOUASSI — Ivoire Consulting Group',
    type: 'vcard',
    mode: 'dynamic',
    status: 'active',
    modelId: 'model_corporate',
    cardFormat: '85x55',
    createdAt: '2026-08-15T10:00:00.000Z',
    updatedAt: '2026-08-20T14:30:00.000Z',
    scanCount: 92,
    lastScannedAt: '2026-08-21T02:15:00.000Z',
    tags: ['Conseil', 'Finance', 'Corporate'],
    content: {
      firstName: 'Sarah',
      lastName: 'KOUASSI',
      fullName: 'Sarah KOUASSI',
      jobTitle: 'Directrice Générale & Stratégie',
      company: 'Ivoire Consulting Group',
      commercialName: 'ICG Africa',
      industry: 'Conseil en Stratégie & Finance',
      slogan: 'L\'excellence stratégique pour transformer vos investissements en réussites durables',
      bio: 'Cabinet d\'accompagnement en gouvernance, restructuration financière, levée de fonds et transformation des organisations en Afrique.',
      photoUrl: '',
      logoUrl: ICG_AFRICA_LOGO,
      primaryPhone: '+225 07 45 12 34 56',
      secondaryPhone: '+225 01 02 03 04 05',
      whatsappNumber: '+225 07 45 12 34 56',
      email: 'sarah.kouassi@ivoire-consulting.ci',
      websiteUrl: 'https://ivoire-consulting.ci',
      address: 'Boulevard de la République, Immeuble Horizon',
      commune: 'Plateau',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      locationLink: 'https://maps.google.com/?q=5.3261,-4.0200',
      businessRegisterNumber: 'CI-ABJ-2021-M-08941',
      businessTaxId: 'CC-1904532-B',
      servicesList: [
        'Gouvernance d\'entreprise',
        'Conseil financier & Levée de fonds',
        'Audit & Transformation'
      ],
      socialLinks: [
        { id: 's21', platform: 'whatsapp', url: 'https://wa.me/2250745123456', displayOrder: 1 },
        { id: 's22', platform: 'linkedin', url: 'https://linkedin.com', displayOrder: 2 },
        { id: 's23', platform: 'website', url: 'https://ivoire-consulting.ci', displayOrder: 3 }
      ],
      customFields: [],
      otherInformation: 'Permanence du cabinet du lundi au vendredi de 8h30 à 18h00.',
      privacy: { hideAddress: false }
    },
    styling: {
      fgColor: '#0f172a',
      bgColor: '#ffffff',
      transparentBg: false,
      moduleStyle: 'classy',
      eyeStyle: 'leaf',
      eyeColor: '#0a192f',
      errorCorrectionLevel: 'H',
      margin: 3,
      size: 320,
      cardBackgroundTheme: 'navy_prestige',
      logoUrl: ICG_AFRICA_LOGO,
      logoSizeRatio: 0.2,
      logoBackground: true,
      cardFormat: '85x55'
    }
  },
  {
    id: 'qr_demo_03',
    cardNumber: 'CARD-2026-0003',
    publicId: 'MED4411B',
    clientId: 'client_003',
    title: 'Dr. Marc BAMBA — Polyclinique Sainte-Victoire',
    type: 'vcard',
    mode: 'dynamic',
    status: 'active',
    modelId: 'model_center_qr',
    cardFormat: '85x55',
    createdAt: '2026-08-18T09:15:00.000Z',
    updatedAt: '2026-08-21T11:00:00.000Z',
    scanCount: 61,
    lastScannedAt: '2026-08-21T04:45:00.000Z',
    tags: ['Médical', 'Cardiologie', 'Clinique'],
    content: {
      firstName: 'Dr. Marc',
      lastName: 'BAMBA',
      fullName: 'Dr. Marc BAMBA',
      jobTitle: 'Médecin Cardiologue & Fondateur',
      company: 'Polyclinique Sainte-Victoire',
      industry: 'Santé & Cardiologie',
      slogan: 'L\'expertise médicale et l\'écoute bienveillante au cœur de votre santé',
      bio: 'Consultations de cardiologie, bilans cardiovasculaires avancés, urgences médicales et hospitalisation de jour.',
      photoUrl: '',
      logoUrl: SAINTE_VICTOIRE_LOGO,
      primaryPhone: '+225 05 88 99 00 11',
      secondaryPhone: '+225 27 21 00 11 22',
      whatsappNumber: '+225 05 88 99 00 11',
      email: 'secretariat@saintevictoire-sante.ci',
      websiteUrl: 'https://saintevictoire-sante.ci',
      address: 'Rue des Jardins, Deux Plateaux Vallon',
      commune: 'Cocody',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      locationLink: 'https://maps.google.com/?q=5.3700,-3.9900',
      servicesList: [
        'Cardiologie & Échographie',
        'Bilan cardiovasculaire préventif',
        'Urgences & Soins continus'
      ],
      socialLinks: [
        { id: 's31', platform: 'whatsapp', url: 'https://wa.me/2250588990011', displayOrder: 1 },
        { id: 's32', platform: 'website', url: 'https://saintevictoire-sante.ci', displayOrder: 2 }
      ],
      customFields: [],
      otherInformation: 'Consultations sur rendez-vous du lundi au samedi.',
      privacy: { hideAddress: false }
    },
    styling: {
      fgColor: '#0f172a',
      bgColor: '#ffffff',
      transparentBg: false,
      moduleStyle: 'rounded',
      eyeStyle: 'rounded',
      eyeColor: '#064e3b',
      errorCorrectionLevel: 'H',
      margin: 3,
      size: 320,
      cardBackgroundTheme: 'white_classic',
      logoUrl: SAINTE_VICTOIRE_LOGO,
      logoSizeRatio: 0.2,
      logoBackground: true,
      cardFormat: '85x55'
    }
  },
  {
    id: 'qr_demo_book',
    cardNumber: 'AGB-BOOK-000002',
    publicId: 'AGB-BOOK-002',
    clientId: 'client_001',
    title: 'Livre : L\'Ingénierie Mobile & Cloud Moderne',
    type: 'book',
    mode: 'dynamic',
    status: 'active',
    modelId: 'model_luxury',
    cardFormat: '85x55',
    createdAt: '2026-08-19T10:00:00.000Z',
    updatedAt: '2026-08-21T12:00:00.000Z',
    scanCount: 142,
    lastScannedAt: '2026-08-21T06:10:00.000Z',
    tags: ['Livre', 'Auteur', 'Ingénierie', 'Édition'],
    content: {
      bookTitle: 'L\'Ingénierie Mobile & Cloud Moderne',
      bookSubtitle: 'Architectures pérennes, Clean Architecture & Systèmes distribués',
      bookAuthor: 'Gilles Brice ATSÉ',
      bookPublisher: 'Éditions AGB Ingénierie',
      bookIsbn: '978-2-901234-56-7',
      bookYear: '2026',
      bookGenre: 'Informatique & Technologies',
      bookCategory: 'Génie Logiciel & Architecture',
      bookSummary: 'Un guide de référence complet pour concevoir, développer et déployer des applications mobiles et Web robustes, sécurisées et scalables.',
      bookDescription: 'Cet ouvrage aborde en profondeur les principes de la Clean Architecture, le pattern Repository, l\'injection de dépendances, la gestion d\'état réactive et les stratégies de déploiement Cloud.',
      bookPrice: '15 000 FCFA (25 €)',
      bookPages: '348 pages',
      bookLanguage: 'Français',
      bookCoverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      bookBuyUrl: 'https://agb-solutions.ci/librairie',
      bookWebsite: 'https://agb-solutions.ci',
      socialLinks: [
        { id: 'sb1', platform: 'whatsapp', url: 'https://wa.me/2250104000000', displayOrder: 1 },
        { id: 'sb2', platform: 'website', url: 'https://agb-solutions.ci', displayOrder: 2 }
      ],
      customFields: [],
      privacy: {}
    },
    styling: {
      fgColor: '#0f172a',
      bgColor: '#ffffff',
      transparentBg: false,
      moduleStyle: 'rounded',
      eyeStyle: 'rounded',
      eyeColor: '#4338ca',
      errorCorrectionLevel: 'H',
      margin: 3,
      size: 320,
      cardBackgroundTheme: 'matte_dark',
      logoUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80',
      logoSizeRatio: 0.22,
      logoBackground: true,
      cardFormat: '85x55'
    }
  },
  {
    id: 'qr_demo_invitation',
    cardNumber: 'AGB-INV-000003',
    publicId: 'AGB-INV-003',
    clientId: 'client_001',
    title: 'Invitation : Sommet Tech & Innovation Abidjan 2026',
    type: 'invitation',
    mode: 'dynamic',
    status: 'active',
    modelId: 'model_luxury',
    cardFormat: '85x55',
    createdAt: '2026-08-20T08:00:00.000Z',
    updatedAt: '2026-08-21T14:00:00.000Z',
    scanCount: 88,
    lastScannedAt: '2026-08-21T07:20:00.000Z',
    tags: ['Invitation', 'Événement', 'VIP', 'Gala'],
    content: {
      invitationEventType: 'Gala & Conférence Prestige',
      invitationTitle: 'Sommet Annuel de l\'Innovation & de l\'Ingénierie Logicielle',
      invitationHost: 'Gilles Brice ATSÉ & AGB Studio',
      invitationGuest: 'Invité d\'Honneur',
      invitationDate: 'Vendredi 18 Septembre 2026',
      invitationTime: '18h30 - 23h00 (Accueil cocktail dès 18h00)',
      invitationLocationName: 'Sofitel Hôtel Ivoire, Salle des Fêtes',
      invitationAddress: 'Boulevard Hassan II, Cocody, Abidjan',
      invitationMessage: 'Nous avons l\'honneur de vous convier à cette soirée d\'exception dédiée aux avancées technologiques majeures et au networking des leaders de la tech africaine.',
      invitationPhone: '+225 01 04 00 00 00',
      invitationWhatsapp: '+225 01 04 00 00 00',
      invitationImageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
      invitationMapsUrl: 'https://maps.google.com/?q=5.3283,-4.0044',
      socialLinks: [
        { id: 'si1', platform: 'whatsapp', url: 'https://wa.me/2250104000000', displayOrder: 1 }
      ],
      customFields: [],
      privacy: {}
    },
    styling: {
      fgColor: '#0f172a',
      bgColor: '#ffffff',
      transparentBg: false,
      moduleStyle: 'rounded',
      eyeStyle: 'rounded',
      eyeColor: '#d97706',
      errorCorrectionLevel: 'H',
      margin: 3,
      size: 320,
      cardBackgroundTheme: 'cream_clean',
      cardFormat: '85x55'
    }
  },
  {
    id: 'qr_demo_shop',
    cardNumber: 'AGB-SHOP-000004',
    publicId: 'AGB-SHOP-004',
    clientId: 'client_002',
    title: 'Commerce : Boutique & Concept Store Riviera',
    type: 'shop',
    mode: 'dynamic',
    status: 'active',
    modelId: 'model_modern',
    cardFormat: '85x55',
    createdAt: '2026-08-17T11:00:00.000Z',
    updatedAt: '2026-08-21T09:30:00.000Z',
    scanCount: 115,
    lastScannedAt: '2026-08-21T08:15:00.000Z',
    tags: ['Boutique', 'Commerce', 'Horaires', 'Cocody'],
    content: {
      shopName: 'Prestige Concept Store & Café',
      shopDescription: 'Boutique exclusive d\'accessoires de luxe, maroquinerie d\'artisanat fin et espace café de spécialité.',
      address: 'Carrefour Bonoumin, Riviera 3',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      primaryPhone: '+225 27 22 45 67 89',
      whatsappNumber: '+225 07 88 99 00 11',
      email: 'contact@prestige-concept.ci',
      websiteUrl: 'https://prestige-concept.ci',
      shopMapsUrl: 'https://maps.google.com/?q=5.3599,-3.9870',
      shopWazeUrl: 'https://waze.com/ul?q=5.3599,-3.9870',
      shopServices: [
        'Vente en boutique & Conseil personnalisé',
        'Commandes sur mesure & Emballages cadeaux',
        'Service après-vente & Garantie 2 ans',
        'Livraison express Abidjan en 2h'
      ],
      shopProducts: [
        'Maroquinerie en cuir véritable',
        'Accessoires connectés & Cartes vCard prestige',
        'Café pure origine torréfié localement'
      ],
      shopOpeningHours: [
        { day: 'Lundi', isOpen: true, openTime: '08:30', closeTime: '19:30' },
        { day: 'Mardi', isOpen: true, openTime: '08:30', closeTime: '19:30' },
        { day: 'Mercredi', isOpen: true, openTime: '08:30', closeTime: '19:30' },
        { day: 'Jeudi', isOpen: true, openTime: '08:30', closeTime: '19:30' },
        { day: 'Vendredi', isOpen: true, openTime: '08:30', closeTime: '20:00' },
        { day: 'Samedi', isOpen: true, openTime: '09:00', closeTime: '20:00' },
        { day: 'Dimanche', isOpen: true, openTime: '10:00', closeTime: '17:00' },
      ],
      photoUrl: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=600&auto=format&fit=crop&q=80',
      socialLinks: [
        { id: 'ss1', platform: 'whatsapp', url: 'https://wa.me/2250788990011', displayOrder: 1 },
        { id: 'ss2', platform: 'instagram', url: 'https://instagram.com', displayOrder: 2 }
      ],
      customFields: [],
      privacy: {}
    },
    styling: {
      fgColor: '#0f172a',
      bgColor: '#ffffff',
      transparentBg: false,
      moduleStyle: 'rounded',
      eyeStyle: 'rounded',
      eyeColor: '#059669',
      errorCorrectionLevel: 'H',
      margin: 3,
      size: 320,
      cardBackgroundTheme: 'emerald_luxe',
      cardFormat: '85x55'
    }
  },
  {
    id: 'qr_demo_loc',
    cardNumber: 'AGB-LOC-000005',
    publicId: 'AGB-LOC-005',
    clientId: 'client_001',
    title: 'Localisation : Siège & Atelier AGB Studio Riviera',
    type: 'location',
    mode: 'dynamic',
    status: 'active',
    modelId: 'model_modern',
    cardFormat: '85x55',
    createdAt: '2026-08-16T12:00:00.000Z',
    updatedAt: '2026-08-21T15:00:00.000Z',
    scanCount: 195,
    lastScannedAt: '2026-08-21T09:00:00.000Z',
    tags: ['Localisation', 'GPS', 'Itinéraire', 'Maps'],
    content: {
      locationPlaceName: 'Atelier & Siège AGB Digital Studio',
      locationShopName: 'AGB Digital Engineering',
      locationAddress: 'Boulevard François Mitterrand, Riviera 3',
      locationCity: 'Abidjan',
      locationCommune: 'Cocody',
      locationNeighborhood: 'Riviera Bonoumin',
      locationLatitude: 5.3599,
      locationLongitude: -3.9870,
      locationGoogleMapsUrl: 'https://maps.google.com/?q=5.3599,-3.9870',
      locationWazeUrl: 'https://waze.com/ul?q=5.3599,-3.9870',
      locationPhone: '+225 01 04 00 00 00',
      locationWhatsapp: '+225 01 04 00 00 00',
      locationPhotoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80',
      socialLinks: [
        { id: 'sl1', platform: 'whatsapp', url: 'https://wa.me/2250104000000', displayOrder: 1 }
      ],
      customFields: [],
      privacy: {}
    },
    styling: {
      fgColor: '#0f172a',
      bgColor: '#ffffff',
      transparentBg: false,
      moduleStyle: 'rounded',
      eyeStyle: 'rounded',
      eyeColor: '#2563eb',
      errorCorrectionLevel: 'H',
      margin: 3,
      size: 320,
      cardBackgroundTheme: 'white_classic',
      cardFormat: '85x55'
    }
  }
];

export const INITIAL_HISTORY: HistoryLogItem[] = [
  {
    id: 'hist_01',
    timestamp: '2026-08-21T08:00:00.000Z',
    action: 'update_card',
    title: 'Mise à jour coordonnées',
    details: 'Ajout du lien de localisation GPS et note d\'urgence sur la carte AGB2026X',
    clientId: 'client_001',
    cardId: 'qr_demo_01'
  },
  {
    id: 'hist_02',
    timestamp: '2026-08-20T14:30:00.000Z',
    action: 'print_card',
    title: 'Impression Planche 8x Cartes A4',
    details: 'Exportation PDF et tirage d\'impression pour Sarah KOUASSI (ICG Africa)',
    clientId: 'client_002',
    cardId: 'qr_demo_02'
  },
  {
    id: 'hist_03',
    timestamp: '2026-08-18T09:15:00.000Z',
    action: 'create_card',
    title: 'Création nouvelle carte Dr. Marc BAMBA',
    details: 'Attribution du numéro CARD-2026-0003 et du slug sécurisé MED4411B',
    clientId: 'client_003',
    cardId: 'qr_demo_03'
  }
];

function generateSampleScans(): ScanEvent[] {
  const scans: ScanEvent[] = [];
  const qrCodes = [
    { id: 'qr_demo_01', publicId: 'AGB2026X' },
    { id: 'qr_demo_02', publicId: 'ICG9982S' },
    { id: 'qr_demo_03', publicId: 'MED4411B' }
  ];
  const devices: ScanEvent['deviceType'][] = ['mobile', 'mobile', 'mobile', 'mobile', 'tablet', 'desktop'];
  const oss: ScanEvent['os'][] = ['iOS', 'iOS', 'Android', 'Android', 'Android'];
  const browsers: ScanEvent['browser'][] = ['Safari', 'Chrome', 'Samsung Internet', 'Chrome'];
  const cities = ['Abidjan', 'Abidjan', 'Paris', 'Dakar', 'Yamoussoukro', 'San-Pédro', 'Lyon'];

  for (let i = 0; i < 95; i++) {
    const daysAgo = Math.floor(Math.random() * 14);
    const hoursAgo = Math.floor(Math.random() * 24);
    const target = qrCodes[Math.floor(Math.random() * qrCodes.length)];
    const d = new Date(Date.now() - (daysAgo * 86400000 + hoursAgo * 3600000));
    
    scans.push({
      id: `scan_${Math.random().toString(36).substring(2, 9)}`,
      qrCodeId: target.id,
      publicId: target.publicId,
      timestamp: d.toISOString(),
      deviceType: devices[Math.floor(Math.random() * devices.length)],
      os: oss[Math.floor(Math.random() * oss.length)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      country: 'Côte d\'Ivoire',
      city: cities[Math.floor(Math.random() * cities.length)],
      referrer: 'Appareil Photo Mobile'
    });
  }
  return scans.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * -------------------------------------------------------------
 * CARDS MANAGEMENT
 * -------------------------------------------------------------
 */

export function getStoredQRCodes(): QRCodeItem[] {
  try {
    const data = localStorage.getItem(CARDS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(INITIAL_QR_ITEMS));
      syncAllCardsToServer(INITIAL_QR_ITEMS);
      return INITIAL_QR_ITEMS;
    }
    const parsed: QRCodeItem[] = JSON.parse(data);
    if (parsed && Array.isArray(parsed) && parsed.length > 0) {
      let updated = false;
      
      // Clean legacy unsplash URLs from cached storage
      parsed.forEach(p => {
        if (p.content?.photoUrl && p.content.photoUrl.includes('unsplash.com')) {
          p.content.photoUrl = '';
          updated = true;
        }
        if (p.content?.logoUrl && p.content.logoUrl.includes('unsplash.com')) {
          p.content.logoUrl = '';
          updated = true;
        }
        if (p.styling?.logoUrl && p.styling.logoUrl.includes('unsplash.com')) {
          p.styling.logoUrl = '';
          updated = true;
        }
      });

      // Merge any missing default cards without overwriting user edits
      const existingIds = new Set(parsed.map(p => p.id));
      INITIAL_QR_ITEMS.forEach(initItem => {
        if (!existingIds.has(initItem.id)) {
          parsed.push(initItem);
          existingIds.add(initItem.id);
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    }
    return INITIAL_QR_ITEMS;
  } catch (e) {
    return INITIAL_QR_ITEMS;
  }
}

export function saveQRCodes(items: QRCodeItem[]): void {
  try {
    localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving cards to localStorage:', e);
  }
}

export function getQRCodeById(id: string): QRCodeItem | undefined {
  const items = getStoredQRCodes();
  return items.find(q => q.id === id);
}

export function getQRCodeByPublicId(publicId: string): QRCodeItem | undefined {
  if (!publicId) return undefined;
  const items = getStoredQRCodes();
  const cleanId = publicId.trim().toLowerCase();
  return items.find(q => (q.publicId && q.publicId.toLowerCase() === cleanId) || q.id.toLowerCase() === cleanId);
}

/**
 * Encodes essential card metadata and contact info into a compact Base64URL string
 * for 100% offline & zero-backend QR Code scannability.
 */
export function encodeCardPayload(item: QRCodeItem): string {
  try {
    const compact: any = {
      id: item.id,
      pid: item.publicId,
      cn: item.cardNumber,
      tt: item.title,
      tp: item.type,
      md: item.modelId,
      cf: item.cardFormat,
      c: {
        fn: item.content.firstName,
        ln: item.content.lastName,
        fl: item.content.fullName,
        jt: item.content.jobTitle,
        co: item.content.company,
        cm: item.content.commercialName,
        dp: item.content.department,
        ind: item.content.industry,
        sl: item.content.slogan,
        bi: item.content.bio,
        p1: item.content.primaryPhone,
        p2: item.content.secondaryPhone,
        wa: item.content.whatsappNumber,
        wp: item.content.workPhone,
        em: item.content.email,
        we: item.content.workEmail,
        wb: item.content.websiteUrl,
        ad: item.content.address,
        com: item.content.commune,
        nb: item.content.neighborhood,
        ci: item.content.city,
        ct: item.content.country,
        oz: item.content.operatingZone,
        ll: item.content.locationLink,
        gm: item.content.googleMapsUrl,
        rn: item.content.businessRegisterNumber,
        tx: item.content.businessTaxId,
        sv: item.content.servicesList,
        so: item.content.socialLinks?.map(s => ({ p: s.platform, u: s.url })),
        oi: item.content.otherInformation,
        ec: item.content.emergencyContactNote
      },
      st: {
        theme: item.styling?.cardBackgroundTheme,
        eyeColor: item.styling?.eyeColor,
        fgColor: item.styling?.fgColor,
        bgColor: item.styling?.bgColor,
        moduleStyle: item.styling?.moduleStyle,
        eyeStyle: item.styling?.eyeStyle
      }
    };
    const jsonStr = JSON.stringify(compact);
    return encodeURIComponent(btoa(unescape(encodeURIComponent(jsonStr))));
  } catch (e) {
    return '';
  }
}

/**
 * Decodes compressed payload from QR scan URL back into a full QRCodeItem.
 */
export function decodeCardPayload(payload: string): QRCodeItem | null {
  try {
    const raw = decodeURIComponent(escape(atob(decodeURIComponent(payload))));
    const compact = JSON.parse(raw);
    if (!compact || (!compact.pid && !compact.id)) return null;

    const restored: QRCodeItem = {
      id: compact.id || `qr_${Date.now()}`,
      publicId: compact.pid || generateSecurePublicId(),
      cardNumber: compact.cn || 'AGB-CARD-RESTORED',
      title: compact.tt || `${compact.c?.fn || ''} ${compact.c?.ln || ''}`.trim() || 'Carte de Visite AGB',
      type: compact.tp || 'vcard',
      mode: 'dynamic',
      status: 'active',
      modelId: compact.md || 'model_luxury',
      cardFormat: compact.cf || '85x55',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scanCount: 0,
      content: {
        firstName: compact.c?.fn || '',
        lastName: compact.c?.ln || '',
        fullName: compact.c?.fl || `${compact.c?.fn || ''} ${compact.c?.ln || ''}`.trim(),
        jobTitle: compact.c?.jt || '',
        company: compact.c?.co || '',
        commercialName: compact.c?.cm || '',
        department: compact.c?.dp || '',
        industry: compact.c?.ind || '',
        slogan: compact.c?.sl || '',
        bio: compact.c?.bi || '',
        photoUrl: '',
        logoUrl: '',
        primaryPhone: compact.c?.p1 || '',
        secondaryPhone: compact.c?.p2 || '',
        whatsappNumber: compact.c?.wa || '',
        workPhone: compact.c?.wp || '',
        email: compact.c?.em || '',
        workEmail: compact.c?.we || '',
        websiteUrl: compact.c?.wb || '',
        address: compact.c?.ad || '',
        commune: compact.c?.com || '',
        neighborhood: compact.c?.nb || '',
        city: compact.c?.ci || 'Abidjan',
        country: compact.c?.ct || 'Côte d\'Ivoire',
        operatingZone: compact.c?.oz || '',
        locationLink: compact.c?.ll || '',
        googleMapsUrl: compact.c?.gm || '',
        businessRegisterNumber: compact.c?.rn || '',
        businessTaxId: compact.c?.tx || '',
        servicesList: compact.c?.sv || [],
        socialLinks: (compact.c?.so || []).map((s: any, idx: number) => ({
          id: `s_${idx}`,
          platform: s.p,
          url: s.u,
          displayOrder: idx + 1
        })),
        customFields: [],
        otherInformation: compact.c?.oi || '',
        emergencyContactNote: compact.c?.ec || '',
        privacy: { hideAddress: false }
      },
      styling: {
        fgColor: compact.st?.fgColor || '#0f172a',
        bgColor: compact.st?.bgColor || '#ffffff',
        transparentBg: false,
        moduleStyle: compact.st?.moduleStyle || 'rounded',
        eyeStyle: compact.st?.eyeStyle || 'rounded',
        eyeColor: compact.st?.eyeColor || '#2563eb',
        errorCorrectionLevel: 'H',
        margin: 3,
        size: 320,
        cardBackgroundTheme: compact.st?.theme || 'matte_dark',
        cardFormat: compact.cf || '85x55'
      }
    };

    // Auto-save restored card to this device's storage
    saveOrUpdateQRCode(restored, true);
    return restored;
  } catch (e) {
    console.warn('Could not decode payload:', e);
    return null;
  }
}

/**
 * Robust async fetch for any external smartphone scan:
 * 1. Checks URL for compressed payload
 * 2. Checks local memory/cache
 * 3. Queries Firestore Cloud Database
 * 4. Fallback search across all stored cards and defaults
 */
export async function fetchQRCodeByPublicId(publicId: string): Promise<QRCodeItem | null> {
  if (!publicId) return null;
  const cleanId = publicId.trim();

  let resolvedItem: QRCodeItem | null = null;

  // 1. Check if publicId contains query or payload
  if (typeof window !== 'undefined') {
    const fullUrl = window.location.href;
    const matchPayload = fullUrl.match(/[?&](?:d|data)=([a-zA-Z0-9%_-]+)/);
    if (matchPayload && matchPayload[1]) {
      const decoded = decodeCardPayload(matchPayload[1]);
      if (decoded) resolvedItem = decoded;
    }
  }

  // 2. Check local storage
  if (!resolvedItem) {
    const localFound = getQRCodeByPublicId(cleanId);
    if (localFound) resolvedItem = localFound;
  }

  // 3. Query Firestore
  if (!resolvedItem && db) {
    try {
      const cardRef = doc(db, 'cards', cleanId);
      const cardSnap = await getDoc(cardRef);
      if (cardSnap.exists()) {
        const serverItem = cardSnap.data() as QRCodeItem;
        saveOrUpdateQRCode(serverItem, false);
        resolvedItem = serverItem;
      } else {
        // Loose search in Firestore collection
        const q = query(collection(db, 'cards'), where('publicId', '==', cleanId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const serverItem = querySnapshot.docs[0].data() as QRCodeItem;
          saveOrUpdateQRCode(serverItem, false);
          resolvedItem = serverItem;
        }
      }
    } catch (err) {
      console.warn('Could not fetch card from Firestore:', err);
    }
  }

  // 4. Fallback: match initial items in memory
  if (!resolvedItem) {
    const initialFound = INITIAL_QR_ITEMS.find(
      q => q.publicId.toLowerCase() === cleanId.toLowerCase() || q.id.toLowerCase() === cleanId.toLowerCase()
    );
    if (initialFound) resolvedItem = initialFound;
  }

  if (!resolvedItem) return null;

  // Purge any unwanted stock photo URLs
  if (resolvedItem.content?.photoUrl && resolvedItem.content.photoUrl.includes('unsplash.com')) {
    resolvedItem.content.photoUrl = '';
  }
  if (resolvedItem.content?.logoUrl && resolvedItem.content.logoUrl.includes('unsplash.com')) {
    resolvedItem.content.logoUrl = '';
  }
  if (resolvedItem.styling?.logoUrl && resolvedItem.styling.logoUrl.includes('unsplash.com')) {
    resolvedItem.styling.logoUrl = '';
  }

  // Synchronize with the client's latest registered logo if available
  const clients = getStoredClients();
  const matchedClient = (resolvedItem.clientId && clients.find(c => c.id === resolvedItem.clientId)) ||
    clients.find(c => 
      (c.company && resolvedItem?.content?.company && c.company.toLowerCase().trim() === resolvedItem.content.company.toLowerCase().trim()) ||
      (c.fullName && resolvedItem?.content?.fullName && c.fullName.toLowerCase().trim() === resolvedItem.content.fullName.toLowerCase().trim())
    );

  if (matchedClient) {
    if (matchedClient.logoUrl && !matchedClient.logoUrl.includes('unsplash.com')) {
      resolvedItem.content.logoUrl = matchedClient.logoUrl;
      if (resolvedItem.styling) {
        resolvedItem.styling.logoUrl = matchedClient.logoUrl;
      }
    }
  }

  return resolvedItem;
}

export function saveOrUpdateQRCode(item: QRCodeItem, syncToServer = true): QRCodeItem {
  const items = getStoredQRCodes();
  const existingIdx = items.findIndex(
    q => q.id === item.id || (item.publicId && q.publicId && q.publicId.toLowerCase() === item.publicId.toLowerCase())
  );
  
  const updatedItem: QRCodeItem = {
    ...item,
    userId: auth.currentUser?.uid || item.userId,
    cardNumber: item.cardNumber || generateCardNumber(items.length + 1),
    publicId: item.publicId || generateSecurePublicId(),
    updatedAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    items[existingIdx] = updatedItem;
    addHistoryLog({
      action: 'update_card',
      title: `Modification de la carte ${updatedItem.cardNumber}`,
      details: `${updatedItem.title} (${updatedItem.publicId})`,
      cardId: updatedItem.id,
      clientId: updatedItem.clientId
    });
  } else {
    items.unshift(updatedItem);
    addHistoryLog({
      action: 'create_card',
      title: `Création de la carte ${updatedItem.cardNumber}`,
      details: `${updatedItem.title} - Identifiant public : ${updatedItem.publicId}`,
      cardId: updatedItem.id,
      clientId: updatedItem.clientId
    });
  }

  saveQRCodes(items);

  if (syncToServer && db) {
    // Cloud Sync with Firestore
    const cardRef = doc(db, 'cards', updatedItem.publicId);
    setDoc(cardRef, {
      ...updatedItem,
      updatedAt: serverTimestamp()
    }, { merge: true }).catch(err => console.warn('Firestore sync error:', err));
  }

  return updatedItem;
}

export function deleteQRCode(id: string): void {
  const items = getStoredQRCodes();
  const target = items.find(q => q.id === id);
  const filtered = items.filter(q => q.id !== id);
  saveQRCodes(filtered);

  if (target) {
    addHistoryLog({
      action: 'delete_card',
      title: `Suppression de la carte ${target.cardNumber || target.publicId}`,
      details: target.title,
      cardId: target.id,
      clientId: target.clientId
    });

    // Delete from Firestore
    if (db) {
      deleteDoc(doc(db, 'cards', target.publicId)).catch(() => {});
    }
  }
}

export function duplicateQRCode(id: string): QRCodeItem | null {
  const original = getQRCodeById(id);
  if (!original) return null;

  const newPublicId = generateSecurePublicId();
  const items = getStoredQRCodes();
  const duplicate: QRCodeItem = {
    ...JSON.parse(JSON.stringify(original)),
    id: `qr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    cardNumber: generateCardNumber(items.length + 1),
    publicId: newPublicId,
    title: `${original.title} (Copie)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scanCount: 0,
    lastScannedAt: undefined,
  };

  saveOrUpdateQRCode(duplicate);
  return duplicate;
}

async function syncAllCardsToServer(items: QRCodeItem[]) {
  if (!db) return;
  try {
    for (const item of items) {
      const cardRef = doc(db, 'cards', item.publicId);
      await setDoc(cardRef, { ...item, updatedAt: serverTimestamp() }, { merge: true });
    }
  } catch (err) {
    console.warn('Firestore mass sync error:', err);
  }
}

export async function syncCardsWithServer(): Promise<QRCodeItem[]> {
  if (!db || !auth) return getStoredQRCodes();
  try {
    const user = auth.currentUser;
    if (!user) return getStoredQRCodes();

    const q = query(collection(db, 'cards'), where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    const serverCards: QRCodeItem[] = [];
    querySnapshot.forEach((doc) => {
      serverCards.push(doc.data() as QRCodeItem);
    });

    if (serverCards.length > 0) {
      const localCards = getStoredQRCodes();
      const map = new Map<string, QRCodeItem>();

      serverCards.forEach(c => map.set(c.id, c));
      localCards.forEach(c => {
        if (!map.has(c.id)) {
          map.set(c.id, c);
          const cardRef = doc(db, 'cards', c.publicId);
          setDoc(cardRef, { ...c, updatedAt: serverTimestamp() }, { merge: true }).catch(() => {});
        }
      });

      const merged = Array.from(map.values());
      saveQRCodes(merged);
      return merged;
    }
  } catch (err) {
    console.warn('Firestore sync unavailable:', err);
  }
  return getStoredQRCodes();
}

/**
 * -------------------------------------------------------------
 * CLIENTS MANAGEMENT
 * -------------------------------------------------------------
 */

export function getStoredClients(): ClientProfile[] {
  try {
    const data = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(INITIAL_CLIENTS));
      return INITIAL_CLIENTS;
    }
    const parsed: ClientProfile[] = JSON.parse(data);
    if (parsed && Array.isArray(parsed) && parsed.length > 0) {
      let updated = false;

      // Purge legacy stock photos from stored clients
      parsed.forEach(c => {
        if (c.photoUrl && c.photoUrl.includes('unsplash.com')) {
          c.photoUrl = '';
          updated = true;
        }
        if (c.logoUrl && c.logoUrl.includes('unsplash.com')) {
          c.logoUrl = '';
          updated = true;
        }
      });

      const existingIds = new Set(parsed.map(c => c.id));
      INITIAL_CLIENTS.forEach(initClient => {
        if (!existingIds.has(initClient.id)) {
          parsed.push(initClient);
          existingIds.add(initClient.id);
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    }
    return INITIAL_CLIENTS;
  } catch (e) {
    return INITIAL_CLIENTS;
  }
}

export function saveClients(clients: ClientProfile[]): void {
  try {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
  } catch (e) {
    console.error('Error saving clients:', e);
  }
}

export function getClientById(id: string): ClientProfile | undefined {
  const clients = getStoredClients();
  return clients.find(c => c.id === id);
}

export function saveOrUpdateClient(client: Partial<ClientProfile> & { id?: string }): ClientProfile {
  const clients = getStoredClients();
  const now = new Date().toISOString();
  
  const id = client.id || `client_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const clientNumber = client.clientNumber || generateClientNumber(clients.length + 1);
  const fullName = client.fullName || `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.company || 'Nouveau Client';

  const fullClient: ClientProfile = {
    id,
    userId: auth.currentUser?.uid || (client as any).userId,
    clientNumber,
    firstName: client.firstName || '',
    lastName: client.lastName || '',
    fullName,
    company: client.company || '',
    commercialName: client.commercialName || '',
    jobTitle: client.jobTitle || '',
    industry: client.industry || '',
    photoUrl: client.photoUrl,
    logoUrl: client.logoUrl,
    primaryPhone: client.primaryPhone || '',
    secondaryPhone: client.secondaryPhone,
    whatsappNumber: client.whatsappNumber,
    workPhone: client.workPhone,
    email: client.email || '',
    workEmail: client.workEmail,
    websiteUrl: client.websiteUrl,
    address: client.address || '',
    commune: client.commune,
    neighborhood: client.neighborhood,
    city: client.city || 'Abidjan',
    country: client.country || 'Côte d\'Ivoire',
    locationLink: client.locationLink,
    slogan: client.slogan,
    bio: client.bio,
    servicesList: client.servicesList || [],
    productsList: client.productsList || [],
    businessTaxId: client.businessTaxId,
    businessRegisterNumber: client.businessRegisterNumber,
    socialLinks: client.socialLinks || [],
    internalNotes: client.internalNotes,
    associatedCardIds: client.associatedCardIds || [],
    createdAt: client.createdAt || now,
    updatedAt: now
  };

  const existingIdx = clients.findIndex(c => c.id === id);
  if (existingIdx >= 0) {
    clients[existingIdx] = fullClient;
    addHistoryLog({
      action: 'update_client',
      title: `Modification client : ${fullName}`,
      details: `Numéro client : ${clientNumber} (Synchronisation QR automatique)`,
      clientId: id
    });
  } else {
    clients.unshift(fullClient);
    addHistoryLog({
      action: 'create_client',
      title: `Création client : ${fullName}`,
      details: `Numéro client : ${clientNumber} (${fullClient.company})`,
      clientId: id
    });
  }

  saveClients(clients);

  // AUTOMATIC SYNCHRONIZATION: Update all QR Codes associated with this client
  // so scanning the existing QR Code instantly reflects the updated/added/removed info without changing the QR Code!
  try {
    const qrCodes = getStoredQRCodes();
    let qrCodesUpdated = false;

    const updatedQRCodes = qrCodes.map(q => {
      const isAssociated = q.clientId === id || (fullClient.associatedCardIds && fullClient.associatedCardIds.includes(q.id));
      if (!isAssociated) return q;

      qrCodesUpdated = true;
      const effectiveLogo = fullClient.logoUrl !== undefined ? fullClient.logoUrl : (fullClient.photoUrl !== undefined ? fullClient.photoUrl : q.styling?.logoUrl);

      return {
        ...q,
        updatedAt: now,
        content: {
          ...q.content,
          firstName: fullClient.firstName || q.content.firstName,
          lastName: fullClient.lastName || q.content.lastName,
          fullName: fullClient.fullName || q.content.fullName,
          company: fullClient.company || q.content.company,
          commercialName: fullClient.commercialName || q.content.commercialName,
          jobTitle: fullClient.jobTitle || q.content.jobTitle,
          industry: fullClient.industry || q.content.industry,
          photoUrl: fullClient.photoUrl !== undefined ? fullClient.photoUrl : q.content.photoUrl,
          logoUrl: fullClient.logoUrl !== undefined ? fullClient.logoUrl : q.content.logoUrl,
          primaryPhone: fullClient.primaryPhone || q.content.primaryPhone,
          secondaryPhone: fullClient.secondaryPhone !== undefined ? fullClient.secondaryPhone : q.content.secondaryPhone,
          whatsappNumber: fullClient.whatsappNumber !== undefined ? fullClient.whatsappNumber : q.content.whatsappNumber,
          workPhone: fullClient.workPhone !== undefined ? fullClient.workPhone : q.content.workPhone,
          email: fullClient.email || q.content.email,
          workEmail: fullClient.workEmail !== undefined ? fullClient.workEmail : q.content.workEmail,
          websiteUrl: fullClient.websiteUrl !== undefined ? fullClient.websiteUrl : q.content.websiteUrl,
          address: fullClient.address || q.content.address,
          commune: fullClient.commune !== undefined ? fullClient.commune : q.content.commune,
          city: fullClient.city || q.content.city,
          country: fullClient.country || q.content.country,
          locationLink: fullClient.locationLink !== undefined ? fullClient.locationLink : q.content.locationLink,
          slogan: fullClient.slogan !== undefined ? fullClient.slogan : q.content.slogan,
          bio: fullClient.bio !== undefined ? fullClient.bio : q.content.bio,
          servicesList: fullClient.servicesList && fullClient.servicesList.length > 0 ? fullClient.servicesList : q.content.servicesList,
          productsList: fullClient.productsList && fullClient.productsList.length > 0 ? fullClient.productsList : q.content.productsList,
          socialLinks: fullClient.socialLinks && fullClient.socialLinks.length > 0 ? fullClient.socialLinks : q.content.socialLinks
        },
        styling: {
          ...q.styling,
          logoUrl: effectiveLogo || '',
          errorCorrectionLevel: effectiveLogo ? 'H' : (q.styling?.errorCorrectionLevel || 'M'),
          logoBackground: q.styling?.logoBackground ?? true,
          logoBgColor: q.styling?.logoBgColor || '#ffffff',
          logoSizeRatio: q.styling?.logoSizeRatio || 0.22,
          logoBorderRadius: q.styling?.logoBorderRadius || 8
        }
      };
    });

    if (qrCodesUpdated) {
      saveQRCodes(updatedQRCodes);
      // Sync associated cards to Firestore
      if (db) {
        updatedQRCodes.filter(q => q.clientId === id).forEach(q => {
          const cardRef = doc(db, 'cards', q.publicId);
          setDoc(cardRef, { ...q, updatedAt: serverTimestamp() }, { merge: true }).catch(() => {});
        });
      }
    }

    // Sync client to Firestore
    if (db) {
      const clientRef = doc(db, 'clients', fullClient.id);
      setDoc(clientRef, { ...fullClient, updatedAt: serverTimestamp() }, { merge: true }).catch(() => {});
    }

  } catch (err) {
    console.error('Error synchronizing with Firestore:', err);
  }

  return fullClient;
}

export function deleteClient(id: string): void {
  const clients = getStoredClients();
  const target = clients.find(c => c.id === id);
  const filtered = clients.filter(c => c.id !== id);
  saveClients(filtered);

  if (target) {
    addHistoryLog({
      action: 'delete_client',
      title: `Suppression client : ${target.fullName}`,
      details: `Numéro client : ${target.clientNumber}`,
      clientId: id
    });

    // Delete from Firestore
    if (db) {
      deleteDoc(doc(db, 'clients', id)).catch(() => {});
    }
  }
}

/**
 * -------------------------------------------------------------
 * HISTORY LOGS
 * -------------------------------------------------------------
 */

export function getStoredHistory(): HistoryLogItem[] {
  try {
    const data = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(INITIAL_HISTORY));
      return INITIAL_HISTORY;
    }
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_HISTORY;
  }
}

export function addHistoryLog(log: Omit<HistoryLogItem, 'id' | 'timestamp'>): void {
  try {
    const history = getStoredHistory();
    const newLog: HistoryLogItem = {
      ...log,
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    history.unshift(newLog);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 500)));
  } catch (e) {
    console.warn('Could not save history log:', e);
  }
}

/**
 * -------------------------------------------------------------
 * DESIGNER PROFILE
 * -------------------------------------------------------------
 */

export function getDesignerProfile(): DesignerProfile {
  try {
    const data = localStorage.getItem(DESIGNER_STORAGE_KEY);
    return data ? { ...DEFAULT_DESIGNER_PROFILE, ...JSON.parse(data) } : DEFAULT_DESIGNER_PROFILE;
  } catch {
    return DEFAULT_DESIGNER_PROFILE;
  }
}

export function saveDesignerProfile(profile: DesignerProfile): void {
  localStorage.setItem(DESIGNER_STORAGE_KEY, JSON.stringify(profile));
}

/**
 * -------------------------------------------------------------
 * SCANS ANALYTICS
 * -------------------------------------------------------------
 */

export function getStoredScans(): ScanEvent[] {
  try {
    const data = localStorage.getItem(SCANS_STORAGE_KEY);
    if (!data) {
      const initialScans = generateSampleScans();
      localStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify(initialScans));
      return initialScans;
    }
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function recordScanEvent(publicId: string): void {
  if (!publicId) return;
  const qr = getQRCodeByPublicId(publicId);

  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  let deviceType: ScanEvent['deviceType'] = 'mobile';
  if (/iPad|Tablet/i.test(userAgent)) deviceType = 'tablet';
  else if (!/Mobi|Android/i.test(userAgent)) deviceType = 'desktop';

  let os: ScanEvent['os'] = 'Other';
  if (/iPhone|iPad|iPod/i.test(userAgent)) os = 'iOS';
  else if (/Android/i.test(userAgent)) os = 'Android';
  else if (/Macintosh|Mac OS/i.test(userAgent)) os = 'macOS';
  else if (/Windows/i.test(userAgent)) os = 'Windows';
  else if (/Linux/i.test(userAgent)) os = 'Linux';

  let browser: ScanEvent['browser'] = 'Other';
  if (/SamsungBrowser/i.test(userAgent)) browser = 'Samsung Internet';
  else if (/Chrome/i.test(userAgent)) browser = 'Chrome';
  else if (/Safari/i.test(userAgent)) browser = 'Safari';
  else if (/Firefox/i.test(userAgent)) browser = 'Firefox';
  else if (/Edg/i.test(userAgent)) browser = 'Edge';

  const newScan: ScanEvent = {
    id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    qrCodeId: qr ? qr.id : publicId,
    publicId,
    timestamp: new Date().toISOString(),
    deviceType,
    os,
    browser,
    country: 'Côte d\'Ivoire',
    city: 'Abidjan',
    referrer: typeof document !== 'undefined' ? document.referrer || 'Scan Appareil Photo' : 'Scan'
  };

  const scans = getStoredScans();
  scans.unshift(newScan);
  try {
    localStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify(scans.slice(0, 1000)));
  } catch (e) {
    // silent
  }

  // Increment scan count on card if available
  if (qr) {
    qr.scanCount = (qr.scanCount || 0) + 1;
    qr.lastScannedAt = newScan.timestamp;
    saveOrUpdateQRCode(qr, true);
  }

  // Send scan event to server API
  fetch('/api/scans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newScan)
  }).catch(() => {});
}

/**
 * -------------------------------------------------------------
 * FULL DATABASE BACKUP & RESTORE
 * -------------------------------------------------------------
 */

export interface FullDatabaseBackup {
  version: '2.0';
  exportDate: string;
  designer: DesignerProfile;
  clients: ClientProfile[];
  cards: QRCodeItem[];
  history: HistoryLogItem[];
  scansCount: number;
}

export function exportFullDatabaseJSON(): string {
  const backup: FullDatabaseBackup = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    designer: getDesignerProfile(),
    clients: getStoredClients(),
    cards: getStoredQRCodes(),
    history: getStoredHistory(),
    scansCount: getStoredScans().length
  };

  addHistoryLog({
    action: 'export_backup',
    title: 'Sauvegarde complète exportée',
    details: `${backup.clients.length} clients, ${backup.cards.length} cartes exportés en JSON`
  });

  return JSON.stringify(backup, null, 2);
}

export function importFullDatabaseJSON(jsonString: string): boolean {
  try {
    const data: FullDatabaseBackup = JSON.parse(jsonString);
    if (!data.cards || !data.clients) {
      throw new Error("Format de sauvegarde JSON invalide");
    }

    if (data.designer) saveDesignerProfile(data.designer);
    if (data.clients) saveClients(data.clients);
    if (data.cards) {
      saveQRCodes(data.cards);
      syncAllCardsToServer(data.cards);
    }
    if (data.history) {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(data.history));
    }

    addHistoryLog({
      action: 'restore_backup',
      title: 'Restauration de la base de données',
      details: `${data.clients.length} clients et ${data.cards.length} cartes restaurés avec succès`
    });

    return true;
  } catch (err) {
    console.error('Error importing backup:', err);
    return false;
  }
}

/**
 * -------------------------------------------------------------
 * IDENTIFIERS & PUBLIC URL GENERATORS
 * -------------------------------------------------------------
 */

export function generateSecurePublicId(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < 8; i++) {
      result += chars[bytes[i] % chars.length];
    }
  } else {
    for (let i = 0; i < 8; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return result;
}

export function generateCardNumber(sequence: number, type: string = 'vcard'): string {
  const seqStr = sequence.toString().padStart(6, '0');
  switch (type) {
    case 'book': return `AGB-BOOK-${seqStr}`;
    case 'invitation': return `AGB-INV-${seqStr}`;
    case 'shop': 
    case 'business': return `AGB-SHOP-${seqStr}`;
    case 'location': return `AGB-LOC-${seqStr}`;
    case 'event': return `AGB-EVT-${seqStr}`;
    case 'product': return `AGB-PRD-${seqStr}`;
    case 'menu': return `AGB-MNU-${seqStr}`;
    default: return `AGB-CARD-${seqStr}`;
  }
}

export function generateClientNumber(sequence: number): string {
  const seqStr = sequence.toString().padStart(6, '0');
  return `AGB-CLT-${seqStr}`;
}

export const CANONICAL_GITHUB_PAGES_URL = 'https://agibrico.github.io/agibrico.github.io-/';

/**
 * Builds standard public URL for the card:
 *
 * IMPORTANT: We ALWAYS use the canonical web URL for the QR Code links,
 * even when generating from the mobile app (localhost), so that clients
 * scanning the physical QR code are redirected to the public website.
 */
export function getPublicQRUrl(publicId: string, card?: QRCodeItem): string {
  // Always use the public web address for the link encoded in the QR code
  const baseUrl = `${CANONICAL_GITHUB_PAGES_URL}#q/${publicId}`;

  // To ensure the QR code stays identical even when data changes,
  // we avoid appending the '?d=...' payload in dynamic mode
  if (card?.mode === 'dynamic') {
    return baseUrl;
  }

  // Fallback for static/offline compatibility (encodes data in URL)
  if (card && card.content && (card.content.firstName || card.content.fullName || card.content.company)) {
    const payload = encodeCardPayload(card);
    if (payload && payload.length < 1600) {
      return `${baseUrl}?d=${payload}`;
    }
  }

  return baseUrl;
}

export function getCanonicalGithubUrl(publicId: string): string {
  return `${CANONICAL_GITHUB_PAGES_URL}#q/${publicId}`;
}

/**
 * Extracts publicId from any possible URL pattern:
 * - pathname (/c/XYZ, /q/XYZ, /card/XYZ)
 * - query search (?q=XYZ, ?c=XYZ, ?id=XYZ)
 * - hash (#q/XYZ, #/c/XYZ, #c/XYZ, #XYZ)
 */
export function extractPublicIdFromCurrentUrl(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Pathname
  const pathname = window.location.pathname;
  const pathMatch = pathname.match(/\/(?:c|q|card|fiche)\/([a-zA-Z0-9_-]+)/i);
  if (pathMatch && pathMatch[1]) {
    return pathMatch[1];
  }

  // 2. Search params
  const searchParams = new URLSearchParams(window.location.search);
  const param = searchParams.get('q') || searchParams.get('c') || searchParams.get('id') || searchParams.get('card');
  if (param) {
    return param;
  }

  // 3. Hash
  const hash = window.location.hash;
  if (hash) {
    const hashMatch = hash.match(/#(?:q\/|c\/|\/c\/|\/q\/|card\/)?([a-zA-Z0-9_-]+)/i);
    const systemTabs = ['dashboard', 'clients', 'cards', 'qrcodes', 'models', 'create', 'editor', 'scanner', 'analytics', 'history', 'backup', 'settings'];
    if (hashMatch && hashMatch[1] && !systemTabs.includes(hashMatch[1].toLowerCase())) {
      return hashMatch[1];
    }
  }

  return null;
}
