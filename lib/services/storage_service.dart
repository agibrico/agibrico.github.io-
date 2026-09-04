import 'dart:io';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:path/path.dart' as path;

class StorageService {
  final FirebaseStorage _storage = FirebaseStorage.instance;

  /// Upload an image and return its public URL
  Future<String?> uploadCardImage(String cardId, File file, String type) async {
    try {
      final extension = path.extension(file.path);
      final fileName = "${type}_${DateTime.now().millisecondsSinceEpoch}$extension";
      final ref = _storage.ref().child('cards/$cardId/images/$fileName');
      
      final uploadTask = await ref.putFile(file);
      return await uploadTask.ref.getDownloadURL();
    } catch (e) {
      print("Error uploading image: $e");
      return null;
    }
  }

  Future<void> deleteImage(String url) async {
    try {
      await _storage.refFromURL(url).delete();
    } catch (e) {
      print("Error deleting image: $e");
    }
  }
}
