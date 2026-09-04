import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import 'package:intl/intl.dart';
import '../models/qr_card.dart';
import '../models/custom_form.dart' as custom;
import '../services/firestore_service.dart';
import '../utils/vcard_utils.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
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
        if (card.type == QRType.WEB_LINK &&
            card.publicContent['redirectMode'] == 'DIRECT' &&
            card.accessMode == AccessMode.PUBLIC) {
          if (card.expiresAt == null || card.expiresAt!.isAfter(DateTime.now())) {
            _handleWebLinkDirect(card);
          }
        }
        _firestore.incrementScanCount(card.publicId);
      }
    });
  }

  void _handleWebLinkDirect(QRCard card) async {
    final url = card.publicContent['destinationUrl'];
    if (url != null) {
      final uri = Uri.parse(url.toString());
      if (await canLaunchUrl(uri)) launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _shareVCard(QRCard card) {
    final vcard = VCardUtils.generateVCard(card.publicContent);
    Share.share(vcard, subject: "Contact de ${card.title}");
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<QRCard?>(
      future: _cardFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
              backgroundColor: Color(0xFF0F172A),
              body: Center(child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)));
        }

        final card = snapshot.data;
        if (card == null) {
          return _buildMessageScreen("Fiche Introuvable", "Le QR Code scanné n'existe pas ou a été supprimé.", LucideIcons.search_x);
        }
        if (card.status == CardStatus.DISABLED) {
          return _buildMessageScreen("Fiche Indisponible", "Cette fiche est temporairement désactivée.", LucideIcons.lock);
        }
        if (card.status == CardStatus.DRAFT) {
          return _buildMessageScreen("En cours de création", "Cette fiche n'est pas encore publiée.", LucideIcons.file_pen);
        }

        if (card.expiresAt != null && card.expiresAt!.isBefore(DateTime.now())) {
          return _buildMessageScreen("Fiche Expirée",
              "Cette fiche n'est plus disponible depuis le ${DateFormat('dd/MM/yyyy').format(card.expiresAt!)}.", LucideIcons.calendar_x);
        }

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
          constraints: const BoxConstraints(maxWidth: 320),
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(LucideIcons.lock, size: 56, color: Colors.blueAccent),
              const SizedBox(height: 24),
              const Text("Fiche Protégée", style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900)),
              const SizedBox(height: 8),
              const Text("Veuillez entrer le code d'accès PIN pour consulter cette fiche.",
                  textAlign: TextAlign.center, style: TextStyle(color: Colors.white60, fontSize: 13)),
              const SizedBox(height: 40),
              TextField(
                controller: _pinController,
                obscureText: true,
                keyboardType: TextInputType.number,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold, letterSpacing: 10),
                decoration: InputDecoration(
                  filled: true,
                  fillColor: Colors.white.withValues(alpha: 0.05),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide.none),
                  hintText: "••••",
                  hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.1)),
                ),
              ),
              const SizedBox(height: 24),
              _buildFullButton("DÉVERROUILLER", LucideIcons.lock_keyhole_open, () {
                if (_pinController.text == card.accessPin) {
                  setState(() => _isPinVerified = true);
                } else {
                  ScaffoldMessenger.of(context)
                      .showSnackBar(const SnackBar(backgroundColor: Colors.red, content: Text("Code PIN incorrect.")));
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
      body: Center(
          child: Padding(
        padding: const EdgeInsets.all(40.0),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, size: 80, color: Colors.white12),
          const SizedBox(height: 32),
          Text(title, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900)),
          const SizedBox(height: 16),
          Text(message, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white60, fontSize: 14, height: 1.5)),
        ]),
      )),
    );
  }

  Widget _buildRenderer(QRCard card) {
    switch (card.type) {
      case QRType.WEB_LINK:
        return _renderWebLink(card);
      case QRType.CUSTOM:
        return _renderCustomForm(card);
      case QRType.BUSINESS_CARD:
        return _renderBusinessCard(card);
      case QRType.BOOK:
        return _renderBook(card);
      case QRType.EVENT:
        return _renderEvent(card);
      case QRType.SHOP:
        return _renderShop(card);
      case QRType.LOCATION:
        return _renderLocation(card);
      case QRType.COMPANY:
        return _renderCompany(card);
      case QRType.SOCIAL:
        return _renderSocial(card);
      case QRType.PRODUCT:
        return _renderProductMenu(card);
    }
  }

  // --- RENDERS SPECIFIQUES ---

  Widget _renderWebLink(QRCard card) {
    final c = card.publicContent;
    return _buildScaffold(
      header: _buildHeroHeader(c['displayTitle'] ?? 'Lien Web', c['linkType'] ?? '', '', LucideIcons.link, imageUrl: c['imageUrl']),
      body: [
        if (c['description'] != null)
          Text(c['description'], textAlign: TextAlign.center, style: const TextStyle(color: Color(0xFF475569), fontSize: 14)),
        const SizedBox(height: 40),
        _buildFullButton("OUVRIR LE LIEN", LucideIcons.external_link, () => _handleWebLinkDirect(card), color: const Color(0xFF2563EB)),
      ],
    );
  }

  Widget _renderCustomForm(QRCard card) {
    final sectionsData = card.publicContent['sections'] as List? ?? [];
    final sections = sectionsData.map((e) => custom.CustomSection.fromMap(e)).toList();
    return _buildScaffold(
      header: _buildHeroHeader(card.publicContent['displayTitle'] ?? card.title, '', '', LucideIcons.sparkles,
          imageUrl: card.publicContent['photoUrl']),
      body: [
        if (card.publicContent['description'] != null) ...[
          Text(card.publicContent['description'],
              textAlign: TextAlign.center, style: const TextStyle(fontSize: 14, color: Color(0xFF475569))),
          const SizedBox(height: 32),
        ],
        ...sections.map((s) => _buildCustomSectionView(s)).toList(),
      ],
    );
  }

  Widget _buildCustomSectionView(custom.CustomSection section) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (section.title.isNotEmpty) ...[
          Text(section.title.toUpperCase(),
              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 10, color: Color(0xFF94A3B8), letterSpacing: 2)),
          const SizedBox(height: 12),
        ],
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          margin: const EdgeInsets.only(bottom: 32),
          decoration: BoxDecoration(
              color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: const Color(0xFFF1F5F9))),
          child: Column(children: section.fields.map((f) => _buildCustomFieldRow(f)).toList()),
        ),
      ],
    );
  }

  Widget _buildCustomFieldRow(custom.CustomField f) {
    IconData icon = LucideIcons.info;
    switch (f.type) {
      case custom.CustomFieldType.PHONE:
        icon = LucideIcons.phone;
        break;
      case custom.CustomFieldType.EMAIL:
        icon = LucideIcons.mail;
        break;
      case custom.CustomFieldType.URL:
        icon = LucideIcons.globe;
        break;
      case custom.CustomFieldType.LOCATION:
        icon = LucideIcons.map_pin;
        break;
      case custom.CustomFieldType.MONEY:
        icon = LucideIcons.dollar_sign;
        break;
      case custom.CustomFieldType.IMAGE:
        icon = LucideIcons.image;
        break;
      case custom.CustomFieldType.DOCUMENT:
        icon = LucideIcons.file_text;
        break;
      case custom.CustomFieldType.RATING:
        icon = LucideIcons.star;
        break;
      default:
        icon = LucideIcons.info;
    }
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: () => _handleCustomFieldAction(f),
        child: Row(
          children: [
            Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(color: const Color(0xFF2563EB).withValues(alpha: 0.05), borderRadius: BorderRadius.circular(10)),
                child: Icon(icon, size: 16, color: const Color(0xFF2563EB))),
            const SizedBox(width: 16),
            Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(f.label, style: const TextStyle(fontSize: 9, color: Colors.grey, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
              Text(f.value?.toString() ?? '—',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
            ])),
          ],
        ),
      ),
    );
  }

  void _handleCustomFieldAction(custom.CustomField f) {
    if (f.value == null) return;
    final val = f.value.toString();
    if (f.type == custom.CustomFieldType.PHONE) launchUrl(Uri.parse("tel:$val"));
    if (f.type == custom.CustomFieldType.EMAIL) launchUrl(Uri.parse("mailto:$val"));
    if (f.type == custom.CustomFieldType.URL || f.type == custom.CustomFieldType.DOCUMENT) launchUrl(Uri.parse(val));
  }

  Widget _renderBusinessCard(QRCard card) {
    final c = card.publicContent;
    return _buildScaffold(
      header: _buildHeroHeader(c['fullName'] ?? 'Contact Pro', c['company'] ?? '', c['jobTitle'] ?? '', LucideIcons.user,
          imageUrl: c['photoUrl']),
      body: [
        _buildFullButton("ENREGISTRER LE CONTACT", LucideIcons.user_plus, () => _shareVCard(card), color: const Color(0xFF2563EB)),
        const SizedBox(height: 24),
        _buildActionGrid([
          if (c['primaryPhone'] != null)
            _buildAction(LucideIcons.phone, "Appeler", () => launchUrl(Uri.parse("tel:${c['primaryPhone']}"))),
          if (c['whatsappNumber'] != null) _buildAction(LucideIcons.message_square, "WhatsApp", () => _openWA(c['whatsappNumber'])),
          if (c['email'] != null) _buildAction(LucideIcons.mail, "Email", () => launchUrl(Uri.parse("mailto:${c['email']}"))),
          if (c['websiteUrl'] != null) _buildAction(LucideIcons.globe, "Site Web", () => launchUrl(Uri.parse(c['websiteUrl']))),
        ]),
        _buildInfoSection("COORDONNÉES", [
          if (c['primaryPhone'] != null) _buildInfoRow(LucideIcons.phone, "Téléphone", c['primaryPhone']),
          if (c['email'] != null) _buildInfoRow(LucideIcons.mail, "E-mail", c['email']),
          if (c['address'] != null) _buildInfoRow(LucideIcons.map_pin, "Adresse", c['address']),
        ]),
        if (c['bio'] != null)
          _buildInfoSection("À PROPOS", [Text(c['bio'], style: const TextStyle(fontSize: 14, height: 1.6, color: Color(0xFF475569)))]),
      ],
    );
  }

  Widget _renderBook(QRCard card) {
    final c = card.publicContent;
    return _buildScaffold(
      header: _buildHeroHeader(c['bookTitle'] ?? 'Livre', "Par ${c['bookAuthor'] ?? 'Auteur'}", "ISBN: ${c['bookIsbn'] ?? ''}",
          LucideIcons.book,
          imageUrl: c['bookCoverUrl']),
      body: [
        if (c['bookPrice'] != null)
          Center(
              child: Text("${c['bookPrice']} FCFA",
                  style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Color(0xFF059669)))),
        const SizedBox(height: 24),
        _buildInfoSection("RÉSUMÉ DU LIVRE",
            [Text(c['bookSummary'] ?? 'Aucun résumé disponible.', style: const TextStyle(fontSize: 14, height: 1.6, color: Color(0xFF475569)))]),
        if (c['bookBuyUrl'] != null)
          _buildFullButton("ACHETER LE LIVRE", LucideIcons.shopping_cart, () => launchUrl(Uri.parse(c['bookBuyUrl']))),
      ],
    );
  }

  Widget _renderShop(QRCard card) {
    final c = card.publicContent;
    return _buildScaffold(
      header: _buildHeroHeader(c['shopName'] ?? 'Votre Boutique', c['shopSlogan'] ?? '', c['address'] ?? '', LucideIcons.store,
          imageUrl: c['logoUrl']),
      body: [
        _buildActionGrid([
          if (c['primaryPhone'] != null)
            _buildAction(LucideIcons.phone, "Appeler", () => launchUrl(Uri.parse("tel:${c['primaryPhone']}"))),
          if (c['whatsappNumber'] != null) _buildAction(LucideIcons.message_square, "WhatsApp", () => _openWA(c['whatsappNumber'])),
        ]),
        _buildInfoSection("HORAIRES D'OUVERTURE", [
          for (var h in (c['openingHours'] as List? ?? []))
            Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Text(h['day'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B))),
                  Text(h['isOpen'] ? "${h['openTime']} - ${h['closeTime']}" : "Fermé",
                      style: TextStyle(
                          color: h['isOpen'] ? const Color(0xFF2563EB) : Colors.red, fontSize: 13, fontWeight: FontWeight.w900)),
                ])),
        ]),
      ],
    );
  }

  Widget _renderSocial(QRCard card) {
    final c = card.publicContent;
    return _buildScaffold(
      header: _buildHeroHeader(c['socialName'] ?? 'Profil Digital', c['socialHandle'] ?? '', '', LucideIcons.share_2,
          imageUrl: c['photoUrl']),
      body: [
        if (c['bio'] != null)
          Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text(c['bio'], textAlign: TextAlign.center, style: const TextStyle(fontSize: 14, color: Color(0xFF475569), height: 1.5))),
        const SizedBox(height: 32),
        for (var l in (c['socialLinks'] as List? ?? [])) _buildLinkButton(l['label'] ?? 'Suivez-moi', l['url'] ?? ''),
      ],
    );
  }

  Widget _renderProductMenu(QRCard card) {
    final c = card.publicContent;
    final isMenu = c['productSheetType'] == 'menu';
    return _buildScaffold(
      header: _buildHeroHeader(c['productName'] ?? (isMenu ? 'Menu & Carte' : 'Fiche Produit'), c['productCategory'] ?? '', '',
          isMenu ? LucideIcons.book_open : LucideIcons.package,
          imageUrl: c['productImageUrl'] ?? c['productMainImageUrl']),
      body: [
        if (!isMenu) ...[
          if (c['productPrice'] != null)
            Center(
                child: Text("${c['productPrice']} FCFA",
                    style: const TextStyle(fontSize: 36, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)))),
          const SizedBox(height: 24),
          _buildInfoSection(
              "DESCRIPTION", [Text(c['productDescription'] ?? '', style: const TextStyle(fontSize: 14, height: 1.6, color: Color(0xFF475569)))]),
          if (c['productBuyUrl'] != null)
            _buildFullButton("COMMANDER MAINTENANT", LucideIcons.shopping_bag, () => launchUrl(Uri.parse(c['productBuyUrl'])),
                color: const Color(0xFF059669)),
        ] else ...[
          for (var i in (c['menuItems'] as List? ?? []))
            Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                  color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: const Color(0xFFF1F5F9))),
              child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(i['name'], style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: Color(0xFF0F172A))),
                  if (i['description'] != null)
                    Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(i['description'], style: const TextStyle(fontSize: 11, color: Colors.grey))),
                ])),
                const SizedBox(width: 12),
                Text("${i['price']} F", style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: Color(0xFF059669))),
              ]),
            ),
        ],
      ],
    );
  }

  Widget _renderLocation(QRCard card) {
    final c = card.publicContent;
    return _buildScaffold(
      header: _buildHeroHeader(c['locationName'] ?? 'Localisation GPS', c['locationType'] ?? '', '', LucideIcons.map_pin),
      body: [
        if (c['locationAccess'] != null) _buildInfoSection("ACCÈS", [Text(c['locationAccess'], style: const TextStyle(fontSize: 14))]),
        const SizedBox(height: 24),
        _buildFullButton("OUVRIR DANS GOOGLE MAPS", LucideIcons.navigation,
            () => launchUrl(Uri.parse("https://www.google.com/maps/search/?api=1&query=${c['latitude']},${c['longitude']}"))),
        _buildFullButton("DÉMARRER AVEC WAZE", LucideIcons.send,
            () => launchUrl(Uri.parse("https://waze.com/ul?ll=${c['latitude']},${c['longitude']}&navigate=yes")),
            color: const Color(0xFF29B6F6)),
      ],
    );
  }

  Widget _renderCompany(QRCard card) {
    final c = card.publicContent;
    return _buildScaffold(
      header: _buildHeroHeader(
          c['companyName'] ?? 'Profil Entreprise', "Responsable : ${c['businessManager'] ?? 'Non spécifié'}", "RCCM : ${c['businessRegisterNumber'] ?? '—'}",
          LucideIcons.building_2,
          imageUrl: c['logoUrl']),
      body: [
        _buildInfoSection("IDENTIFICATION JURIDIQUE", [
          if (c['businessType'] != null) _buildInfoRow(LucideIcons.file_text, "Forme Juridique", c['businessType']),
          if (c['businessTaxId'] != null) _buildInfoRow(LucideIcons.hash, "Compte Contribuable", c['businessTaxId']),
          if (c['businessCapital'] != null) _buildInfoRow(LucideIcons.dollar_sign, "Capital Social", c['businessCapital']),
        ]),
        _buildActionGrid([
          if (c['primaryPhone'] != null)
            _buildAction(LucideIcons.phone, "Appeler", () => launchUrl(Uri.parse("tel:${c['primaryPhone']}"))),
          if (c['email'] != null) _buildAction(LucideIcons.mail, "E-mail Pro", () => launchUrl(Uri.parse("mailto:${c['email']}"))),
          if (c['websiteUrl'] != null) _buildAction(LucideIcons.globe, "Site Web", () => launchUrl(Uri.parse(c['websiteUrl']))),
        ]),
        if (c['bio'] != null) _buildInfoSection("PRÉSENTATION", [Text(c['bio'], style: const TextStyle(fontSize: 14, height: 1.6))]),
      ],
    );
  }

  Widget _renderEvent(QRCard card) {
    final c = card.publicContent;
    return _buildScaffold(
      header: _buildHeroHeader(c['eventTitle'] ?? 'Événement Spécial', c['eventType'] ?? '', c['eventDate'] ?? '', LucideIcons.calendar,
          imageUrl: c['eventImageUrl']),
      body: [
        _buildInfoSection("À PROPOS DE L'ÉVÉNEMENT", [Text(c['eventDescription'] ?? '', style: const TextStyle(fontSize: 14, height: 1.5))]),
        _buildInfoSection("LIEU DE RÉCEPTION",
            [Text(c['eventLocation'] ?? 'Lieu à confirmer', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14))]),
        if (c['eventBookingUrl'] != null)
          _buildFullButton("RÉSERVER MA PLACE", LucideIcons.ticket, () => launchUrl(Uri.parse(c['eventBookingUrl'])),
              color: const Color(0xFFD97706)),
      ],
    );
  }

  // --- UI COMPONENTS ---

  Widget _buildScaffold({required Widget header, required List<Widget> body}) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
          child: Column(children: [
        header,
        Padding(padding: const EdgeInsets.all(24), child: Column(children: body)),
        const SizedBox(height: 60),
        const Text("PLATEFORME DÉPLOYÉE PAR AGB STUDIO",
            style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFF94A3B8), letterSpacing: 3)),
        const SizedBox(height: 40),
      ])),
    );
  }

  Widget _buildHeroHeader(String title, String subtitle, String extra, IconData icon, {String? imageUrl}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(24, 80, 24, 60),
      decoration: const BoxDecoration(color: Color(0xFF0F172A), borderRadius: BorderRadius.vertical(bottom: Radius.circular(56))),
      child: Column(children: [
        Container(
            width: 96,
            height: 96,
            decoration:
                BoxDecoration(color: Colors.white.withValues(alpha: 0.05), borderRadius: BorderRadius.circular(32), border: Border.all(color: Colors.white12)),
            child: imageUrl != null && imageUrl.isNotEmpty
                ? ClipRRect(borderRadius: BorderRadius.circular(28), child: Image.network(imageUrl, fit: BoxFit.cover))
                : Icon(icon, color: Colors.white, size: 40)),
        const SizedBox(height: 32),
        Text(title.toUpperCase(),
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900, letterSpacing: 1.2)),
        if (subtitle.isNotEmpty)
          Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text(subtitle,
                  textAlign: TextAlign.center, style: const TextStyle(color: Colors.blueAccent, fontSize: 14, fontWeight: FontWeight.bold))),
        if (extra.isNotEmpty)
          Padding(
              padding: const EdgeInsets.only(top: 6),
              child: Text(extra,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.white38, fontSize: 11, fontWeight: FontWeight.bold))),
      ]),
    );
  }

  Widget _buildActionGrid(List<Widget> children) =>
      Padding(padding: const EdgeInsets.only(bottom: 40), child: Row(mainAxisAlignment: MainAxisAlignment.spaceEvenly, children: children));

  Widget _buildAction(IconData icon, String label, VoidCallback onTap) => GestureDetector(
      onTap: onTap,
      child: Column(children: [
        Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFF1F5F9)),
                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 15)]),
            child: Icon(icon, color: const Color(0xFF2563EB), size: 24)),
        const SizedBox(height: 10),
        Text(label.toUpperCase(), style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Color(0xFF64748B), letterSpacing: 1)),
      ]));

  Widget _buildInfoSection(String title, List<Widget> children) => Container(
        margin: const EdgeInsets.only(bottom: 32),
        width: double.infinity,
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF94A3B8), letterSpacing: 2)),
          const SizedBox(height: 16),
          Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(28),
                  border: Border.all(color: const Color(0xFFF1F5F9)),
                  boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.01), blurRadius: 20)]),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: children)),
        ]),
      );

  Widget _buildInfoRow(IconData icon, String label, String value) => Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Row(children: [
        Icon(icon, size: 18, color: const Color(0xFF2563EB)),
        const SizedBox(width: 16),
        Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: const TextStyle(fontSize: 9, color: Color(0xFF94A3B8), fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF1E293B))),
        ])),
      ]));

  Widget _buildFullButton(String label, IconData icon, VoidCallback onTap, {Color color = const Color(0xFF0F172A)}) => Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: ElevatedButton.icon(
          onPressed: onTap,
          icon: Icon(icon, size: 18),
          label: Text(label),
          style: ElevatedButton.styleFrom(
              minimumSize: const Size(double.infinity, 64),
              backgroundColor: color,
              foregroundColor: Colors.white,
              elevation: 10,
              shadowColor: color.withValues(alpha: 0.3),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              textStyle: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 2))));

  Widget _buildLinkButton(String label, String url) => Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GestureDetector(
          onTap: () => launchUrl(Uri.parse(url)),
          child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 22),
              decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: const Color(0xFFF1F5F9)),
                  boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 15, offset: const Offset(0, 5))]),
              child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Text(label, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: Color(0xFF1E293B))),
                Icon(LucideIcons.external_link, size: 18, color: Color(0xFF94A3B8))
              ]))));

  void _openWA(String n) =>
      launchUrl(Uri.parse("https://wa.me/${n.replaceAll(RegExp(r'[^\d]'), '')}"), mode: LaunchMode.externalApplication);
}
