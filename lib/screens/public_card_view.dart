import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import 'package:intl/intl.dart';
import '../models/qr_card.dart';
import '../models/custom_form.dart' as custom;
import '../services/firestore_service.dart';
import '../utils/vcard_utils.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';

class PublicCardView extends StatefulWidget {
  final String publicId;

  const PublicCardView({super.key, required this.publicId});

  @override
  State<PublicCardView> createState() => _PublicCardViewState();
}

class _PublicCardViewState extends State<PublicCardView> {
  final _firestore = FirestoreService();
  late Future<QRCard?> _cardFuture;
  final TextEditingController _pinController = TextEditingController();
  bool _isPinVerified = false;

  @override
  void initState() {
    super.initState();
    _cardFuture = _firestore.getCardByPublicId(widget.publicId);
    _cardFuture.then((card) {
      if (card != null && card.status == CardStatus.PUBLISHED) {
        // Redirection direct pour WEB_LINK si configuré
        if (card.type == QRType.WEB_LINK && card.content['redirectMode'] == 'DIRECT' && card.accessMode == AccessMode.PUBLIC) {
          if (card.expiresAt == null || card.expiresAt!.isAfter(DateTime.now())) {
            _handleWebLinkDirect(card);
          }
        }
        _firestore.incrementScanCount(card.publicId);
      }
    });
  }

