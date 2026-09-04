import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'services/auth_service.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/public_card_view.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint("Firebase init error: $e");
  }
  runApp(const SmartQRApp());
}

class SmartQRApp extends StatelessWidget {
  const SmartQRApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AuthService(),
      child: MaterialApp(
        title: 'Smart QR App Admin',
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF2563EB), brightness: Brightness.light),
          textTheme: GoogleFonts.plusJakartaSansTextTheme(),
        ),
        onGenerateRoute: (settings) {
          if (settings.name != null) {
             // Supports /q/ID and q/ID
             final uri = Uri.parse(settings.name!);
             if (uri.pathSegments.isNotEmpty && (uri.pathSegments.first == 'q' || uri.pathSegments.first == 'c')) {
                return MaterialPageRoute(builder: (_) => PublicCardView(publicId: uri.pathSegments.last));
             }
          }
          return null;
        },
        home: const AuthWrapper(),
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    return authService.isAuthenticated ? const DashboardScreen() : const LoginScreen();
  }
}
