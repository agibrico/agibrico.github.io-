import 'package:uuid/uuid.dart';

enum CustomFieldType {
  TEXT,
  LONG_TEXT,
  NUMBER,
  PHONE,
  EMAIL,
  URL,
  DATE,
  TIME,
  LOCATION,
  BOOLEAN,
  SELECT,
  RADIO,
  MULTI_SELECT,
  IMAGE,
  DOCUMENT,
  MONEY,
  RATING,
  REFERENCE
}

class CustomFieldOption {
  final String id;
  String label;
  String value;

  CustomFieldOption({required this.id, required this.label, required this.value});

  Map<String, dynamic> toMap() => {'id': id, 'label': label, 'value': value};
  factory CustomFieldOption.fromMap(Map<String, dynamic> map) => CustomFieldOption(
    id: map['id'] ?? const Uuid().v4(),
    label: map['label'] ?? '',
    value: map['value'] ?? '',
  );
}

class CustomField {
  final String id;
  CustomFieldType type;
  String label;
  dynamic value;
  String? placeholder;
  String? description;
  bool required;
  bool isVisible;
  bool isPublic;
  int order;
  List<CustomFieldOption>? options;
  String? currency; // For MONEY
  double? ratingMax; // For RATING

  CustomField({
    required this.id,
    required this.type,
    required this.label,
    this.value,
    this.placeholder,
    this.description,
    this.required = false,
    this.isVisible = true,
    this.isPublic = true,
    required this.order,
    this.options,
    this.currency,
    this.ratingMax,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'type': type.name,
      'label': label,
      'value': value,
      'placeholder': placeholder,
      'description': description,
      'required': required,
      'isVisible': isVisible,
      'isPublic': isPublic,
      'order': order,
      'options': options?.map((e) => e.toMap()).toList(),
      'currency': currency,
      'ratingMax': ratingMax,
    };
  }

  factory CustomField.fromMap(Map<String, dynamic> map) {
    return CustomField(
      id: map['id'] ?? const Uuid().v4(),
      type: CustomFieldType.values.firstWhere((e) => e.name == map['type'], orElse: () => CustomFieldType.TEXT),
      label: map['label'] ?? '',
      value: map['value'],
      placeholder: map['placeholder'],
      description: map['description'],
      required: map['required'] ?? false,
      isVisible: map['isVisible'] ?? true,
      isPublic: map['isPublic'] ?? true,
      order: map['order'] ?? 0,
      options: (map['options'] as List?)?.map((e) => CustomFieldOption.fromMap(e)).toList(),
      currency: map['currency'],
      ratingMax: map['ratingMax']?.toDouble(),
    );
  }
}

class CustomSection {
  final String id;
  String title;
  String? description;
  int order;
  List<CustomField> fields;

  CustomSection({
    required this.id,
    required this.title,
    this.description,
    required this.order,
    required this.fields,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'order': order,
      'fields': fields.map((e) => e.toMap()).toList(),
    };
  }

  factory CustomSection.fromMap(Map<String, dynamic> map) {
    return CustomSection(
      id: map['id'] ?? const Uuid().v4(),
      title: map['title'] ?? '',
      description: map['description'],
      order: map['order'] ?? 0,
      fields: (map['fields'] as List?)?.map((e) => CustomField.fromMap(e)).toList() ?? [],
    );
  }
}