  void _handleWebLinkDirect(QRCard card) async {
    final url = card.content['destinationUrl'];
    if (url != null) {
      final uri = Uri.parse(url.toString());
      if (await canLaunchUrl(uri)) {
        launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    }
  }

  void _shareVCard(QRCard card) {
    final vcard = VCardUtils.generateVCard(card.content);
    Share.share(vcard, subject: "Contact de ${card.title}");
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<QRCard?>(
      future: _cardFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(backgroundColor: Color(0xFF0F172A), body: Center(child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)));
        }
        
        final card = snapshot.data;
        if (card == null) return _buildMessageScreen("Introuvable", "Ce QR Code n'existe pas.", LucideIcons.searchX);
        if (card.status == CardStatus.DISABLED) return _buildMessageScreen("Désactivée", "Cette fiche est temporairement indisponible.", LucideIcons.lock);
        if (card.status == CardStatus.DRAFT) return _buildMessageScreen("Brouillon", "En attente de publication.", LucideIcons.fileEdit);
        
        // Vérification expiration
        if (card.expiresAt != null && card.expiresAt!.isBefore(DateTime.now())) {
          return _buildMessageScreen("Expirée", "Cette fiche est arrivée à expiration le ${DateFormat('dd/MM/yyyy').format(card.expiresAt!)}.", LucideIcons.calendarX);
        }

        // Vérification PIN
        if (card.accessMode == AccessMode.PIN_PROTECTED && !_isPinVerified) {
          return _buildPinScreen(card);
        }

        return _buildRenderer(card);
      },
    );
  }

  Widget _buildPinScreen(QRCard card) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Center(
        child: Container(
          maxWidth: 320,
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(LucideIcons.lock, size: 48, color: Colors.blueAccent),
              const SizedBox(height: 24),
              const Text("Fiche Protégée", style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.black)),
              const SizedBox(height: 8),
              const Text("Veuillez entrer le code PIN pour consulter les informations.", textAlign: TextAlign.center, style: TextStyle(color: Colors.white60, fontSize: 12)),
              const SizedBox(height: 32),
              TextField(
                controller: _pinController,
                obscureText: true,
                keyboardType: TextInputType.number,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold, letterSpacing: 8),
                decoration: InputDecoration(
                  filled: true, fillColor: Colors.white.withOpacity(0.05),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 24),
              _buildFullButton("DÉVERROUILLER", LucideIcons.unlock, () {
                if (_pinController.text == card.accessPin) {
                  setState(() => _isPinVerified = true);
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(backgroundColor: Colors.red, content: Text("Code PIN incorrect.")));
                }
              }, color: Colors.blueAccent),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMessageScreen(String title, String message, IconData icon) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 64, color: Colors.white24),
        const SizedBox(height: 24),
        Text(title, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.black)),
        const SizedBox(height: 12),
        Text(message, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white60, fontSize: 13)),
      ])),
    );
  }

  Widget _buildRenderer(QRCard card) {
    switch (card.type) {
      case QRType.WEB_LINK: return _renderWebLink(card);
      case QRType.CUSTOM: return _renderCustomForm(card);
      case QRType.BUSINESS_CARD: return _renderBusinessCard(card);
      case QRType.BOOK: return _renderBook(card);
      case QRType.EVENT: return _renderEvent(card);
      case QRType.SHOP: return _renderShop(card);
      case QRType.LOCATION: return _renderLocation(card);
      case QRType.COMPANY: return _renderCompany(card);
      case QRType.SOCIAL: return _renderSocial(card);
      case QRType.PRODUCT: return _renderProductMenu(card);
    }
  }

  // --- RENDERS ---

  Widget _renderWebLink(QRCard card) {
    final c = card.content;
    return _buildScaffold(
      header: _buildHeroHeader(c['displayTitle'] ?? 'Lien Web', c['linkType'] ?? '', '', LucideIcons.link, imageUrl: c['imageUrl']),
      body: [
        if (c['description'] != null) Text(c['description'], textAlign: TextAlign.center, style: const TextStyle(color: Color(0xFF475569))),
        const SizedBox(height: 32),
        _buildFullButton("OUVRIR LE LIEN", LucideIcons.externalLink, () => _handleWebLinkDirect(card)),
      ],
    );
  }

  Widget _renderCustomForm(QRCard card) {
    final sectionsData = card.content['sections'] as List? ?? [];
    final sections = sectionsData.map((e) => custom.CustomSection.fromMap(e)).toList();
    
    return _buildScaffold(
      header: _buildHeroHeader(card.content['displayTitle'] ?? card.title, '', '', LucideIcons.sparkles, imageUrl: card.content['photoUrl']),
      body: [
        if (card.content['description'] != null) ...[
          Text(card.content['description'], textAlign: TextAlign.center, style: const TextStyle(fontSize: 13, color: Color(0xFF475569))),
          const SizedBox(height: 24),
        ],
        ...sections.map((s) => _buildCustomSectionView(s)).toList(),
      ],
    );
  }

  Widget _buildCustomSectionView(custom.CustomSection section) {
    // Ne montrer que les champs publics pour le visiteur
    final publicFields = section.fields.where((f) => f.isPublic && f.isVisible).toList();
    if (publicFields.isEmpty) return const SizedBox();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (section.title.isNotEmpty) ...[
          Text(section.title.toUpperCase(), style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 10, color: Color(0xFF94A3B8), letterSpacing: 1.5)),
          const SizedBox(height: 12),
        ],
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          margin: const EdgeInsets.only(bottom: 24),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: const Color(0xFFF1F5F9))),
          child: Column(
            children: publicFields.map((f) => _buildCustomFieldRow(f)).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildCustomFieldRow(custom.CustomField f) {
    IconData icon = LucideIcons.fileText;
    switch(f.type) {
      case custom.CustomFieldType.PHONE: icon = LucideIcons.phone; break;
      case custom.CustomFieldType.EMAIL: icon = LucideIcons.mail; break;
      case custom.CustomFieldType.URL: icon = LucideIcons.globe; break;
      case custom.CustomFieldType.LOCATION: icon = LucideIcons.mapPin; break;
      case custom.CustomFieldType.MONEY: icon = LucideIcons.dollarSign; break;
      case custom.CustomFieldType.IMAGE: icon = LucideIcons.image; break;
      default: icon = LucideIcons.info;
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: () => _handleCustomFieldAction(f),
        child: Row(
          children: [
            Icon(icon, size: 16, color: const Color(0xFF2563EB)),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(f.label, style: const TextStyle(fontSize: 9, color: Colors.grey, fontWeight: FontWeight.bold)),
              Text(f.value?.toString() ?? '—', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
            ])),
            if (f.type == custom.CustomFieldType.URL || f.type == custom.CustomFieldType.PHONE || f.type == custom.CustomFieldType.EMAIL)
              const Icon(LucideIcons.chevronRight, size: 14, color: Colors.grey),
          ],
        ),
      ),
    );
  }

  void _handleCustomFieldAction(custom.CustomField f) {
    if (f.value == null) return;
    final val = f.value.toString();
    switch(f.type) {
      case custom.CustomFieldType.PHONE: launchUrl(Uri.parse("tel:$val")); break;
      case custom.CustomFieldType.EMAIL: launchUrl(Uri.parse("mailto:$val")); break;
      case custom.CustomFieldType.URL: launchUrl(Uri.parse(val)); break;
      default: break;
    }
  }

  Widget _renderBusinessCard(QRCard card) {
    final c = card.content;
    return _buildScaffold(
      header: _buildHeroHeader(c['fullName'] ?? 'Contact', c['company'] ?? '', c['jobTitle'] ?? '', LucideIcons.user, imageUrl: c['photoUrl']),
      body: [
        _buildFullButton("ENREGISTRER LE CONTACT", LucideIcons.userPlus, () => _shareVCard(card), color: const Color(0xFF2563EB)),
        const SizedBox(height: 12),
        _buildActionGrid([
          if (c['primaryPhone'] != null) _buildAction(LucideIcons.phone, "Appeler", () => launchUrl(Uri.parse("tel:${c['primaryPhone']}"))),
          if (c['whatsappNumber'] != null) _buildAction(LucideIcons.messageSquare, "WhatsApp", () => _openWA(c['whatsappNumber'])),
          if (c['email'] != null) _buildAction(LucideIcons.mail, "Email", () => launchUrl(Uri.parse("mailto:${c['email']}"))),
          if (c['websiteUrl'] != null) _buildAction(LucideIcons.globe, "Site Web", () => launchUrl(Uri.parse(c['websiteUrl']))),
        ]),
        _buildInfoSection("COORDONNÉES", [
          if (c['primaryPhone'] != null) _buildInfoRow(LucideIcons.phone, "Téléphone", c['primaryPhone']),
          if (c['email'] != null) _buildInfoRow(LucideIcons.mail, "E-mail", c['email']),
          if (c['address'] != null) _buildInfoRow(LucideIcons.mapPin, "Adresse", c['address']),
        ]),
        if (c['bio'] != null) _buildInfoSection("À PROPOS", [Text(c['bio'], style: const TextStyle(fontSize: 13, height: 1.6, color: Color(0xFF475569)))]),
      ],
    );
  }

  Widget _renderBook(QRCard card) {
    final c = card.content;
    return _buildScaffold(
      header: _buildHeroHeader(c['bookTitle'] ?? 'Livre', "Par ${c['bookAuthor'] ?? 'Auteur'}", "ISBN: ${c['bookIsbn'] ?? ''}", LucideIcons.book, imageUrl: c['bookCoverUrl']),
      body: [
        if (c['bookPrice'] != null) Center(child: Text("${c['bookPrice']} FCFA", style: const TextStyle(fontSize: 28, fontWeight: FontWeight.black, color: Color(0xFF059669)))),
        _buildInfoSection("RÉSUMÉ", [Text(c['bookSummary'] ?? 'Aucun résumé.', style: const TextStyle(fontSize: 13, height: 1.6))]),
        if (c['bookBuyUrl'] != null) _buildFullButton("ACHETER LE LIVRE", LucideIcons.shoppingCart, () => launchUrl(Uri.parse(c['bookBuyUrl']))),
      ],
    );
  }

  Widget _renderShop(QRCard card) {
    final c = card.content;
    return _buildScaffold(
      header: _buildHeroHeader(c['shopName'] ?? 'Commerce', c['shopSlogan'] ?? '', c['address'] ?? '', LucideIcons.store, imageUrl: c['logoUrl']),
      body: [
        _buildActionGrid([
          if (c['primaryPhone'] != null) _buildAction(LucideIcons.phone, "Appeler", () => launchUrl(Uri.parse("tel:${c['primaryPhone']}"))),
          if (c['whatsappNumber'] != null) _buildAction(LucideIcons.messageSquare, "WhatsApp", () => _openWA(c['whatsappNumber'])),
        ]),
        _buildInfoSection("HORAIRES", [
          for (var h in (c['openingHours'] as List? ?? [])) 
            Padding(padding: const EdgeInsets.only(bottom: 4), child: Row(mainAxisAlignment: MainAxisAlignment.between, children: [
              Text(h['day'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              Text(h['isOpen'] ? "${h['openTime']} - ${h['closeTime']}" : "Fermé", style: TextStyle(color: h['isOpen'] ? Colors.black : Colors.red, fontSize: 12, fontWeight: FontWeight.w900)),
            ])),
        ]),
      ],
    );
  }

  Widget _renderSocial(QRCard card) {
    final c = card.content;
    return _buildScaffold(
      header: _buildHeroHeader(c['socialName'] ?? 'Profil', c['socialHandle'] ?? '', c['socialProfession'] ?? '', LucideIcons.share2, imageUrl: c['photoUrl']),
      body: [
        if (c['bio'] != null) Padding(padding: const EdgeInsets.symmetric(horizontal: 10), child: Text(c['bio'], textAlign: TextAlign.center, style: const TextStyle(fontSize: 13, color: Color(0xFF475569)))),
        const SizedBox(height: 20),
        for (var l in (c['socialLinks'] as List? ?? [])) 
          _buildLinkButton(l['label'] ?? 'Lien', l['url'] ?? ''),
      ],
    );
  }

  Widget _renderProductMenu(QRCard card) {
    final c = card.content;
    final isMenu = c['productSheetType'] == 'menu';
    return _buildScaffold(
      header: _buildHeroHeader(c['productName'] ?? (isMenu ? 'La Carte' : 'Produit'), c['productCategory'] ?? '', '', isMenu ? LucideIcons.bookOpen : LucideIcons.package, imageUrl: c['productImageUrl'] ?? c['productMainImageUrl']),
      body: [
        if (!isMenu) ...[
          if (c['productPrice'] != null) Center(child: Text("${c['productPrice']} FCFA", style: const TextStyle(fontSize: 32, fontWeight: FontWeight.black))),
          _buildInfoSection("DESCRIPTION", [Text(c['productDescription'] ?? '')]),
          if (c['productBuyUrl'] != null) _buildFullButton("COMMANDER", LucideIcons.shoppingBag, () => launchUrl(Uri.parse(c['productBuyUrl']))),
        ] else ...[
          for (var i in (c['menuItems'] as List? ?? []))
            Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFFF1F5F9))),
              child: Row(mainAxisAlignment: MainAxisAlignment.between, children: [
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(i['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  if (i['description'] != null) Text(i['description'], style: const TextStyle(fontSize: 11, color: Colors.grey)),
                ])),
                Text("${i['price']} F", style: const TextStyle(fontWeight: FontWeight.black, color: Color(0xFF059669))),
              ]),
            ),
        ],
      ],
    );
  }

  Widget _renderLocation(QRCard card) {
    final c = card.content;
    return _buildScaffold(
      header: _buildHeroHeader(c['locationName'] ?? 'Lieu', c['locationType'] ?? '', c['locationAccess'] ?? '', LucideIcons.mapPin),
      body: [
        _buildFullButton("OUVRIR DANS MAPS", LucideIcons.navigation, () => launchUrl(Uri.parse("https://www.google.com/maps/search/?api=1&query=${c['latitude']},${c['longitude']}"))),
        _buildFullButton("OUVRIR DANS WAZE", LucideIcons.send, () => launchUrl(Uri.parse("https://waze.com/ul?ll=${c['latitude']},${c['longitude']}&navigate=yes"))),
      ],
    );
  }

  Widget _renderCompany(QRCard card) {
    final c = card.content;
    return _buildScaffold(
      header: _buildHeroHeader(c['companyName'] ?? 'Société', "Responsable : ${c['businessManager'] ?? ''}", "RCCM : ${c['businessRegisterNumber'] ?? ''}", LucideIcons.building2, imageUrl: c['logoUrl']),
      body: [
        _buildInfoSection("INFOS JURIDIQUES", [
          if (c['businessType'] != null) _buildInfoRow(LucideIcons.fileText, "Forme", c['businessType']),
          if (c['businessTaxId'] != null) _buildInfoRow(LucideIcons.hash, "N° Contribuable", c['businessTaxId']),
          if (c['businessCapital'] != null) _buildInfoRow(LucideIcons.dollarSign, "Capital Social", c['businessCapital']),
        ]),
        _buildActionGrid([
          if (c['primaryPhone'] != null) _buildAction(LucideIcons.phone, "Appeler", () => launchUrl(Uri.parse("tel:${c['primaryPhone']}"))),
          if (c['email'] != null) _buildAction(LucideIcons.mail, "Email", () => launchUrl(Uri.parse("mailto:${c['email']}"))),
          if (c['websiteUrl'] != null) _buildAction(LucideIcons.globe, "Site Web", () => launchUrl(Uri.parse(c['websiteUrl']))),
        ]),
      ],
    );
  }

  Widget _renderEvent(QRCard card) {
     final c = card.content;
     return _buildScaffold(
       header: _buildHeroHeader(c['eventTitle'] ?? 'Événement', c['eventType'] ?? '', c['eventDate'] ?? '', LucideIcons.calendar, imageUrl: c['eventImageUrl']),
       body: [
         _buildInfoSection("DESCRIPTION", [Text(c['eventDescription'] ?? '')]),
         _buildInfoSection("LIEU", [Text(c['eventLocation'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold))]),
         if (c['eventBookingUrl'] != null) _buildFullButton("RÉSERVER MA PLACE", LucideIcons.ticket, () => launchUrl(Uri.parse(c['eventBookingUrl']))),
       ],
     );
  }

  Widget _renderDefault(QRCard card) {
    return _renderBusinessCard(card);
  }

  // --- UI COMPONENTS ---

  Widget _buildScaffold({required Widget header, required List<Widget> body}) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(child: Column(children: [
        header,
        Padding(padding: const EdgeInsets.all(24), child: Column(children: body)),
        const SizedBox(height: 60),
        const Text("PROFIL DIGITAL CERTIFIÉ • AGB STUDIO", style: TextStyle(fontSize: 9, fontWeight: FontWeight.black, color: Colors.grey, letterSpacing: 2)),
        const SizedBox(height: 40),
      ])),
    );
  }

  Widget _buildHeroHeader(String title, String subtitle, String extra, IconData icon, {String? imageUrl}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(24, 80, 24, 60),
      decoration: const BoxDecoration(color: Color(0xFF0F172A), borderRadius: BorderRadius.vertical(bottom: Radius.circular(48))),
      child: Column(children: [
        Container(
          width: 80, height: 80, 
          decoration: BoxDecoration(color: Colors.white.withOpacity(0.05), borderRadius: BorderRadius.circular(28)), 
          child: imageUrl != null && imageUrl.isNotEmpty 
            ? ClipRRect(borderRadius: BorderRadius.circular(24), child: Image.network(imageUrl, fit: BoxFit.cover))
            : Icon(icon, color: Colors.white, size: 32)
        ),
        const SizedBox(height: 32),
        Text(title.toUpperCase(), textAlign: TextAlign.center, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900, letterSpacing: 1)),
        if (subtitle.isNotEmpty) Padding(padding: const EdgeInsets.only(top: 8), child: Text(subtitle, textAlign: TextAlign.center, style: const TextStyle(color: Colors.blueAccent, fontSize: 13, fontWeight: FontWeight.bold))),
        if (extra.isNotEmpty) Padding(padding: const EdgeInsets.only(top: 4), child: Text(extra, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white38, fontSize: 11))),
      ]),
    );
  }

  Widget _buildActionGrid(List<Widget> children) => Padding(padding: const EdgeInsets.only(bottom: 32), child: Row(mainAxisAlignment: MainAxisAlignment.spaceEvenly, children: children));

  Widget _buildAction(IconData icon, String label, VoidCallback onTap) => GestureDetector(onTap: onTap, child: Column(children: [
    Container(width: 56, height: 56, decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle, border: Border.all(color: const Color(0xFFF1F5F9)), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)]), child: Icon(icon, color: const Color(0xFF2563EB), size: 22)),
    const SizedBox(height: 8),
    Text(label.toUpperCase(), style: const TextStyle(fontSize: 8, fontWeight: FontWeight.black, color: Colors.grey)),
  ]));

  Widget _buildInfoSection(String title, List<Widget> children) => Container(
    margin: const EdgeInsets.only(bottom: 24),
    width: double.infinity,
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(title, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF94A3B8), letterSpacing: 1.5)),
      const SizedBox(height: 16),
      Container(padding: const EdgeInsets.all(20), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: const Color(0xFFF1F5F9))), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: children)),
    ]),
  );

  Widget _buildInfoRow(IconData icon, String label, String value) => Padding(padding: const EdgeInsets.only(bottom: 16), child: Row(children: [
    Icon(icon, size: 16, color: const Color(0xFF2563EB)),
    const SizedBox(width: 12),
    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: const TextStyle(fontSize: 9, color: Colors.grey, fontWeight: FontWeight.bold)),
      Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
    ])),
  ]));

  Widget _buildFullButton(String label, IconData icon, VoidCallback onTap, {Color color = const Color(0xFF0F172A)}) => Padding(padding: const EdgeInsets.only(bottom: 12), child: ElevatedButton.icon(onPressed: onTap, icon: Icon(icon, size: 18), label: Text(label), style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 60), backgroundColor: color, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)), textStyle: const TextStyle(fontWeight: FontWeight.black, fontSize: 12, letterSpacing: 1.5))));

  Widget _buildLinkButton(String label, String url) => Padding(padding: const EdgeInsets.only(bottom: 12), child: GestureDetector(onTap: () => launchUrl(Uri.parse(url)), child: Container(padding: const EdgeInsets.all(20), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFFF1F5F9)), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)]), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text(label, style: const TextStyle(fontWeight: FontWeight.black, fontSize: 13)), const Icon(LucideIcons.externalLink, size: 16, color: Colors.grey)]))));

  void _openWA(String n) => launchUrl(Uri.parse("https://wa.me/${n.replaceAll(RegExp(r'[^\d]'), '')}"), mode: LaunchMode.externalApplication);
}
