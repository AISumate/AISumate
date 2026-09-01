/**
 * Privacy + Terms content, bilingual, as data.
 *
 * Single source of truth rendered in two places:
 *  - the React pages at /privacy and /terms (language follows the site toggle)
 *  - the static privacy.html / terms.html that scripts/prerender.ts bakes for
 *    crawlers (English, with the Spanish text available on the live page)
 *
 * Keep statements here factually in sync with what the site actually does.
 */

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export interface LegalDoc {
  title: string;
  updated: string; // ISO date shown as "Last updated"
  intro: string;
  sections: LegalSection[];
}

const UPDATED = "2026-08-31";

export const PRIVACY: { en: LegalDoc; es: LegalDoc } = {
  en: {
    title: "Privacy Policy",
    updated: UPDATED,
    intro:
      "aisumate is a human-curated directory of AI tools. We built it to be useful without watching you: no analytics, no advertising trackers, no cookies set by us, and no accounts.",
    sections: [
      {
        heading: "What we collect",
        paragraphs: [
          "Nothing, by default. Browsing aisumate does not require an account and we do not run analytics or tracking scripts. We do not set cookies. Your searches and clicks on this site are not recorded by us.",
          "Our hosting provider (Vercel) processes standard technical request data — such as your IP address — to serve the site and protect it from abuse, as any web host does. We do not use that data to identify or profile you.",
        ],
      },
      {
        heading: "Newsletter (when it launches)",
        paragraphs: [
          "We plan to offer an optional email newsletter with updates about new tools added to the directory. If you subscribe, we will collect your email address for that single purpose: sending you those updates.",
          "Your email address will never be sold or shared with third parties for their own use. It will be stored in our database (hosted on Supabase) and newsletters will be delivered through DreamlitAI, which acts only as our sending service. You will be able to unsubscribe at any time via the link in every email, and unsubscribing deletes your address from our list.",
        ],
      },
      {
        heading: "Third-party services you may notice",
        paragraphs: [
          "Tool logos and curated images: these are served through our own site — our server fetches them and our host's cache delivers them, so your browser normally never contacts the tool maker's host or Google's favicon service. Only if one of our copies fails to load may your browser fall back to fetching a logo directly from Google, which would then see that request (including your IP address).",
          "Tool screenshots: tool pages without curated images show an automatic screenshot of the tool's own website, served by WordPress.com's public mShots service. Your browser fetches that screenshot directly from WordPress.com, which therefore sees the request (including your IP address). We ask browsers not to send the referring page address with these image requests.",
          "Fonts are self-hosted — no font request leaves this site.",
        ],
      },
      {
        heading: "Affiliate links",
        paragraphs: [
          "Some outbound links may be affiliate links, which means we may earn a commission if you buy something after clicking them — at no extra cost to you. Affiliate relationships never change a tool's rating or review; ratings are our editorial opinion. Links that may be compensated are marked with rel=\"sponsored\" for search engines and disclosed on the tool's detail view.",
          "Some listings may be sponsored placements. Sponsored listings are always marked with a visible \"Sponsored\" badge, and sponsorship never changes a tool's rating or review.",
        ],
      },
      {
        heading: "Your rights & contact",
        paragraphs: [
          "Since we hold no personal data about visitors today, there is usually nothing to access or delete. Once the newsletter exists, you can unsubscribe (which removes your email) or write to us for any privacy request.",
          "Contact: hello@aisumate.com",
        ],
      },
      {
        heading: "Changes",
        paragraphs: [
          "If our practices change — for example when the newsletter launches — we will update this page and its date. We will never quietly add tracking.",
        ],
      },
    ],
  },
  es: {
    title: "Política de Privacidad",
    updated: UPDATED,
    intro:
      "aisumate es un directorio de herramientas de IA curado por humanos. Lo construimos para ser útil sin vigilarte: sin analítica, sin rastreadores publicitarios, sin cookies propias y sin cuentas.",
    sections: [
      {
        heading: "Qué recopilamos",
        paragraphs: [
          "Nada, por defecto. Navegar aisumate no requiere cuenta y no ejecutamos scripts de analítica ni de rastreo. No usamos cookies. Tus búsquedas y clics en este sitio no quedan registrados por nosotros.",
          "Nuestro proveedor de hosting (Vercel) procesa datos técnicos estándar de cada petición — como tu dirección IP — para servir el sitio y protegerlo de abusos, como cualquier host web. No usamos esos datos para identificarte ni perfilarte.",
        ],
      },
      {
        heading: "Newsletter (cuando se lance)",
        paragraphs: [
          "Planeamos ofrecer un boletín opcional por correo con novedades sobre herramientas añadidas al directorio. Si te suscribes, recopilaremos tu correo con ese único propósito: enviarte esas novedades.",
          "Tu correo nunca será vendido ni compartido con terceros para su propio uso. Se almacenará en nuestra base de datos (alojada en Supabase) y los envíos se realizarán mediante DreamlitAI, que actúa solo como nuestro servicio de envío. Podrás darte de baja en cualquier momento desde el enlace incluido en cada correo, y darte de baja elimina tu dirección de nuestra lista.",
        ],
      },
      {
        heading: "Servicios de terceros que podrías notar",
        paragraphs: [
          "Logos e imágenes seleccionadas: se sirven a través de nuestro propio sitio — nuestro servidor las obtiene y la caché de nuestro proveedor las entrega, de modo que tu navegador normalmente nunca contacta con el servidor del fabricante ni con el servicio de favicons de Google. Solo si una de nuestras copias falla, tu navegador puede recurrir a cargar un logo directamente desde Google, que entonces vería esa petición (incluida tu IP).",
          "Capturas de herramientas: las páginas sin imágenes seleccionadas muestran una captura automática del sitio web de la propia herramienta, servida por el servicio público mShots de WordPress.com. Tu navegador solicita esa captura directamente a WordPress.com, que por tanto ve la petición (incluida tu IP). Pedimos a los navegadores que no envíen la dirección de la página de origen en esas peticiones de imagen.",
          "Las fuentes están auto-alojadas — ninguna petición de fuentes sale de este sitio.",
        ],
      },
      {
        heading: "Enlaces de afiliado",
        paragraphs: [
          "Algunos enlaces salientes pueden ser de afiliado: podemos ganar una comisión si compras tras hacer clic, sin coste extra para ti. Las relaciones de afiliado nunca cambian la calificación ni la reseña de una herramienta; las calificaciones son nuestra opinión editorial. Los enlaces que pueden ser compensados llevan rel=\"sponsored\" para los buscadores y se divulgan en la vista de detalle.",
          "Algunas fichas pueden ser posiciones patrocinadas. Las fichas patrocinadas llevan siempre una etiqueta visible de «Patrocinado», y el patrocinio nunca cambia la calificación ni la reseña de una herramienta.",
        ],
      },
      {
        heading: "Tus derechos y contacto",
        paragraphs: [
          "Como hoy no guardamos datos personales de visitantes, normalmente no hay nada que consultar o borrar. Cuando exista el boletín, podrás darte de baja (lo que elimina tu correo) o escribirnos para cualquier solicitud de privacidad.",
          "Contacto: hello@aisumate.com",
        ],
      },
      {
        heading: "Cambios",
        paragraphs: [
          "Si nuestras prácticas cambian — por ejemplo al lanzar el boletín — actualizaremos esta página y su fecha. Nunca añadiremos rastreo en silencio.",
        ],
      },
    ],
  },
};

