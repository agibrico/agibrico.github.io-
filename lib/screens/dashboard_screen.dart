import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:share_plus/share_plus.dart';
import '../services/auth_service.dart';
import '../services/firestore_service.dart';
import '../services/id_generator_service.dart';
import '../models/qr_card.dart';
import 'card_editor_screen.dart';
import 'public_card_view.dart';
import 'package:flutter_lucide/flutter_lucide.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _firestore = FirestoreService();
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text('SMART QR STUDIO',
            style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14, letterSpacing: 2, color: Color(0xFF0F172A))),
        centerTitle: true,
        actions: [
          IconButton(
            icon: Icon(LucideIcons.log_out, size: 20, color: Color(0xFF64748B)),
            onPressed: () => Provider.of<AuthService>(context, listen: false).signOut(),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          _buildSearchBar(),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildStatsHeader(),
                  const SizedBox(height: 32),
                  _buildSectionHeaderWithAction('MES FICHES RÉCENTES', () => _showTypeSelector(context)),
                  const SizedBox(height: 16),
                  _buildCardsList(),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
      child: TextField(
        controller: _searchController,
        onChanged: (v) => setState(() => _searchQuery = v.toLowerCase()),
        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
        decoration: InputDecoration(
          hintText: 'Rechercher une fiche, un ID...',
          prefixIcon: Icon(LucideIcons.search, size: 18),
          filled: true,
          fillColor: const Color(0xFFF1F5F9),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
          contentPadding: const EdgeInsets.symmetric(vertical: 12),
        ),
      ),
    );
  }

  Widget _buildSectionHeaderWithAction(String title, VoidCallback onAction) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title,
            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 10, color: Color(0xFF94A3B8), letterSpacing: 1.5)),
        ElevatedButton.icon(
          onPressed: onAction,
          icon: Icon(LucideIcons.plus, size: 14),
          label: const Text("NOUVELLE", style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900)),
          style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2563EB),
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
        ),
      ],
    );
  }

  Widget _buildStatsHeader() {
    return FutureBuilder<Map<String, int>>(
      future: _firestore.getStats(),
      builder: (context, snapshot) {
        final stats = snapshot.data ?? {'total': 0, 'published': 0, 'totalScans': 0};
        return GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.8,
          children: [
            _buildStatCard('Total Fiches', stats['total'].toString(), LucideIcons.plus, const Color(0xFF2563EB)),
            _buildStatCard('Scans Cumulés', stats['totalScans'].toString(), LucideIcons.qr_code, const Color(0xFF7C3AED)),
          ],
        );
      },
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFF1F5F9)),
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10)
          ]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 18),
          const SizedBox(height: 8),
          Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
          Text(label, style: const TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8))),
        ],
      ),
    );
  }

  Widget _buildCardsList() {
    return StreamBuilder<List<QRCard>>(
      stream: _firestore.streamCards(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());

        final allCards = snapshot.data!;
        final filteredCards = allCards.where((c) {
          final t = c.title.toLowerCase();
          final id = c.publicId.toLowerCase();
          final type = c.type.name.toLowerCase();
          return t.contains(_searchQuery) || id.contains(_searchQuery) || type.contains(_searchQuery);
        }).toList();

        if (filteredCards.isEmpty) {
          return const Center(
              child: Padding(
                  padding: EdgeInsets.all(40),
                  child: Text("Aucune fiche trouvée", style: TextStyle(color: Colors.grey, fontSize: 12))));
        }

        return ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: filteredCards.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) => _buildCardItem(filteredCards[index]),
        );
      },
    );
  }

  Widget _buildCardItem(QRCard card) {
    return Container(
      decoration:
          BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFFF1F5F9))),
      child: ListTile(
        contentPadding: const EdgeInsets.all(12),
        leading: Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(14)),
            child: Icon(_getIconForType(card.type), color: const Color(0xFF2563EB), size: 20)),
        title: Text(card.title, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF1E293B))),
        subtitle: Row(children: [
          Text(card.publicId, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8))),
          const SizedBox(width: 8),
          _buildStatusBadge(card.status),
        ]),
        trailing: PopupMenuButton<String>(
          icon: Icon(LucideIcons.ellipsis_vertical, size: 18, color: Color(0xFF94A3B8)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          onSelected: (val) => _handleMenuAction(val, card),
          itemBuilder: (context) => [
            PopupMenuItem(
                value: 'view',
                child: Row(children: [Icon(LucideIcons.eye, size: 16), SizedBox(width: 12), Text("Aperçu public", style: TextStyle(fontSize: 12))])),
            PopupMenuItem(
                value: 'edit',
                child: Row(children: [Icon(LucideIcons.pencil, size: 16), SizedBox(width: 12), Text("Modifier", style: TextStyle(fontSize: 12))])),
            PopupMenuItem(
                value: 'qr',
                child: Row(children: [Icon(LucideIcons.qr_code, size: 16), SizedBox(width: 12), Text("Afficher QR", style: TextStyle(fontSize: 12))])),
            PopupMenuItem(
                value: 'delete',
                child: Row(children: [
                  Icon(LucideIcons.trash_2, size: 16, color: Colors.red),
                  SizedBox(width: 12),
                  Text("Supprimer", style: TextStyle(fontSize: 12, color: Colors.red))
                ])),
          ],
        ),
      ),
    );
  }

  void _handleMenuAction(String action, QRCard card) {
    if (action == 'view') {
      Navigator.push(context, MaterialPageRoute(builder: (_) => PublicCardView(publicId: card.publicId)));
    }
    if (action == 'edit') {
      Navigator.push(
          context, MaterialPageRoute(builder: (_) => CardEditorScreen(initialCard: card, initialType: card.type)));
    }
    if (action == 'qr') _showQRDialog(card);
    if (action == 'delete') _confirmDelete(card);
  }

  void _showQRDialog(QRCard card) {
    final String url = "https://agibrico.github.io/agibrico.github.io-/#q/${card.publicId}";
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text("QR CODE DYNAMIQUE", style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 1.5)),
            const SizedBox(height: 24),
            QrImageView(
              data: url,
              version: QrVersions.auto,
              size: 200,
              eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: Color(0xFF0F172A)),
              dataModuleStyle: const QrDataModuleStyle(dataModuleShape: QrDataModuleShape.square, color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 16),
            Text(card.publicId,
                style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF2563EB))),
            const SizedBox(height: 8),
            Text(url, textAlign: TextAlign.center, style: const TextStyle(fontSize: 9, color: Colors.grey)),
            const SizedBox(height: 24),
            Row(children: [
              Expanded(
                  child: OutlinedButton.icon(
                      onPressed: () => Navigator.pop(context),
                      icon: Icon(LucideIcons.x, size: 14),
                      label: const Text("FERMER"),
                      style: OutlinedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))))),
              const SizedBox(width: 12),
              Expanded(
                  child: ElevatedButton.icon(
                      onPressed: () => Share.share(url),
                      icon: Icon(LucideIcons.share_2, size: 14),
                      label: const Text("PARTAGER"),
                      style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF2563EB),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))))),
            ]),
          ],
        ),
      ),
    );
  }

  void _confirmDelete(QRCard card) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Supprimer la fiche ?", style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
        content: Text("Cette action est irréversible. Le QR Code ${card.publicId} ne fonctionnera plus."),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("ANNULER")),
          TextButton(
              onPressed: () {
                _firestore.deleteCard(card.publicId);
                Navigator.pop(context);
              },
              child: const Text("SUPPRIMER", style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold))),
        ],
      ),
    );
  }

  void _showTypeSelector(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(32))),
      builder: (context) => Container(
        padding: const EdgeInsets.all(32),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Text('CHOISIR LE TYPE DE FICHE', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14, letterSpacing: 1.5)),
          const SizedBox(height: 24),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 2.2,
            children: QRType.values
                .map((t) => InkWell(
                      onTap: () {
                        Navigator.pop(context);
                        Navigator.push(context, MaterialPageRoute(builder: (_) => CardEditorScreen(initialType: t)));
                      },
                      child: Container(
                          decoration: BoxDecoration(
                              color: const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: const Color(0xFFF1F5F9))),
                          child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                            Icon(_getIconForType(t), size: 14, color: const Color(0xFF2563EB)),
                            const SizedBox(width: 8),
                            Text(t.name.replaceAll('_', ' '), style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold))
                          ])),
                    ))
                .toList(),
          ),
        ]),
      ),
    );
  }

  IconData _getIconForType(QRType type) {
    switch (type) {
      case QRType.BUSINESS_CARD:
        return LucideIcons.user;
      case QRType.BOOK:
        return LucideIcons.book_open;
      case QRType.EVENT:
        return LucideIcons.calendar;
      case QRType.SHOP:
        return LucideIcons.store;
      case QRType.LOCATION:
        return LucideIcons.map_pin;
      case QRType.COMPANY:
        return LucideIcons.building_2;
      case QRType.SOCIAL:
        return LucideIcons.share_2;
      case QRType.PRODUCT:
        return LucideIcons.shopping_bag;
      case QRType.WEB_LINK:
        return LucideIcons.globe;
      case QRType.CUSTOM:
        return LucideIcons.sparkles;
    }
  }

  Widget _buildStatusBadge(CardStatus status) {
    Color bg = const Color(0xFFDCFCE7);
    Color text = const Color(0xFF059669);
    if (status == CardStatus.DRAFT) {
      bg = const Color(0xFFFEF3C7);
      text = const Color(0xFFD97706);
    }
    if (status == CardStatus.DISABLED) {
      bg = const Color(0xFFF1F5F9);
      text = const Color(0xFF64748B);
    }
    return Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(6)),
        child: Text(status.name, style: TextStyle(fontSize: 7, fontWeight: FontWeight.w900, color: text)));
  }
}
