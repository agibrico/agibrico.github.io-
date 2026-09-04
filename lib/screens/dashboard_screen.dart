import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../services/firestore_service.dart';
import '../models/qr_card.dart';
import 'card_editor_screen.dart';
import 'package:lucide_icons/lucide_icons.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _firestore = FirestoreService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'SMART QR STUDIO',
          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14, letterSpacing: 1.5, color: Color(0xFF0F172A)),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.logOut, size: 20, color: Color(0xFF64748B)),
            onPressed: () => Provider.of<AuthService>(context, listen: false).signOut(),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'RÉSUMÉ DE L\'ACTIVITÉ',
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 11, color: Color(0xFF94A3B8), letterSpacing: 1.2),
            ),
            const SizedBox(height: 16),
            _buildStatsHeader(),
            const SizedBox(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.between,
              children: [
                const Text(
                  'FICHES RÉCENTES',
                  style: TextStyle(fontWeight: FontWeight.w900, fontSize: 11, color: Color(0xFF94A3B8), letterSpacing: 1.2),
                ),
                GestureDetector(
                  onTap: () => _showTypeSelector(context),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF2563EB),
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: [
                        BoxShadow(color: const Color(0xFF2563EB).withOpacity(0.2), blurRadius: 8, offset: const Offset(0, 4)),
                      ],
                    ),
                    child: const Row(
                      children: [
                        Icon(LucideIcons.plus, size: 14, color: Colors.white),
                        SizedBox(width: 4),
                        Text('NOUVELLE', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 10)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildCardsList(),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsHeader() {
    return FutureBuilder<Map<String, int>>(
      future: _firestore.getStats(),
      builder: (context, snapshot) {
        final stats = snapshot.data ?? {'total': 0, 'published': 0, 'draft': 0, 'disabled': 0, 'totalScans': 0};
        return GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.6,
          children: [
            _buildStatCard('Total Fiches', stats['total'].toString(), LucideIcons.layers, const Color(0xFF2563EB)),
            _buildStatCard('Publiées', stats['published'].toString(), LucideIcons.checkCircle, const Color(0xFF059669)),
            _buildStatCard('Brouillons', stats['draft'].toString(), LucideIcons.fileEdit, const Color(0xFFD97706)),
            _buildStatCard('Scans Totaux', stats['totalScans'].toString(), LucideIcons.qrCode, const Color(0xFF7C3AED)),
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
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, color: color, size: 18),
              Container(
                width: 4, height: 4,
                decoration: BoxDecoration(color: color.withOpacity(0.2), shape: BoxShape.circle),
              )
            ],
          ),
          const Spacer(),
          Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
          Text(label, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8))),
        ],
      ),
    );
  }

  Widget _buildCardsList() {
    return StreamBuilder<List<QRCard>>(
      stream: _firestore.streamCards(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: Padding(padding: EdgeInsets.all(40), child: CircularProgressIndicator(strokeWidth: 2)));
        }
        final cards = snapshot.data ?? [];
        if (cards.isEmpty) {
          return Container(
            width: double.infinity,
            padding: const EdgeInsets.all(40),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFFF1F5F9)),
            ),
            child: const Column(
              children: [
                Icon(LucideIcons.fileSearch, size: 40, color: Color(0xFFCBD5E1)),
                SizedBox(height: 12),
                Text('Aucune fiche trouvée', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF64748B))),
              ],
            ),
          );
        }

        return ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: cards.length,
          separatorBuilder: (_, __) => const SizedBox(height: 10),
          itemBuilder: (context, index) {
            final card = cards[index];
            return GestureDetector(
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => CardEditorScreen(initialCard: card, initialType: card.type)),
              ),
              child: _buildCardItem(card),
            );
          },
        );
      },
    );
  }

  Widget _buildCardItem(QRCard card) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Row(
        children: [
          Container(
            width: 44, height: 44,
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(_getIconForType(card.type), color: const Color(0xFF2563EB), size: 18),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(card.title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: Color(0xFF0F172A)), maxLines: 1, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 2),
                Text(card.type.name.replaceAll('_', ' '), style: const TextStyle(fontSize: 9, color: Color(0xFF94A3B8), fontWeight: FontWeight.bold)),
              ],
            ),
          ),
          _buildStatusBadge(card.status),
          const SizedBox(width: 8),
          const Icon(LucideIcons.chevronRight, size: 14, color: Color(0xFFCBD5E1)),
        ],
      ),
    );
  }

  IconData _getIconForType(QRType type) {
    switch (type) {
      case QRType.BUSINESS_CARD: return LucideIcons.user;
      case QRType.BOOK: return LucideIcons.bookOpen;
      case QRType.EVENT: return LucideIcons.calendar;
      case QRType.SHOP: return LucideIcons.store;
      case QRType.LOCATION: return LucideIcons.mapPin;
      case QRType.COMPANY: return LucideIcons.building2;
      case QRType.SOCIAL: return LucideIcons.share2;
      case QRType.PRODUCT: return LucideIcons.shoppingBag;
      case QRType.WEB_LINK: return LucideIcons.globe;
      case QRType.CUSTOM: return LucideIcons.sparkles;
    }
  }

  Widget _buildStatusBadge(CardStatus status) {
    Color bg = const Color(0xFFF1F5F9);
    Color text = const Color(0xFF64748B);
    if (status == CardStatus.PUBLISHED) { bg = const Color(0xFFDCFCE7); text = const Color(0xFF059669); }
    if (status == CardStatus.DRAFT) { bg = const Color(0xFFFEF3C7); text = const Color(0xFFD97706); }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(6)),
      child: Text(status.name, style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: text)),
    );
  }

  void _showTypeSelector(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(32))),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('CHOISIR LE TYPE DE FICHE', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14, letterSpacing: 1.2)),
              const SizedBox(height: 24),
              Flexible(
                child: GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 2.2,
                  children: QRType.values.map((type) => _buildTypeOption(context, type)).toList(),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildTypeOption(BuildContext context, QRType type) {
    return GestureDetector(
      onTap: () {
        Navigator.pop(context);
        Navigator.push(context, MaterialPageRoute(builder: (_) => CardEditorScreen(initialType: type)));
      },
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFF1F5F9)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(_getIconForType(type), size: 14, color: const Color(0xFF2563EB)),
            const SizedBox(width: 8),
            Text(type.name.replaceAll('_', ' '), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
