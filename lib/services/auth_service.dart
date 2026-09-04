import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

class AuthService extends ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  User? _user;

  // Configuration de l'administrateur unique
  static const String ADMIN_EMAIL = "atsegillesbrice@gmail.com"; 

  AuthService() {
    _auth.authStateChanges().listen((User? user) {
      _user = user;
      notifyListeners();
    });
  }

  User? get user => _user;
  bool get isAuthenticated => _user != null;

  /// Connexion avec vérification que c'est bien l'admin
  Future<String?> signIn(String email, String password) async {
    try {
      if (email.trim().toLowerCase() != ADMIN_EMAIL) {
        return "Accès restreint à l'administrateur uniquement.";
      }
      await _auth.signInWithEmailAndPassword(email: email, password: password);
      return null;
    } on FirebaseAuthException catch (e) {
      if (e.code == 'user-not-found') return "Identifiants incorrects.";
      if (e.code == 'wrong-password') return "Mot de passe incorrect.";
      return e.message;
    } catch (e) {
      return e.toString();
    }
  }

  Future<void> signOut() async {
    await _auth.signOut();
  }
}
