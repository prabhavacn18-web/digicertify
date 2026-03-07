// ─── Certificate Template Registry ───────────────────────────────────────────
// To add a new template:
//  1. Create a new renderer in src/templates/renderers/<name>.tsx
//  2. Add an entry here with the same id

export interface TemplateDefinition {
    id: string;
    name: string;
    description: string;
    /** Tailwind / inline accent colour for thumbnail ring */
    accent: string;
    /** Thumbnail background gradient (CSS value) */
    thumbBg: string;
    /** Short style tag shown on the card */
    tag: string;
}

export const TEMPLATES: TemplateDefinition[] = [
    {
        id: "classic",
        name: "Classic",
        description: "Timeless professional layout with ribbon & seal",
        accent: "#94A3B8",
        thumbBg: "linear-gradient(135deg, #FDFDFB 0%, #EEF2F7 100%)",
        tag: "Default",
    },
    {
        id: "modern",
        name: "Modern",
        description: "Bold dark design with vivid gradient accents",
        accent: "#6366F1",
        thumbBg: "linear-gradient(135deg, #0F0F1A 0%, #1E1B4B 100%)",
        tag: "Dark",
    },
    {
        id: "corporate",
        name: "Corporate",
        description: "Clean navy blue layout with gold accents",
        accent: "#D4A017",
        thumbBg: "linear-gradient(135deg, #0D1F3C 0%, #1A3A6B 100%)",
        tag: "Formal",
    },
];

export const DEFAULT_TEMPLATE_ID = "classic";
