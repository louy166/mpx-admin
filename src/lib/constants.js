export const PROPERTY_TYPES = [
  { value: 'maison', labelFr: 'Maison', labelAr: 'منزل' },
  { value: 'appartement', labelFr: 'Appartement', labelAr: 'شقة' },
  { value: 'terrain', labelFr: 'Terrain', labelAr: 'أرض' },
  { value: 'bureau', labelFr: 'Bureau', labelAr: 'مكتب' },
  { value: 'commerce', labelFr: 'Commerce', labelAr: 'محل تجاري' },
  { value: 'immeuble', labelFr: 'Immeuble', labelAr: 'عمارة' },
  { value: 'villa', labelFr: 'Villa', labelAr: 'فيلا' },
  { value: 'hangar', labelFr: 'Hangar', labelAr: 'مستودع' },
];

export const TRANSACTION_TYPES = [
  { value: 'vente', labelFr: 'Vente', labelAr: 'بيع' },
  { value: 'location', labelFr: 'Location', labelAr: 'إيجار' },
];

export const STATUS_OPTIONS = [
  { value: 'brouillon', labelFr: 'Brouillon', labelAr: 'مسودة', color: 'gray' },
  { value: 'publie', labelFr: 'Publié', labelAr: 'منشور', color: 'green' },
  { value: 'en_verification', labelFr: 'En vérification', labelAr: 'قيد التحقق', color: 'yellow' },
  { value: 'rejete', labelFr: 'Rejeté', labelAr: 'مرفوض', color: 'red' },
  { value: 'archive', labelFr: 'Archivé', labelAr: 'مؤرشف', color: 'gray' },
];

export const VILLES = ['Nouakchott', 'Nouadhibou', 'Rosso', 'Kaédi', 'Zouerate', 'Atar', 'Kiffa'];

export const ROLES = [
  { value: 'particulier', labelFr: 'Particulier' },
  { value: 'proprietaire', labelFr: 'Propriétaire' },
  { value: 'apporteur', labelFr: "Apporteur d'affaires" },
  { value: 'agent_terrain', labelFr: 'Agent terrain' },
  { value: 'negociateur', labelFr: 'Négociateur' },
  { value: 'admin', labelFr: 'Administrateur' },
  { value: 'verificateur', labelFr: 'Vérificateur' },
];

export function getLabel(item, lang = 'fr') {
  if (!item) return '';
  return lang === 'ar' ? (item.labelAr || item.labelFr) : item.labelFr;
}

export function getTypeLabel(value, lang = 'fr') {
  const t = PROPERTY_TYPES.find(p => p.value === value);
  return t ? getLabel(t, lang) : value;
}

export function getTransactionLabel(value, lang = 'fr') {
  const t = TRANSACTION_TYPES.find(p => p.value === value);
  return t ? getLabel(t, lang) : value;
}

export function getStatusLabel(value, lang = 'fr') {
  const s = STATUS_OPTIONS.find(p => p.value === value);
  return s ? getLabel(s, lang) : value;
}

export function getStatusColor(value) {
  const s = STATUS_OPTIONS.find(p => p.value === value);
  return s?.color || 'gray';
}

export function formatPrice(price) {
  if (!price) return '—';
  return new Intl.NumberFormat('fr-FR').format(price) + ' MRU';
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}
