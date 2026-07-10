/**
 * MeritSchemaAdapter
 * Converts raw MeritSchemaRegistry payloads into a consistent UI-ready structure.
 * ALL frontend components MUST consume schemas through this adapter.
 */

/**
 * Adapt a single raw schema from the backend MeritSchemaRegistry
 * into the canonical UI shape expected by every component.
 */
export function adaptSchema(raw) {
  if (!raw) return null

  return {
    id: raw.id,
    code: raw.code || '',
    // Canonical display name — prefer label over nombre (legacy)
    nombre: raw.label || raw.nombre || raw.code || `Tipo ${raw.id}`,
    title: raw.label || raw.nombre || raw.code || `Tipo ${raw.id}`,
    label: raw.label || raw.nombre || raw.code || `Tipo ${raw.id}`,
    description: raw.description || raw.descripcion || '',
    descripcion: raw.description || raw.descripcion || '',
    // Structural fields
    table: raw.table || '',
    fields: normalizeFields(raw.fields || raw.campos || []),
    campos: normalizeFields(raw.fields || raw.campos || []),
    documents: normalizeDocuments(raw.required_documents || raw.config_archivos || []),
    config_archivos: normalizeDocuments(raw.required_documents || raw.config_archivos || []),
    // Behavior flags
    multiple: raw.supports_multiple ?? raw.permite_multiples ?? true,
    supports_multiple: raw.supports_multiple ?? raw.permite_multiples ?? true,
    permite_multiples: raw.supports_multiple ?? raw.permite_multiples ?? true,
    // Score mapping
    category: raw.score_category || '',
    score_category: raw.score_category || '',
    // UI metadata
    icon: raw.ui_metadata?.icon || 'folder',
    color: raw.ui_metadata?.color || 'grey',
    order: raw.ui_metadata?.order || raw.orden || raw.id,
    orden: raw.ui_metadata?.order || raw.orden || raw.id,
    // Pass-through for optional flag set by convocatoria config
    opcional: raw.opcional || false,
  }
}

/**
 * Adapt an array of raw schemas from the backend.
 */
export function adaptSchemas(rawArray) {
  if (!Array.isArray(rawArray)) return []
  return rawArray.map(adaptSchema).sort((a, b) => a.order - b.order)
}

/**
 * Normalize fields array — handles both legacy {nombre, tipo} and new {key, label, type} shapes.
 */
function normalizeFields(fields) {
  if (!Array.isArray(fields)) return []
  return fields.map((f, i) => ({
    key: f.key || f.id || `field_${i}`,
    label: f.label || f.nombre || f.name || `Campo ${i + 1}`,
    type: f.type || f.tipo || 'text',
    options: f.options || f.opciones || [],
    required: f.required ?? true,
  }))
}

/**
 * Normalize documents array — handles both legacy {nombre} and new {id, label} shapes.
 */
function normalizeDocuments(docs) {
  if (!Array.isArray(docs)) return []
  return docs.map((d, i) => ({
    id: d.id || `doc_${i}`,
    label: d.label || d.nombre || d.name || `Archivo ${i + 1}`,
    required: d.required ?? true,
  }))
}
