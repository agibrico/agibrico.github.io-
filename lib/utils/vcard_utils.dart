class VCardUtils {
  static String generateVCard(Map<String, dynamic> c) {
    final List<String> lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
    ];

    // Name
    String fn = c['fullName'] ?? '';
    if (fn.isEmpty) {
      fn = "${c['firstName'] ?? ''} ${c['lastName'] ?? ''}".trim();
    }
    lines.add('FN:$fn');
    lines.add('N:${c['lastName'] ?? ''};${c['firstName'] ?? ''};;;');

    // Organization
    if (c['company'] != null) lines.add('ORG:${c['company']}');
    if (c['jobTitle'] != null) lines.add('TITLE:${c['jobTitle']}');

    // Phones
    if (c['primaryPhone'] != null) lines.add('TEL;TYPE=CELL:${c['primaryPhone']}');
    if (c['whatsappNumber'] != null) lines.add('TEL;TYPE=WORK,VOICE:${c['whatsappNumber']}');

    // Email
    if (c['email'] != null) lines.add('EMAIL;TYPE=INTERNET:${c['email']}');

    // URLs
    if (c['websiteUrl'] != null) lines.add('URL:${c['websiteUrl']}');
    if (c['linkedinUrl'] != null) lines.add('URL;TYPE=LinkedIn:${c['linkedinUrl']}');

    // Address
    if (c['address'] != null) {
      lines.add('ADR;TYPE=WORK:;;${c['address']};;;;');
    }

    // Note / Bio
    if (c['bio'] != null) lines.add('NOTE:${c['bio'].toString().replaceAll('\n', ' ')}');

    lines.add('END:VCARD');
    return lines.join('\n');
  }
}
