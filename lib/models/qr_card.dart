import 'package:cloud_firestore/cloud_firestore.dart';

enum QRType {
  BUSINESS_CARD,
  BOOK,
  EVENT,
  SHOP,
  LOCATION,
  COMPANY,
  SOCIAL,
  PRODUCT,
  WEB_LINK,
  CUSTOM
}

enum CardStatus {
  DRAFT,
  PUBLISHED,
  DISABLED,
  ARCHIVED
}

enum AccessMode {
  PUBLIC,
  PIN_PROTECTED,
  AUTHENTICATED_ONLY
}

class QRCard {
  final String id;
  final String publicId;
  final String title;
  final QRType type;
  final CardStatus status;
  final AccessMode accessMode;
  final String? accessPin;
  final int scanCount;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? publishedAt;
  final DateTime? expiresAt;
  
  // Data separation for security
  final Map<String, dynamic> content; // Full data (Private)
  final Map<String, dynamic> publicContent; // Filtered data (Public)
  final Map<String, dynamic> settings;

  QRCard({
    required this.id,
    required this.publicId,
    required this.title,
    required this.type,
    required this.status,
    this.accessMode = AccessMode.PUBLIC,
    this.accessPin,
    this.scanCount = 0,
    required this.createdAt,
    required this.updatedAt,
    this.publishedAt,
    this.expiresAt,
    required this.content,
    this.publicContent = const {},
    this.settings = const {},
  });

  factory QRCard.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    
    return QRCard(
      id: doc.id,
      publicId: data['publicId'] ?? doc.id,
      title: data['title'] ?? '',
      type: QRType.values.firstWhere((e) => e.name == data['type'], orElse: () => QRType.BUSINESS_CARD),
      status: CardStatus.values.firstWhere((e) => e.name == data['status'], orElse: () => CardStatus.DRAFT),
      accessMode: AccessMode.values.firstWhere((e) => e.name == (data['accessMode'] ?? 'PUBLIC'), orElse: () => AccessMode.PUBLIC),
      accessPin: data['accessPin'],
      scanCount: data['scanCount'] ?? 0,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      publishedAt: (data['publishedAt'] as Timestamp?)?.toDate(),
      expiresAt: (data['expiresAt'] as Timestamp?)?.toDate(),
      content: data['content'] ?? {},
      publicContent: data['publicContent'] ?? {},
      settings: data['settings'] ?? {},
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'publicId': publicId,
      'title': title,
      'type': type.name,
      'status': status.name,
      'accessMode': accessMode.name,
      'accessPin': accessPin,
      'scanCount': scanCount,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
      'publishedAt': publishedAt != null ? Timestamp.fromDate(publishedAt!) : null,
      'expiresAt': expiresAt != null ? Timestamp.fromDate(expiresAt!) : null,
      'content': content,
      'publicContent': publicContent,
      'settings': settings,
    };
  }
}
