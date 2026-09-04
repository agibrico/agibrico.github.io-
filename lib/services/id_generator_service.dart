import 'dart:math';
import 'package:cloud_firestore/cloud_firestore.dart';

class IdGeneratorService {
  // On exclut les caractères ambigus (0, O, 1, I, L)
  static const String _chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  Future<String> generateUniqueId() async {
    final Random random = Random();
    String id;
    bool isUnique = false;
    
    int length = 6;
    int attempts = 0;

    do {
      id = '';
      for (int i = 0; i < length; i++) {
        id += _chars[random.nextInt(_chars.length)];
      }
      
      // Vérifier l'unicité dans Firestore
      final doc = await _db.collection('cards').doc(id).get();
      if (!doc.exists) {
        isUnique = true;
      } else {
        attempts++;
        if (attempts > 5) {
          length++; // On augmente la taille si trop de collisions (théorique)
          attempts = 0;
        }
      }
    } while (!isUnique);

    return id;
  }
}
