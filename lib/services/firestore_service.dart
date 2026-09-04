import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/qr_card.dart';

class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  Stream<List<QRCard>> streamCards() {
    return _db.collection('cards')
      .orderBy('createdAt', descending: true)
      .snapshots()
      .map((snapshot) => snapshot.docs.map((doc) => QRCard.fromFirestore(doc)).toList());
  }

  /// Sauvegarder avec le publicId comme ID de document pour la compatibilité
  Future<void> saveCard(QRCard card) {
    return _db.collection('cards').doc(card.publicId).set(card.toFirestore(), SetOptions(merge: true));
  }

  Future<void> deleteCard(String publicId) {
    return _db.collection('cards').doc(publicId).delete();
  }

  Future<QRCard?> getCardByPublicId(String publicId) async {
    final doc = await _db.collection('cards').doc(publicId).get();
    if (!doc.exists) {
      // Fallback search for cases where id != publicId
      final query = await _db.collection('cards')
        .where('publicId', isEqualTo: publicId)
        .limit(1)
        .get();
      if (query.docs.isEmpty) return null;
      return QRCard.fromFirestore(query.docs.first);
    }
    return QRCard.fromFirestore(doc);
  }

  Future<void> incrementScanCount(String publicId) {
    return _db.collection('cards').doc(publicId).update({
      'scanCount': FieldValue.increment(1),
      'lastScanAt': FieldValue.serverTimestamp(),
    });
  }

  Future<Map<String, int>> getStats() async {
    final snapshot = await _db.collection('cards').get();
    int total = snapshot.docs.length;
    int published = snapshot.docs.where((d) {
      final s = d.get('status');
      return s == CardStatus.PUBLISHED.name || s == 'active';
    }).length;
    
    int totalScans = 0;
    for (var doc in snapshot.docs) {
      final data = doc.data();
      totalScans += (data['scanCount'] as int? ?? 0);
    }

    return {
      'total': total,
      'published': published,
      'totalScans': totalScans,
    };
  }
}