export const TERMS: { en: LegalDoc; es: LegalDoc } = {
  en: {
    title: "Terms of Use",
    updated: UPDATED,
    intro:
      "Welcome to aisumate. By using this site you agree to these simple terms.",
    sections: [
      {
        heading: "What aisumate is",
        paragraphs: [
          "aisumate is an informational directory: we list, describe, rate and review third-party AI tools. We are not the maker of the tools listed, we do not sell them, and listing a tool is not an endorsement of everything it does.",
        ],
      },
      {
        heading: "Ratings and reviews are opinions",
        paragraphs: [
          "Ratings (1 = Indie · 5 = Market Leader), pros, cons, cost notes and verdicts are editorial opinions based on research at the time of review. They may be outdated or wrong, and may change after further review. Always verify pricing and capabilities with the tool's own site before relying on them.",
        ],
      },
      {
        heading: "External links",
        paragraphs: [
          "Outbound links take you to sites we do not control. We are not responsible for their content, pricing, security or privacy practices. Some links may be affiliate links, as disclosed in our Privacy Policy — commissions never influence ratings.",
        ],
      },
      {
        heading: "No warranty",
        paragraphs: [
          "The site is provided \"as is\", without warranties of any kind. To the maximum extent permitted by law, aisumate is not liable for any loss arising from use of the site or of any third-party tool found through it.",
        ],
      },
      {
        heading: "Fair use of our content",
        paragraphs: [
          "You are welcome to link to aisumate and to quote short excerpts with attribution. Wholesale copying of the catalogue, reviews or ratings is not permitted.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: ["Questions about these terms: hello@aisumate.com"],
      },
    ],
  },
  es: {
    title: "Términos de Uso",
    updated: UPDATED,
    intro:
      "Bienvenido a aisumate. Al usar este sitio aceptas estos términos sencillos.",
    sections: [
      {
        heading: "Qué es aisumate",
        paragraphs: [
          "aisumate es un directorio informativo: listamos, describimos, calificamos y reseñamos herramientas de IA de terceros. No somos los creadores de las herramientas listadas, no las vendemos, y listar una herramienta no es un respaldo de todo lo que hace.",
        ],
      },
      {
        heading: "Las calificaciones y reseñas son opiniones",
        paragraphs: [
          "Las calificaciones (1 = Indie · 5 = Líder del mercado), pros, contras, notas de precio y veredictos son opiniones editoriales basadas en investigación al momento de la reseña. Pueden quedar desactualizadas o ser incorrectas, y pueden cambiar tras nuevas revisiones. Verifica siempre precios y capacidades en el sitio de la propia herramienta.",
        ],
      },
      {
        heading: "Enlaces externos",
        paragraphs: [
          "Los enlaces salientes llevan a sitios que no controlamos. No somos responsables de su contenido, precios, seguridad ni prácticas de privacidad. Algunos enlaces pueden ser de afiliado, como se divulga en nuestra Política de Privacidad — las comisiones nunca influyen en las calificaciones.",
        ],
      },
      {
        heading: "Sin garantía",
        paragraphs: [
          "El sitio se ofrece \"tal cual\", sin garantías de ningún tipo. En la máxima medida permitida por la ley, aisumate no es responsable de pérdidas derivadas del uso del sitio o de cualquier herramienta de terceros encontrada a través de él.",
        ],
      },
      {
        heading: "Uso razonable de nuestro contenido",
        paragraphs: [
          "Puedes enlazar a aisumate y citar extractos breves con atribución. No está permitida la copia masiva del catálogo, reseñas o calificaciones.",
        ],
      },
      {
        heading: "Contacto",
        paragraphs: ["Preguntas sobre estos términos: hello@aisumate.com"],
      },
    ],
  },
};
