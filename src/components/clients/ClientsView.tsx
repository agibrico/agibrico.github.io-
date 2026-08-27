import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CreditCard, 
  Phone, 
  Mail, 
  Building2, 
  MapPin, 
  ExternalLink, 
  Check, 
  X, 
  Sparkles, 
  FileText, 
  UserCheck, 
  Smartphone, 
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  Share2,
  ListPlus,
  Tag,
  Briefcase,
  ShieldCheck,
  Globe,
  Image as ImageIcon,
  Upload,
  Camera,
  CheckCircle2,
  Clock,
  Navigation
} from 'lucide-react';
import { ClientProfile, QRCodeItem, SocialLink } from '../../types/qr';
import { saveOrUpdateClient, deleteClient, generateClientNumber, CANONICAL_GITHUB_PAGES_URL } from '../../utils/storage';
import { getCompanyDefaultLogo } from '../../utils/defaultLogos';

interface ClientsViewProps {
  clients: ClientProfile[];
  qrItems: QRCodeItem[];
  onRefresh: () => void;
  onCreateCardForClient: (client: ClientProfile) => void;
  onViewClientCards: (clientId: string) => void;
  onBackToDashboard?: () => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  qrItems,
  onRefresh,
  onCreateCardForClient,
  onViewClientCards,
  onBackToDashboard
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState<Partial<ClientProfile> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClientDetail, setSelectedClientDetail] = useState<ClientProfile | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // New item inputs for dynamic lists inside modal
  const [newServiceInput, setNewServiceInput] = useState('');
  const [newProductInput, setNewProductInput] = useState('');
  const [newSocialPlatform, setNewSocialPlatform] = useState<SocialLink['platform']>('whatsapp');
  const [newSocialUrl, setNewSocialUrl] = useState('');

  // Search filtering
  const filteredClients = clients.filter(c => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      (c.clientNumber && c.clientNumber.toLowerCase().includes(q)) ||
      c.primaryPhone.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)
    );
  });

  const handleOpenCreateModal = () => {
    setEditingClient({
      clientNumber: generateClientNumber(clients.length + 1),
      firstName: '',
      lastName: '',
      fullName: '',
      company: '',
      commercialName: '',
      jobTitle: '',
      industry: '',
      primaryPhone: '+225 ',
      secondaryPhone: '',
      whatsappNumber: '',
      workPhone: '',
      email: '',
      workEmail: '',
      websiteUrl: '',
      address: '',
      commune: '',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      locationLink: '',
      slogan: '',
      bio: '',
      servicesList: [],
      productsList: [],
      socialLinks: [
        { id: 'soc_wa', platform: 'whatsapp', url: 'https://wa.me/2250104000000', displayOrder: 1 }
      ]
    });
    setNewServiceInput('');
    setNewProductInput('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: ClientProfile) => {
    setEditingClient({
      ...client,
      servicesList: client.servicesList ? [...client.servicesList] : [],
      productsList: client.productsList ? [...client.productsList] : [],
      socialLinks: client.socialLinks ? [...client.socialLinks] : []
    });
    setNewServiceInput('');
    setNewProductInput('');
    setIsModalOpen(true);
  };

  // Add / Remove dynamic services
  const handleAddService = () => {
    if (!newServiceInput.trim() || !editingClient) return;
    const currentList = editingClient.servicesList || [];
    setEditingClient({
      ...editingClient,
      servicesList: [...currentList, newServiceInput.trim()]
    });
    setNewServiceInput('');
  };

  const handleRemoveService = (index: number) => {
    if (!editingClient) return;
    const currentList = editingClient.servicesList || [];
    setEditingClient({
      ...editingClient,
      servicesList: currentList.filter((_, idx) => idx !== index)
    });
  };

  // Add / Remove dynamic products
  const handleAddProduct = () => {
    if (!newProductInput.trim() || !editingClient) return;
    const currentList = editingClient.productsList || [];
    setEditingClient({
      ...editingClient,
      productsList: [...currentList, newProductInput.trim()]
    });
    setNewProductInput('');
  };

  const handleRemoveProduct = (index: number) => {
    if (!editingClient) return;
    const currentList = editingClient.productsList || [];
    setEditingClient({
      ...editingClient,
      productsList: currentList.filter((_, idx) => idx !== index)
    });
  };

  // Add / Remove social links
  const handleAddSocialLink = () => {
    if (!newSocialUrl.trim() || !editingClient) return;
    const currentLinks = editingClient.socialLinks || [];
    const newLink: SocialLink = {
      id: `soc_${Date.now()}`,
      platform: newSocialPlatform,
      url: newSocialUrl.trim(),
      displayOrder: currentLinks.length + 1
    };
    setEditingClient({
      ...editingClient,
      socialLinks: [...currentLinks, newLink]
    });
    setNewSocialUrl('');
  };

  const handleRemoveSocialLink = (id: string) => {
    if (!editingClient) return;
    const currentLinks = editingClient.socialLinks || [];
    setEditingClient({
      ...editingClient,
      socialLinks: currentLinks.filter(l => l.id !== id)
    });
  };

  // Image Upload Handler for Client Logo
  const handleClientLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingClient) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setEditingClient({
        ...editingClient,
        logoUrl: dataUrl,
        photoUrl: dataUrl
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveClientForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    if (!editingClient.firstName && !editingClient.lastName && !editingClient.company) {
      alert("Veuillez saisir au moins un nom, prénom ou raison sociale.");
      return;
    }

    const saved = saveOrUpdateClient(editingClient);
    setIsModalOpen(false);
    setEditingClient(null);
    onRefresh();

    // Show confirmation that all existing QR codes have been automatically updated
    setSaveSuccessMessage(`Fiche de ${saved.fullName} synchronisée avec succès ! Le QR Code existant diffusera automatiquement ces nouvelles coordonnées lors des scans.`);
    setTimeout(() => setSaveSuccessMessage(null), 6000);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Confirmer la suppression définitive de la fiche client de "${name}" ?`)) {
      deleteClient(id);
      onRefresh();
      if (selectedClientDetail?.id === id) {
        setSelectedClientDetail(null);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Toast Confirmation Message */}
      {saveSuccessMessage && (
        <div className="bg-emerald-600 text-white px-5 py-4 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin-slow shrink-0" />
            <p className="text-xs sm:text-sm font-bold leading-tight">{saveSuccessMessage}</p>
          </div>
          <button onClick={() => setSaveSuccessMessage(null)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Bar with Navigation Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer mr-1"
                title="Retour à l'accueil"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Accueil</span>
              </button>
            )}
            <span className="px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-100">
              Carnet de Clients AGB
            </span>
            <span className="text-xs font-semibold text-slate-400">• {clients.length} fiches enregistrées</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Gestion du Carnet Clients & Coordonnées
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Ajoutez, modifiez ou retirez les coordonnées de vos clients. <span className="font-semibold text-purple-700">Toutes les modifications sont immédiatement répercutées lors des scans de leurs cartes sans changer le QR Code physique !</span>
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs rounded-full shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Client</span>
        </button>
      </div>

      {/* Dynamic Sync Info Banner */}
      <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 flex items-start sm:items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5 sm:mt-0" />
        <div className="text-xs text-purple-900 leading-relaxed">
          <strong className="font-bold">Mise à jour en temps réel :</strong> Vous pouvez enrichir ou épurer la fiche d'un client à tout moment. Le QR Code déjà gravé ou imprimé sur sa carte reste rigoureusement le même.
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, entreprise, téléphone, numéro client..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="text-xs font-semibold text-slate-500 self-end sm:self-center">
          {filteredClients.length} client{filteredClients.length > 1 ? 's' : ''} trouvé{filteredClients.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClients.map(client => {
          const clientCards = qrItems.filter(q => q.clientId === client.id || (client.associatedCardIds && client.associatedCardIds.includes(q.id)));
          const activeCardsCount = clientCards.filter(c => c.status === 'active').length;

          return (
            <div
              key={client.id}
              className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                
                {/* Top Row: Client Number & Actions */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
                    {client.clientNumber || 'AGB-CLT'}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(client)}
                      className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                      title="Modifier les coordonnées client"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id, client.fullName)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Supprimer la fiche client"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Identity & Company */}
                <div className="flex items-start gap-3.5">
                  <div className="shrink-0">
                    {(() => {
                      const displayLogo = (client.logoUrl && !client.logoUrl.includes('unsplash.com'))
                        ? client.logoUrl
                        : (client.photoUrl && !client.photoUrl.includes('unsplash.com'))
                        ? client.photoUrl
                        : getCompanyDefaultLogo(client.company || client.commercialName || client.fullName);
                      return displayLogo ? (
                        <div className="w-13 h-13 rounded-2xl bg-white p-1 border border-slate-200 shadow-xs flex items-center justify-center overflow-hidden">
                          <img
                            src={displayLogo}
                            alt={client.company || client.fullName}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-13 h-13 rounded-2xl bg-slate-900 text-amber-400 font-black text-sm flex items-center justify-center shadow-xs border border-amber-400/30">
                          {client.company?.substring(0, 3) || client.firstName?.[0] || 'CLT'}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {client.fullName}
                    </h3>
                    <p className="text-xs font-semibold text-purple-700 truncate">
                      {client.jobTitle || 'Professionnel'}
                    </p>
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span>{client.company || 'Indépendant'}</span>
                    </p>
                  </div>
                </div>

                {/* Contact Coordinates */}
                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                  {client.primaryPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-mono text-[11px] truncate font-semibold">{client.primaryPhone}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate text-[11px]">{client.email}</span>
                    </div>
                  )}
                  {client.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate text-[11px]">{[client.commune, client.city].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Dynamic elements counts: services, products, social */}
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {client.servicesList && client.servicesList.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {client.servicesList.length} service{client.servicesList.length > 1 ? 's' : ''}
                    </span>
                  )}
                  {client.productsList && client.productsList.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {client.productsList.length} produit{client.productsList.length > 1 ? 's' : ''}
                    </span>
                  )}
                  {client.socialLinks && client.socialLinks.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      {client.socialLinks.length} réseau{client.socialLinks.length > 1 ? 'x' : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onViewClientCards(client.id)}
                  className="text-xs font-bold text-slate-700 hover:text-purple-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  <span>{clientCards.length} Carte{clientCards.length > 1 ? 's' : ''}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(client)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => onCreateCardForClient(client)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    + Créer Carte
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT CLIENT MODAL WITH DYNAMIC FIELDS MANAGEMENT */}
      {isModalOpen && editingClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">
                  {editingClient.id ? 'Mise à jour Fiche Client' : 'Nouveau Client'}
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingClient.id ? `Modifier : ${editingClient.fullName}` : 'Enregistrer un nouveau client'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingClient(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sync Warning */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-900">
              <RefreshCw className="w-4 h-4 text-emerald-600 shrink-0 animate-spin-slow" />
              <span>
                <strong>Synchronisation active :</strong> Toute information ajoutée ou retirée ici sera répercutée immédiatement lors du scan du QR Code de ce client sans jamais changer le QR Code physique !
              </span>
            </div>

            <form onSubmit={handleSaveClientForm} className="space-y-6">
              
              {/* Section 1: Identité */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>1. Identité & Entreprise</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Prénom *</label>
                    <input
                      type="text"
                      required
                      value={editingClient.firstName || ''}
                      onChange={e => setEditingClient({ ...editingClient, firstName: e.target.value, fullName: `${e.target.value} ${editingClient.lastName || ''}`.trim() })}
                      placeholder="Ex: Gilles Brice"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Nom *</label>
                    <input
                      type="text"
                      required
                      value={editingClient.lastName || ''}
                      onChange={e => setEditingClient({ ...editingClient, lastName: e.target.value, fullName: `${editingClient.firstName || ''} ${e.target.value}`.trim() })}
                      placeholder="Ex: ATSÉ"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Entreprise / Société *</label>
                    <input
                      type="text"
                      required
                      value={editingClient.company || ''}
                      onChange={e => setEditingClient({ ...editingClient, company: e.target.value })}
                      placeholder="Ex: AGB"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Fonction / Titre professionnel *</label>
                    <input
                      type="text"
                      required
                      value={editingClient.jobTitle || ''}
                      onChange={e => setEditingClient({ ...editingClient, jobTitle: e.target.value })}
                      placeholder="Ex: Concepteur d'applications mobiles"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    />
                  </div>
                </div>

                {/* Logo Entreprise (Intégré au centre du QR Code) */}
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-2xl border border-purple-100 bg-purple-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-bold text-slate-900">Logo Entreprise / Marque</span>
                      </div>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                        Intégré au centre du QR Code
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-3 min-w-0">
                        {editingClient.logoUrl ? (
                          <div className="w-14 h-14 rounded-xl border-2 border-purple-500 overflow-hidden bg-white flex items-center justify-center p-1 shrink-0 shadow-xs">
                            <img src={editingClient.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0">
                            <Building2 className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-slate-800 block truncate">
                            {editingClient.company ? `Logo ${editingClient.company}` : 'Logo Entreprise'}
                          </span>
                          <span className="text-[11px] text-slate-500 block leading-tight">
                            {editingClient.logoUrl ? '✓ Logo inséré au centre du QR Code' : 'S\'affiche au centre du QR Code et sur la fiche'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <label className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold rounded-xl cursor-pointer transition-all inline-flex items-center gap-1.5 shadow-2xs">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{editingClient.logoUrl ? 'Modifier le logo' : 'Ajouter un logo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleClientLogoUpload}
                            className="hidden"
                          />
                        </label>

                        {editingClient.logoUrl && (
                          <button
                            type="button"
                            onClick={() => setEditingClient({ ...editingClient, logoUrl: '', photoUrl: '' })}
                            className="px-2.5 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-medium cursor-pointer"
                          >
                            Retirer
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 text-[11px] text-purple-900 bg-purple-100/60 p-2.5 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />
                      <span>
                        <strong>Intégration automatique dans le QR Code :</strong> Ce logo est intégré au centre du QR Code physique avec correction d'erreur Niveau H.
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Slogan / Devise professionnelle</label>
                    <input
                      type="text"
                      value={editingClient.slogan || ''}
                      onChange={e => setEditingClient({ ...editingClient, slogan: e.target.value })}
                      placeholder="Ex: Donner vie à vos idées / L'excellence numérique au quotidien"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Téléphones & Communications */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>2. Téléphones & Communications</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Téléphone Principal *</label>
                    <input
                      type="text"
                      required
                      value={editingClient.primaryPhone || ''}
                      onChange={e => setEditingClient({ ...editingClient, primaryPhone: e.target.value })}
                      placeholder="+225 01 04 00 00 00"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Numéro WhatsApp</label>
                    <input
                      type="text"
                      value={editingClient.whatsappNumber || ''}
                      onChange={e => setEditingClient({ ...editingClient, whatsappNumber: e.target.value })}
                      placeholder="+225 01 04 00 00 00"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Ligne Secondaire</label>
                    <input
                      type="text"
                      value={editingClient.secondaryPhone || ''}
                      onChange={e => setEditingClient({ ...editingClient, secondaryPhone: e.target.value })}
                      placeholder="+225 07 97 00 00 00"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Téléphone Bureau</label>
                    <input
                      type="text"
                      value={editingClient.workPhone || ''}
                      onChange={e => setEditingClient({ ...editingClient, workPhone: e.target.value })}
                      placeholder="+225 27 22 00 00 00"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">E-mail Principal *</label>
                    <input
                      type="email"
                      required
                      value={editingClient.email || ''}
                      onChange={e => setEditingClient({ ...editingClient, email: e.target.value })}
                      placeholder="client@domaine.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Site Web</label>
                    <input
                      type="text"
                      value={editingClient.websiteUrl || ''}
                      onChange={e => setEditingClient({ ...editingClient, websiteUrl: e.target.value })}
                      placeholder="https://agb-solutions.ci"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Adresse & Localisation */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>3. Adresse & Localisation</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Adresse physique</label>
                    <input
                      type="text"
                      value={editingClient.address || ''}
                      onChange={e => setEditingClient({ ...editingClient, address: e.target.value })}
                      placeholder="Cocody Riviera 3"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Commune / Quartier</label>
                    <input
                      type="text"
                      value={editingClient.commune || ''}
                      onChange={e => setEditingClient({ ...editingClient, commune: e.target.value })}
                      placeholder="Cocody"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Ville</label>
                    <input
                      type="text"
                      value={editingClient.city || 'Abidjan'}
                      onChange={e => setEditingClient({ ...editingClient, city: e.target.value })}
                      placeholder="Abidjan"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Pays</label>
                    <input
                      type="text"
                      value={editingClient.country || 'Côte d\'Ivoire'}
                      onChange={e => setEditingClient({ ...editingClient, country: e.target.value })}
                      placeholder="Côte d'Ivoire"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Lien direct Google Maps</label>
                  <input
                    type="text"
                    value={editingClient.locationLink || ''}
                    onChange={e => setEditingClient({ ...editingClient, locationLink: e.target.value })}
                    placeholder="https://maps.google.com/?q=5.3599,-3.9870"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
                  />
                </div>
              </div>

              {/* Section 4: Dynamic Services List (Add & Remove) */}
              <div className="space-y-3 pt-3 border-t border-slate-100 bg-slate-50/70 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <ListPlus className="w-3.5 h-3.5 text-blue-600" />
                    <span>4. Services & Prestations (Ajout / Retrait dynamique)</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {editingClient.servicesList?.length || 0} enregistré(s)
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newServiceInput}
                    onChange={e => setNewServiceInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddService();
                      }
                    }}
                    placeholder="Ex: Conception d'architectures mobiles, Audit de sécurité..."
                    className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    + Ajouter
                  </button>
                </div>

                {editingClient.servicesList && editingClient.servicesList.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    {editingClient.servicesList.map((srv, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs">
                        <span className="font-medium text-slate-800">• {srv}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveService(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          title="Supprimer ce service"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 5: Dynamic Social Links (Add & Remove) */}
              <div className="space-y-3 pt-3 border-t border-slate-100 bg-slate-50/70 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Share2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>5. Réseaux Sociaux & Liens Connectés</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {editingClient.socialLinks?.length || 0} lien(s)
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={newSocialPlatform}
                    onChange={e => setNewSocialPlatform(e.target.value as SocialLink['platform'])}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="website">Site Web</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter / X</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                    <option value="telegram">Telegram</option>
                  </select>

                  <input
                    type="url"
                    value={newSocialUrl}
                    onChange={e => setNewSocialUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                  />

                  <button
                    type="button"
                    onClick={handleAddSocialLink}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    + Ajouter
                  </button>
                </div>

                {editingClient.socialLinks && editingClient.socialLinks.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    {editingClient.socialLinks.map((link) => (
                      <div key={link.id} className="flex items-center justify-between bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs">
                        <span className="font-semibold text-purple-700 capitalize">{link.platform} : <span className="font-normal text-slate-600 text-[11px]">{link.url}</span></span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSocialLink(link.id)}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 6: Notes internes du concepteur */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>6. Notes Internes du Concepteur (Privées)</span>
                </h3>

                <div>
                  <textarea
                    rows={2}
                    value={editingClient.internalNotes || ''}
                    onChange={e => setEditingClient({ ...editingClient, internalNotes: e.target.value })}
                    placeholder="Notes privées (commandes en cours, finitions spéciales, date de livraison)..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 resize-none"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingClient(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer & Synchroniser QR Code</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
