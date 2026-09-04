import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import 'package:uuid/uuid.dart';
import 'package:intl/intl.dart';
import '../models/qr_card.dart';
import '../models/custom_form.dart' as custom;
import '../services/firestore_service.dart';
import '../services/storage_service.dart';
import '../services/id_generator_service.dart';
import 'package:flutter_lucide/flutter_lucide.dart';

class CardEditorScreen extends StatefulWidget {
  final QRCard? initialCard;
  final QRType initialType;

  const CardEditorScreen({super.key, this.initialCard, required this.initialType});

  @override
  State<CardEditorScreen> createState() => _CardEditorScreenState();
}

class _CardEditorScreenState extends State<CardEditorScreen> {
  final _firestore = FirestoreService();
  final _storage = StorageService();
  final _idGenerator = IdGeneratorService();
  final _picker = ImagePicker();
  final _uuid = const Uuid();

  late TextEditingController _titleController;
  late Map<String, dynamic> _content;
  late Map<String, dynamic> _settings;
  late CardStatus _status;
  late AccessMode _accessMode;
  late TextEditingController _pinController;
  DateTime? _expiresAt;

  bool _isLoading = false;
  String _activeTab = 'content';

  List<custom.CustomSection> _customSections = [];

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.initialCard?.title ?? '');
    _content = Map<String, dynamic>.from(widget.initialCard?.content ?? {});
    _settings = Map<String, dynamic>.from(widget.initialCard?.settings ?? {});
    _status = widget.initialCard?.status ?? CardStatus.DRAFT;
    _accessMode = widget.initialCard?.accessMode ?? AccessMode.PUBLIC;
    _pinController = TextEditingController(text: widget.initialCard?.accessPin ?? '');
    _expiresAt = widget.initialCard?.expiresAt;

    _initializeData();
  }

  void _initializeData() {
    if (widget.initialType == QRType.CUSTOM) {
      if (_content['sections'] != null) {
        _customSections = (_content['sections'] as List).map((e) => custom.CustomSection.fromMap(e)).toList();
      } else {
        _customSections = [custom.CustomSection(id: _uuid.v4(), title: 'Section Principale', order: 0, fields: [])];
      }
    }
    _content['openingHours'] ??= _defaultOpeningHours();
    _content['socialLinks'] ??= [];
    _content['menuItems'] ??= [];
    if (widget.initialType == QRType.WEB_LINK) {
      _content['redirectMode'] ??= 'LANDING_PAGE';
    }
  }

  List<Map<String, dynamic>> _defaultOpeningHours() {
    return [
      {'day': 'Lundi', 'isOpen': true, 'openTime': '08:00', 'closeTime': '18:00'},
      {'day': 'Mardi', 'isOpen': true, 'openTime': '08:00', 'closeTime': '18:00'},
      {'day': 'Mercredi', 'isOpen': true, 'openTime': '08:00', 'closeTime': '18:00'},
      {'day': 'Jeudi', 'isOpen': true, 'openTime': '08:00', 'closeTime': '18:00'},
      {'day': 'Vendredi', 'isOpen': true, 'openTime': '08:00', 'closeTime': '18:00'},
      {'day': 'Samedi', 'isOpen': true, 'openTime': '09:00', 'closeTime': '16:00'},
      {'day': 'Dimanche', 'isOpen': false, 'openTime': '10:00', 'closeTime': '14:00'},
    ];
  }

  void _save() async {
    if (_titleController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Titre obligatoire.")));
      return;
    }
    setState(() => _isLoading = true);
    final publicId = widget.initialCard?.publicId ?? await _idGenerator.generateUniqueId();
    if (widget.initialType == QRType.CUSTOM) _content['sections'] = _customSections.map((e) => e.toMap()).toList();

    final card = QRCard(
      id: publicId,
      publicId: publicId,
      title: _titleController.text.trim(),
      type: widget.initialType,
      status: _status,
      accessMode: _accessMode,
      accessPin: _pinController.text,
      createdAt: widget.initialCard?.createdAt ?? DateTime.now(),
      updatedAt: DateTime.now(),
      expiresAt: _expiresAt,
      content: _content,
      settings: _settings,
      publicContent: _computePublicContent(),
    );

    try {
      await _firestore.saveCard(card);
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Erreur: $e")));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Map<String, dynamic> _computePublicContent() {
    final Map<String, dynamic> public = {};
    if (widget.initialType == QRType.CUSTOM) {
      public['sections'] = _customSections.map((s) {
        final map = s.toMap();
        map['fields'] = (map['fields'] as List).where((f) => f['isPublic'] == true).toList();
        return map;
      }).where((s) => (s['fields'] as List).isNotEmpty).toList();
      public['displayTitle'] = _content['displayTitle'];
      public['photoUrl'] = _content['photoUrl'];
      public['description'] = _content['description'];
    } else {
      public.addAll(_content);
      public.remove('internalNotes');
    }
    return public;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text('${widget.initialCard == null ? "CRÉATION" : "MODIFICATION"} ${widget.initialType.name}',
            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 11, color: Color(0xFF0F172A))),
        actions: [
          if (_isLoading)
            const Center(
                child: Padding(
                    padding: EdgeInsets.all(16),
                    child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))))
          else
            TextButton(
                onPressed: _save,
                child: const Text('ENREGISTRER',
                    style: TextStyle(fontWeight: FontWeight.w900, fontSize: 11, color: Color(0xFF2563EB)))),
        ],
      ),
      body: Column(children: [
        _buildTabs(),
        Expanded(child: SingleChildScrollView(padding: const EdgeInsets.all(24), child: _buildActiveTab()))
      ]),
    );
  }

  Widget _buildTabs() => Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(children: [
        _buildTabButton('content', 'Contenu', LucideIcons.file_text),
        _buildTabButton('settings', 'Sécurité', LucideIcons.lock),
      ]));

  Widget _buildTabButton(String id, String label, IconData icon) {
    bool active = _activeTab == id;
    return Expanded(
        child: InkWell(
            onTap: () => setState(() => _activeTab = id),
            child: Container(
                padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(
                    border: Border(bottom: BorderSide(color: active ? const Color(0xFF2563EB) : Colors.transparent, width: 3))),
                child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Icon(icon, size: 14, color: active ? const Color(0xFF2563EB) : Colors.grey),
                  const SizedBox(width: 8),
                  Text(label,
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: active ? Colors.black : Colors.grey))
                ]))));
  }

  Widget _buildActiveTab() => _activeTab == 'content' ? _buildContentTab() : _buildSettingsTab();

  Widget _buildContentTab() => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        _buildSectionHeader('GESTION'),
        _buildFormCard([
          _buildTextField('Nom Interne', 'title_internal', LucideIcons.tag, controller: _titleController),
          const SizedBox(height: 16),
          DropdownButtonFormField<CardStatus>(
            initialValue: _status,
            decoration: _inputDecoration('Statut', LucideIcons.circle_check),
            items: CardStatus.values
                .map((s) => DropdownMenuItem(value: s, child: Text(s.name, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold))))
                .toList(),
            onChanged: (v) => setState(() => _status = v!),
          ),
        ]),
        const SizedBox(height: 32),
        _buildSectionHeader('CONTENU DE LA FICHE'),
        _buildTypeSpecificForm(),
      ]);

  Widget _buildSettingsTab() => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        _buildSectionHeader('ACCÈS & PROTECTION'),
        _buildFormCard([
          DropdownButtonFormField<AccessMode>(
            initialValue: _accessMode,
            decoration: _inputDecoration('Protection', LucideIcons.shield),
            items: AccessMode.values.map((m) => DropdownMenuItem(value: m, child: Text(m.name, style: const TextStyle(fontSize: 12)))).toList(),
            onChanged: (v) => setState(() => _accessMode = v!),
          ),
          if (_accessMode == AccessMode.PIN_PROTECTED) ...[
            const SizedBox(height: 16),
            _buildTextField('Code PIN', 'accessPin', LucideIcons.key, controller: _pinController)
          ],
        ]),
        const SizedBox(height: 32),
        _buildSectionHeader('EXPIRATION'),
        _buildFormCard([
          ListTile(
            title: const Text("Date d'expiration", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            subtitle: Text(_expiresAt == null ? "Illimitée" : DateFormat('dd/MM/yyyy').format(_expiresAt!)),
            trailing: IconButton(
                icon: Icon(LucideIcons.calendar),
                onPressed: () async {
                  final d = await showDatePicker(
                      context: context,
                      initialDate: DateTime.now().add(const Duration(days: 365)),
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 3650)));
                  if (d != null) setState(() => _expiresAt = d);
                }),
          ),
        ]),
      ]);

  Widget _buildTypeSpecificForm() {
    switch (widget.initialType) {
      case QRType.BUSINESS_CARD:
        return _buildBusinessCardForm();
      case QRType.BOOK:
        return _buildBookForm();
      case QRType.EVENT:
        return _buildEventForm();
      case QRType.SHOP:
        return _buildShopForm();
      case QRType.LOCATION:
        return _buildLocationForm();
      case QRType.COMPANY:
        return _buildCompanyForm();
      case QRType.SOCIAL:
        return _buildSocialForm();
      case QRType.PRODUCT:
        return _buildProductMenuForm();
      case QRType.WEB_LINK:
        return _buildWebLinkForm();
      case QRType.CUSTOM:
        return _buildCustomForm();
    }
  }

  // --- FORMULAIRES SPÉCIFIQUES ---

  Widget _buildBusinessCardForm() => _buildFormCard([
        _buildImagePicker('Photo de profil', 'photoUrl'),
        _buildTextField('Nom Complet', 'fullName', LucideIcons.user),
        _buildTextField('Entreprise', 'company', LucideIcons.building_2),
        _buildTextField('Fonction', 'jobTitle', LucideIcons.briefcase),
        _buildTextField('Téléphone Principal', 'primaryPhone', LucideIcons.phone),
        _buildTextField('WhatsApp', 'whatsappNumber', LucideIcons.message_square),
        _buildTextField('Email', 'email', LucideIcons.mail),
        _buildTextField('Bio', 'bio', LucideIcons.info, maxLines: 3),
      ]);

  Widget _buildBookForm() => _buildFormCard([
        _buildImagePicker('Couverture', 'bookCoverUrl'),
        _buildTextField('Titre du Livre', 'bookTitle', LucideIcons.book),
        _buildTextField('Auteur', 'bookAuthor', LucideIcons.user),
        _buildTextField('ISBN', 'bookIsbn', LucideIcons.hash),
        _buildTextField('Prix', 'bookPrice', LucideIcons.dollar_sign),
        _buildTextField('Résumé', 'bookSummary', LucideIcons.text_align_start, maxLines: 4),
      ]);

  Widget _buildEventForm() => _buildFormCard([
        _buildImagePicker('Affiche', 'eventImageUrl'),
        _buildTextField('Nom Événement', 'eventTitle', LucideIcons.calendar),
        _buildTextField('Type', 'eventType', LucideIcons.tag),
        _buildTextField('Organisateur', 'eventHost', LucideIcons.user),
        _buildTextField('Lieu', 'eventLocation', LucideIcons.map_pin),
        _buildTextField('Date', 'eventDate', LucideIcons.clock),
        _buildTextField('Description', 'eventDescription', LucideIcons.info, maxLines: 3),
      ]);

  Widget _buildShopForm() => Column(children: [
        _buildFormCard([
          _buildImagePicker('Logo', 'logoUrl'),
          _buildTextField('Nom Commerce', 'shopName', LucideIcons.store),
          _buildTextField('Téléphone', 'primaryPhone', LucideIcons.phone),
          _buildTextField('Adresse', 'address', LucideIcons.map_pin),
        ]),
        _buildSectionHeader('HORAIRES'),
        _buildFormCard((_content['openingHours'] as List).asMap().entries.map((e) => Row(children: [
              SizedBox(width: 80, child: Text(e.value['day'], style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
              Switch(value: e.value['isOpen'], onChanged: (v) => setState(() => _content['openingHours'][e.key]['isOpen'] = v)),
              if (e.value['isOpen'])
                Expanded(
                    child: _buildSmallInput('08:00 - 18:00', "${e.value['openTime']} - ${e.value['closeTime']}", (v) {
                  final p = v.split('-');
                  if (p.length == 2) {
                    _content['openingHours'][e.key]['openTime'] = p[0].trim();
                    _content['openingHours'][e.key]['closeTime'] = p[1].trim();
                  }
                })),
            ])).toList()),
      ]);

  Widget _buildLocationForm() => _buildFormCard([
        _buildTextField('Nom du Lieu', 'locationName', LucideIcons.map_pin),
        Row(children: [
          Expanded(child: _buildTextField('Latitude', 'latitude', LucideIcons.navigation)),
          const SizedBox(width: 8),
          Expanded(child: _buildTextField('Longitude', 'longitude', LucideIcons.navigation)),
        ]),
        ElevatedButton.icon(onPressed: _getCurrentLocation, icon: Icon(LucideIcons.locate_fixed, size: 14), label: const Text("MA POSITION ACTUELLE")),
      ]);

  Widget _buildCompanyForm() => _buildFormCard([
        _buildImagePicker('Logo', 'logoUrl'),
        _buildTextField('Raison Sociale', 'companyName', LucideIcons.building_2),
        _buildTextField('RCCM', 'businessRegisterNumber', LucideIcons.file_text),
        _buildTextField('Responsable', 'businessManager', LucideIcons.user),
        _buildTextField('Site Web', 'websiteUrl', LucideIcons.globe),
      ]);

  Widget _buildSocialForm() => Column(children: [
        _buildFormCard(
            [_buildImagePicker('Avatar', 'photoUrl'), _buildTextField('Nom Affiché', 'socialName', LucideIcons.user), _buildTextField('Bio', 'bio', LucideIcons.info)]),
        _buildSectionHeader('LIENS'),
        _buildFormCard([
          ...(_content['socialLinks'] as List).map((l) => Row(children: [
                Expanded(child: _buildSmallInput('Label', l['label'] ?? '', (v) => l['label'] = v)),
                const SizedBox(width: 8),
                Expanded(child: _buildSmallInput('URL', l['url'] ?? '', (v) => l['url'] = v)),
                IconButton(
                    icon: Icon(LucideIcons.trash_2, size: 16, color: Colors.red),
                    onPressed: () => setState(() => _content['socialLinks'].remove(l))),
              ])),
          TextButton.icon(
              onPressed: () => setState(() => _content['socialLinks'].add({'id': _uuid.v4(), 'label': '', 'url': ''})),
              icon: Icon(LucideIcons.plus, size: 14),
              label: const Text("AJOUTER UN LIEN")),
        ]),
      ]);

  Widget _buildProductMenuForm() => Column(children: [
        _buildFormCard([
          DropdownButtonFormField<String>(
            initialValue: _content['productSheetType'] ?? 'product',
            decoration: _inputDecoration('Mode', LucideIcons.shopping_bag),
            items: ['product', 'menu'].map((s) => DropdownMenuItem(value: s, child: Text(s.toUpperCase()))).toList(),
            onChanged: (v) => setState(() => _content['productSheetType'] = v),
          ),
        ]),
        const SizedBox(height: 16),
        if (_content['productSheetType'] == 'product')
          _buildFormCard([
            _buildImagePicker('Image', 'productImageUrl'),
            _buildTextField('Nom Produit', 'productName', LucideIcons.package),
            _buildTextField('Prix', 'productPrice', LucideIcons.tag),
          ])
        else
          _buildFormCard([
            ...(_content['menuItems'] as List).map((i) => Column(children: [
                  Row(children: [
                    Expanded(child: _buildSmallInput('Plat', i['name'] ?? '', (v) => i['name'] = v)),
                    const SizedBox(width: 8),
                    SizedBox(width: 80, child: _buildSmallInput('Prix', i['price'] ?? '', (v) => i['price'] = v)),
                    IconButton(
                        icon: Icon(LucideIcons.trash_2, size: 16, color: Colors.red),
                        onPressed: () => setState(() => _content['menuItems'].remove(i))),
                  ]),
                  const SizedBox(height: 8),
                ])),
            TextButton.icon(
                onPressed: () => setState(() => _content['menuItems'].add({'id': _uuid.v4(), 'name': '', 'price': ''})),
                icon: Icon(LucideIcons.plus, size: 14),
                label: const Text("AJOUTER AU MENU")),
          ]),
      ]);

  Widget _buildWebLinkForm() => _buildFormCard([
        _buildTextField('Titre Affiché', 'displayTitle', LucideIcons.type),
        _buildTextField('URL Destination *', 'destinationUrl', LucideIcons.link),
        _buildTextField('Description', 'description', LucideIcons.info, maxLines: 2),
        _buildImagePicker('Logo / Icone', 'imageUrl'),
        DropdownButtonFormField<String>(
          initialValue: _content['redirectMode'] ?? 'LANDING_PAGE',
          decoration: _inputDecoration('Mode', LucideIcons.refresh_cw),
          items: ['DIRECT', 'LANDING_PAGE'].map((m) => DropdownMenuItem(value: m, child: Text(m))).toList(),
          onChanged: (v) => setState(() => _content['redirectMode'] = v),
        ),
      ]);

  Widget _buildCustomForm() => Column(children: [
        _buildFormCard(
            [_buildTextField('Titre Public', 'displayTitle', LucideIcons.type), _buildImagePicker('Logo Principal', 'photoUrl')]),
        const SizedBox(height: 24),
        ..._customSections.map((s) => _buildCustomSectionEditor(s)).toList(),
        _buildAddButton(
            "AJOUTER UNE SECTION",
            LucideIcons.plus,
            () => setState(() => _customSections.add(
                custom.CustomSection(id: _uuid.v4(), title: 'Nouvelle Section', order: _customSections.length, fields: [])))),
      ]);

  Widget _buildCustomSectionEditor(custom.CustomSection s) => Container(
        key: ValueKey(s.id),
        margin: const EdgeInsets.only(bottom: 24),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
            color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: const Color(0xFFE2E8F0))),
        child: Column(children: [
          Row(children: [
            Icon(LucideIcons.grip_vertical, size: 16, color: Colors.grey),
            Expanded(
                child: TextFormField(
                    initialValue: s.title,
                    onChanged: (v) => s.title = v,
                    decoration: const InputDecoration(border: InputBorder.none, hintText: 'Titre section'))),
            IconButton(icon: Icon(LucideIcons.trash_2, size: 16, color: Colors.red), onPressed: () => setState(() => _customSections.remove(s))),
          ]),
          const Divider(),
          ReorderableListView(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              onReorderItem: (o, n) {
                setState(() {
                  if (n > o) n -= 1;
                  final f = s.fields.removeAt(o);
                  s.fields.insert(n, f);
                });
              },
              children: s.fields.map((f) => _buildCustomFieldItem(s, f)).toList()),
          TextButton.icon(onPressed: () => _showTypePicker(s), icon: Icon(LucideIcons.plus, size: 14), label: const Text("AJOUTER UN CHAMP")),
        ]),
      );

  Widget _buildCustomFieldItem(custom.CustomSection s, custom.CustomField f) => Container(
        key: ValueKey(f.id),
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12)),
        child: Row(children: [
          Icon(LucideIcons.grip_vertical, size: 14, color: Colors.grey),
          const SizedBox(width: 8),
          Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            TextFormField(
                initialValue: f.label,
                onChanged: (v) => f.label = v,
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                decoration: const InputDecoration(border: InputBorder.none, isDense: true, hintText: 'Nom du champ')),
            Text(f.type.name, style: const TextStyle(fontSize: 8, color: Colors.blue, fontWeight: FontWeight.bold)),
          ])),
          const Text("Public", style: TextStyle(fontSize: 8)),
          Switch(value: f.isPublic, onChanged: (v) => setState(() => f.isPublic = v)),
          IconButton(icon: Icon(LucideIcons.trash_2, size: 14, color: Colors.red), onPressed: () => setState(() => s.fields.remove(f))),
        ]),
      );

  void _showTypePicker(custom.CustomSection s) => showModalBottomSheet(
      context: context,
      builder: (c) => GridView.count(
          crossAxisCount: 3,
          padding: const EdgeInsets.all(24),
          children: custom.CustomFieldType.values
              .map((t) => InkWell(
                  onTap: () {
                    setState(() => s.fields.add(custom.CustomField(id: _uuid.v4(), type: t, label: '', order: s.fields.length)));
                    Navigator.pop(context);
                  },
                  child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Icon(LucideIcons.circle_plus, size: 20),
                    const SizedBox(height: 4),
                    Text(t.name, style: const TextStyle(fontSize: 8))
                  ])))
              .toList()));

  Widget _buildFormCard(List<Widget> children) => Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0xFFF1F5F9)),
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10)
          ]),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: children));
  Widget _buildTextField(String label, String key, IconData icon, {int maxLines = 1, TextEditingController? controller}) => Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: TextFormField(
          controller: controller,
          initialValue: controller == null ? (_content[key]?.toString() ?? '') : null,
          onChanged: controller == null ? (v) => _content[key] = v : null,
          maxLines: maxLines,
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
          decoration: _inputDecoration(label, icon)));
  Widget _buildSmallInput(String label, String v, Function(String) o) => TextFormField(
      initialValue: v,
      onChanged: o,
      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
      decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(fontSize: 9),
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))));
  InputDecoration _inputDecoration(String label, IconData icon) => InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8)),
      prefixIcon: Icon(icon, size: 18, color: const Color(0xFF2563EB)),
      filled: true,
      fillColor: const Color(0xFFF8FAFC),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
      contentPadding: const EdgeInsets.symmetric(vertical: 18));
  Widget _buildSectionHeader(String title) => Padding(
      padding: const EdgeInsets.only(bottom: 12, left: 4),
      child: Text(title, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 10, color: Color(0xFF94A3B8), letterSpacing: 1.5)));
  Widget _buildAddButton(String label, IconData icon, VoidCallback onTap) => Center(
      child: ElevatedButton.icon(
          onPressed: onTap,
          icon: Icon(icon, size: 14),
          label: Text(label),
          style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0F172A), foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)))));
  Widget _buildImagePicker(String label, String key) {
    final url = _content[key];
    return Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF94A3B8))),
          const SizedBox(height: 8),
          GestureDetector(
              onTap: () => _pickAndUploadImage(key),
              child: Container(
                  height: 120,
                  width: double.infinity,
                  decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0))),
                  child: url != null && url.toString().isNotEmpty
                      ? ClipRRect(borderRadius: BorderRadius.circular(15), child: Image.network(url, fit: BoxFit.cover))
                      : Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                          Icon(LucideIcons.image, color: Color(0xFFCBD5E1)),
                          SizedBox(height: 4),
                          Text("Choisir image", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold))
                        ])))
        ]));
  }

  Future<void> _pickAndUploadImage(String k) async {
    final XFile? i = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 70);
    if (i == null) return;
    final pid = widget.initialCard?.publicId ?? "tmp_${DateTime.now().msSinceEpoch}";
    setState(() => _isLoading = true);
    final u = await _storage.uploadCardImage(pid, File(i.path), k);
    setState(() {
      _isLoading = false;
      if (u != null) _content[k] = u;
    });
  }

  Future<void> _getCurrentLocation() async {
    bool s = await Geolocator.isLocationServiceEnabled();
    if (!s) return;
    LocationPermission p = await Geolocator.checkPermission();
    if (p == LocationPermission.denied) p = await Geolocator.requestPermission();
    if (p == LocationPermission.deniedForever) return;
    setState(() => _isLoading = true);
    Position pos = await Geolocator.getCurrentPosition();
    setState(() {
      _isLoading = false;
      _content['latitude'] = pos.latitude;
      _content['longitude'] = pos.longitude;
    });
  }
}

extension Ms on DateTime {
  int get msSinceEpoch => millisecondsSinceEpoch;
}
