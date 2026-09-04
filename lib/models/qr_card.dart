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

class OpeningHourDay {
  final String day;
  final bool isOpen;
  final String openTime;
  final String closeTime;

  OpeningHourDay({
    required this.day,
    required this.isOpen,
    required this.openTime,
    required this.closeTime,
  });

  Map<String, dynamic> toJson() => {
    'day': day,
    'isOpen': isOpen,
    'openTime': openTime,
    'closeTime': closeTime,
  };

  factory OpeningHourDay.fromJson(Map<String, dynamic> json) => OpeningHourDay(
    day: json['day'] ?? '',
    isOpen: json['isOpen'] ?? false,
    openTime: json['openTime'] ?? '08:00',
    closeTime: json['closeTime'] ?? '18:00',
  );
}

class SocialLink {
  final String id;
  final String platform;
  final String url;
  final String label;

  SocialLink({required this.id, required this.platform, required this.url, required this.label});

  Map<String, dynamic> toJson() => {'id': id, 'platform': platform, 'url': url, 'label': label};
  factory SocialLink.fromJson(Map<String, dynamic> json) => SocialLink(
    id: json['id'] ?? '',
    platform: json['platform'] ?? 'website',
    url: json['url'] ?? '',
    label: json['label'] ?? '',
  );
}

class MenuItem {
  final String id;
  final String name;
  final String description;
  final String price;
  final String category;
  final bool isAvailable;

  MenuItem({required this.id, required this.name, required this.description, required this.price, required this.category, required this.isAvailable});

  Map<String, dynamic> toJson() => {'id': id, 'name': name, 'description': description, 'price': price, 'category': category, 'isAvailable': isAvailable};
  factory MenuItem.fromJson(Map<String, dynamic> json) => MenuItem(
    id: json['id'] ?? '',
    name: json['name'] ?? '',
    description: json['description'] ?? '',
    price: json['price'] ?? '',
    category: json['category'] ?? 'Plats',
    isAvailable: json['isAvailable'] ?? true,
  );
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
  final Map<String, dynamic> content;
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
    this.settings = const {},
  });

  factory QRCard.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    
    // Support for legacy type strings from React app
    String typeStr = data['type'] ?? 'BUSINESS_CARD';
    if (typeStr == 'vcard') typeStr = 'BUSINESS_CARD';
    if (typeStr == 'business') typeStr = 'COMPANY';
    if (typeStr == 'social') typeStr = 'SOCIAL';
    if (typeStr == 'location') typeStr = 'LOCATION';
    if (typeStr == 'shop') typeStr = 'SHOP';
    if (typeStr == 'book') typeStr = 'BOOK';
    if (typeStr == 'invitation' || typeStr == 'event') typeStr = 'EVENT';
    if (typeStr == 'product' || typeStr == 'menu') typeStr = 'PRODUCT';

    String statusStr = data['status'] ?? 'DRAFT';
    if (statusStr == 'active') statusStr = 'PUBLISHED';

    return QRCard(
      id: doc.id,
      publicId: data['publicId'] ?? doc.id,
      title: data['title'] ?? '',
      type: QRType.values.firstWhere((e) => e.name == typeStr, orElse: () => QRType.BUSINESS_CARD),
      status: CardStatus.values.firstWhere((e) => e.name == statusStr, orElse: () => CardStatus.DRAFT),
      accessMode: AccessMode.values.firstWhere((e) => e.name == (data['accessMode'] ?? 'PUBLIC'), orElse: () => AccessMode.PUBLIC),
      accessPin: data['accessPin'],
      scanCount: data['scanCount'] ?? 0,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      publishedAt: (data['publishedAt'] as Timestamp?)?.toDate(),
      expiresAt: (data['expiresAt'] as Timestamp?)?.toDate(),
      content: data['content'] ?? data, // Support flat structure from React
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
      'settings': settings,
    };
  }
}
