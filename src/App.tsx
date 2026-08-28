import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/layout/Navbar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { ClientsView } from './components/clients/ClientsView';
import { QRListView } from './components/qr-list/QRListView';
import { TemplateGalleryView } from './components/templates/TemplateGalleryView';
import { QREditor } from './components/editor/QREditor';
import { LiveQRScanner } from './components/scanner/LiveQRScanner';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { HistoryView } from './components/history/HistoryView';
import { BackupView } from './components/backup/BackupView';
import { SettingsView } from './components/settings/SettingsView';
import { PublicScannedPage } from './components/public/PublicScannedPage';
import { ArchitectureModal } from './components/architecture/ArchitectureModal';
import { PrintStudioModal } from './components/print/PrintStudioModal';
import { PhoneSimulatorModal } from './components/preview/PhoneSimulatorModal';
import { AndroidStudioViewer } from './components/android/AndroidStudioViewer';
import { useAuth } from './context/AuthContext';

import { QRCodeItem, ScanEvent, ClientProfile, HistoryLogItem, CardModelId } from './types/qr';
import { 
  getStoredQRCodes, 
  saveOrUpdateQRCode, 
  deleteQRCode as removeQR, 
  duplicateQRCode, 
  getStoredScans,
  getStoredClients,
  getStoredHistory,
  syncCardsWithServer,
  generateCardNumber
} from './utils/storage';
import { CARD_TEMPLATES } from './components/templates/TemplateGalleryView';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [qrItems, setQrItems] = useState<QRCodeItem[]>([]);
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [scans, setScans] = useState<ScanEvent[]>([]);
  const [historyLogs, setHistoryLogs] = useState<HistoryLogItem[]>([]);

  // Active editing item (null = creating new)
  const [editingItem, setEditingItem] = useState<QRCodeItem | null>(null);

  // Modals
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [printModalItem, setPrintModalItem] = useState<QRCodeItem | null>(null);
  const [simulatorModalItem, setSimulatorModalItem] = useState<QRCodeItem | null>(null);

  // Direct Public Scan Route Check: #q/PUBLIC_ID or /q/PUBLIC_ID or /c/PUBLIC_ID
  const [publicScanId, setPublicScanId] = useState<string | null>(null);

  useEffect(() => {
    // Load initial data
    refreshData();

    // Check URL for public scan route
    const checkHashRoute = () => {
      const hash = window.location.hash;
      const match = hash.match(/#(?:q|c|card)\/([a-zA-Z0-9_-]+)/i);
      if (match && match[1]) {
        setPublicScanId(match[1]);
      } else {
        setPublicScanId(null);
      }
    };

    checkHashRoute();
    window.addEventListener('hashchange', checkHashRoute);
    
    return () => window.removeEventListener('hashchange', checkHashRoute);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    // Sync with server API in background when user changes
    syncCardsWithServer().then(() => {
      refreshData();
    }).catch(() => {});
  }, [user, authLoading]);

  const refreshData = () => {
    setQrItems(getStoredQRCodes());
    setClients(getStoredClients());
    setScans(getStoredScans());
    setHistoryLogs(getStoredHistory());
  };

  // If the user navigated to a public scan link (#q/XXXX), render the standalone public page
  if (publicScanId) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <PublicScannedPage publicId={publicScanId} />
      </div>
    );
  }

  // Handlers
  const handleCreateNew = () => {
    setEditingItem(null);
    setCurrentTab('create');
  };

  const handleCreateCardForClient = (client: ClientProfile) => {
    const newCardNumber = generateCardNumber(qrItems.length + 1);
    const prefilledCard: Partial<QRCodeItem> = {
      cardNumber: newCardNumber,
      clientId: client.id,
      title: `${client.fullName} — ${client.jobTitle || client.company || 'Carte Pro'}`,
      type: 'vcard',
      mode: 'dynamic',
      status: 'active',
      modelId: 'model_luxury',
      cardFormat: '85x55',
      content: {
        firstName: client.firstName,
        lastName: client.lastName,
        fullName: client.fullName,
        jobTitle: client.jobTitle,
        company: client.company,
        commercialName: client.commercialName,
        industry: client.industry,
        slogan: client.slogan,
        bio: client.internalNotes,
        photoUrl: client.photoUrl,
        logoUrl: client.logoUrl,
        primaryPhone: client.primaryPhone,
        secondaryPhone: client.secondaryPhone,
        whatsappNumber: client.whatsappNumber,
        workPhone: client.workPhone,
        email: client.email,
        websiteUrl: client.websiteUrl,
        address: client.address,
        commune: client.commune,
        city: client.city || 'Abidjan',
        country: client.country || 'Côte d\'Ivoire',
        locationLink: client.locationLink,
        businessRegisterNumber: client.businessRegisterNumber,
        businessTaxId: client.businessTaxId,
        servicesList: client.servicesList || [],
        socialLinks: client.socialLinks || [
          { id: '1', platform: 'whatsapp', url: client.whatsappNumber ? `https://wa.me/${client.whatsappNumber.replace(/[^\d]/g, '')}` : '', displayOrder: 1 },
          { id: '2', platform: 'linkedin', url: '', displayOrder: 2 },
          { id: '3', platform: 'website', url: client.websiteUrl || '', displayOrder: 3 }
        ],
        customFields: [],
        privacy: {
          hideAddress: false,
          hideSecondaryPhone: false,
          hideTaxInfo: false
        }
      }
    };

    setEditingItem(prefilledCard as QRCodeItem);
    setCurrentTab('create');
  };

  const handleSelectTemplate = (templateId: CardModelId) => {
    const tpl = CARD_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;

    const baseCard: Partial<QRCodeItem> = editingItem ? { ...editingItem } : {
      cardNumber: generateCardNumber(qrItems.length + 1),
      title: `Carte ${tpl.title}`,
      type: 'vcard',
      mode: 'dynamic',
      status: 'active'
    };

    baseCard.modelId = templateId;
    baseCard.styling = {
      fgColor: tpl.bgColor === '#ffffff' ? '#0f172a' : '#ffffff',
      bgColor: tpl.bgColor,
      transparentBg: false,
      moduleStyle: tpl.moduleStyle,
      eyeStyle: tpl.eyeStyle,
      eyeColor: tpl.accentColor,
      errorCorrectionLevel: 'H',
      margin: 3,
      size: 320,
      cardBackgroundTheme: tpl.theme,
      cardFormat: '85x55',
      logoUrl: '',
      logoSizeRatio: 0.2,
      logoBackground: true
    };

    setEditingItem(baseCard as QRCodeItem);
    setCurrentTab('create');
  };

  const handleEditQR = (item: QRCodeItem) => {
    setEditingItem(item);
    setCurrentTab('create');
  };

  const handleSaveQR = (item: QRCodeItem) => {
    saveOrUpdateQRCode(item);
    refreshData();
    setCurrentTab('cards');
    setEditingItem(null);
  };

  const handleDuplicateQR = (id: string) => {
    const dup = duplicateQRCode(id);
    if (dup) {
      refreshData();
    }
  };

  const handleDeleteQR = (id: string) => {
    removeQR(id);
    refreshData();
  };

  const handleToggleStatus = (item: QRCodeItem) => {
    const updated: QRCodeItem = {
      ...item,
      status: item.status === 'active' ? 'inactive' : 'active'
    };
    saveOrUpdateQRCode(updated);
    refreshData();
  };

  const handleScanSuccess = (data: string) => {
    const publicMatch = data.match(/(?:\/|#)(?:q|c|card)\/([a-zA-Z0-9_-]+)/i);
    if (publicMatch && publicMatch[1]) {
      window.location.hash = `q/${publicMatch[1]}`;
    }
  };

  const handleResetDemoData = () => {
    localStorage.clear();
    refreshData();
    alert("Données réinitialisées aux modèles standards AGB !");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Top Bar Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={tab => {
          if (tab === 'create') setEditingItem(null);
          setCurrentTab(tab);
        }}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        appName="AGB vCard Studio"
      />

      {/* Main Content Body */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        
        {/* 1. DASHBOARD */}
        {currentTab === 'dashboard' && (
          <DashboardOverview
            qrItems={qrItems}
            clients={clients}
            scans={scans}
            onNavigateTab={setCurrentTab}
            onEditQR={handleEditQR}
            onOpenSimulator={item => setSimulatorModalItem(item)}
            onOpenPrintStudio={item => setPrintModalItem(item)}
            onCreateNewCard={handleCreateNew}
          />
        )}

        {/* 2. CLIENTS */}
        {currentTab === 'clients' && (
          <ClientsView
            clients={clients}
            qrItems={qrItems}
            onRefresh={refreshData}
            onCreateCardForClient={handleCreateCardForClient}
            onViewClientCards={(clientId) => {
              setCurrentTab('cards');
            }}
            onBackToDashboard={() => setCurrentTab('dashboard')}
          />
        )}

        {/* 3. CARTES */}
        {currentTab === 'cards' && (
          <QRListView
            items={qrItems}
            clients={clients}
            onCreateNew={handleCreateNew}
            onEdit={handleEditQR}
            onDuplicate={handleDuplicateQR}
            onDelete={handleDeleteQR}
            onToggleStatus={handleToggleStatus}
            onOpenSimulator={item => setSimulatorModalItem(item)}
            onOpenPrintStudio={item => setPrintModalItem(item)}
            onBackToDashboard={() => setCurrentTab('dashboard')}
          />
        )}

        {/* 4. MODÈLES */}
        {currentTab === 'models' && (
          <TemplateGalleryView
            onSelectTemplate={handleSelectTemplate}
            onBackToDashboard={() => setCurrentTab('dashboard')}
          />
        )}

        {/* 5. ÉDITEUR / NOUVELLE CARTE */}
        {currentTab === 'create' && (
          <QREditor
            initialItem={editingItem}
            onSave={handleSaveQR}
            onCancel={() => {
              setEditingItem(null);
              setCurrentTab('cards');
            }}
            onOpenPrintStudio={item => setPrintModalItem(item)}
            onOpenSimulator={item => setSimulatorModalItem(item)}
          />
        )}

        {/* 6. SCANNER & TEST */}
        {currentTab === 'scanner' && (
          <LiveQRScanner
            onScanSuccess={handleScanSuccess}
            onOpenPublicId={publicId => {
              window.location.hash = `q/${publicId}`;
            }}
          />
        )}

        {/* PROJET ANDROID STUDIO (KOTLIN / COMPOSE) */}
        {currentTab === 'android' && (
          <AndroidStudioViewer />
        )}

        {/* 7. STATISTIQUES */}
        {currentTab === 'analytics' && (
          <AnalyticsView
            scans={scans}
            qrItems={qrItems}
          />
        )}

        {/* 8. HISTORIQUE */}
        {currentTab === 'history' && (
          <HistoryView
            historyLogs={historyLogs}
          />
        )}

        {/* 9. SAUVEGARDE & RESTAURATION */}
        {currentTab === 'backup' && (
          <BackupView
            onDataRestored={refreshData}
            onResetDemoData={handleResetDemoData}
          />
        )}

        {/* 10. PARAMÈTRES / CONCEPTEUR AGB */}
        {currentTab === 'settings' && (
          <SettingsView
            onProfileUpdated={refreshData}
          />
        )}

      </main>

      {/* Modals */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      <PrintStudioModal
        isOpen={Boolean(printModalItem)}
        onClose={() => setPrintModalItem(null)}
        item={printModalItem}
      />

      <PhoneSimulatorModal
        isOpen={Boolean(simulatorModalItem)}
        onClose={() => setSimulatorModalItem(null)}
        item={simulatorModalItem}
      />

    </div>
  );
}
