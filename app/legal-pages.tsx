import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "./site-chrome";
import type { Locale } from "./localization";

type LegalPageKind = "legal" | "privacy" | "cookies";

type LegalPageCopy = {
  title: string;
  description: string;
  path: string;
  alternatePath: string;
  sections: Array<{ title: string; content: ReactNode }>;
};

const copy: Record<Locale, Record<LegalPageKind, LegalPageCopy>> = {
  en: {
    legal: {
      title: "Legal notice",
      description: "Information about the operator and use of moodlia.com.",
      path: "/legal-notice",
      alternatePath: "/es/aviso-legal",
      sections: [
        { title: "Website operator", content: <>
          <p>MoodlIA is an independent open-source project operated by Pablo Gallego (Spanish tax identification number: 35320739F). Registered address: Conchidos Cerponzóns no. 8, 36152 Pontevedra, Spain. You can contact us at <a href="mailto:contact@moodlia.com">contact@moodlia.com</a>.</p>
        </> },
        { title: "Purpose of the website", content: <p>This website introduces the MoodlIA family of open-source projects, explains their scope, and provides a direct contact route for questions and support. It does not offer checkout, paid subscriptions, or online contracting.</p> },
        { title: "Intellectual property", content: <p>The website’s text, design, and brand elements are protected by applicable law. Individual MoodlIA projects may be available under their own open-source licences, shown in their respective repositories. No licence is granted over the MoodlIA name or this website’s content except where expressly stated.</p> },
        { title: "External links and availability", content: <p>This website may link to third-party services and project repositories. Their content and privacy practices are governed by their own terms. We aim to keep the website accurate and available, but do not guarantee uninterrupted availability or that every external resource remains current.</p> },
      ],
    },
    privacy: {
      title: "Privacy",
      description: "How MoodlIA handles personal data when you use moodlia.com or contact us.",
      path: "/privacy",
      alternatePath: "/es/privacy",
      sections: [
        { title: "Who is responsible", content: <p>The controller for the data described here is Pablo Gallego, Spanish tax identification number 35320739F, with registered address at Conchidos Cerponzóns no. 8, 36152 Pontevedra, Spain. Contact: <a href="mailto:contact@moodlia.com">contact@moodlia.com</a>.</p> },
        { title: "Data we process", content: <p>The website is static and does not provide accounts, forms, analytics, advertising, or a database of visitors. If you email us, we process the contact details and information you choose to include. Technical infrastructure may also generate limited server logs, such as IP address, time, requested URL, and browser information, to secure and operate the service.</p> },
        { title: "MoodlIA Corrector browser extension", content: <p>MoodlIA Corrector runs locally in the teacher’s browser on Moodle assignment grading pages. When the teacher asks it to create a correction suggestion, it can read the visible Moodle grading context, including course and assignment information, student name when displayed, submission text, selected text-file attachments, rubric or marking-guide information, grades, and feedback fields. This data is used only to generate a teacher-reviewed suggestion. The extension never submits the Moodle grading form automatically.</p> },
        { title: "AI providers and data sharing", content: <p>MoodlIA does not operate an AI service for Corrector and does not receive the Moodle data processed by the extension. The teacher or institution selects either a local Ollama service or an OpenAI-compatible provider and supplies its endpoint. When the teacher requests a suggestion, the required Moodle context is sent directly to that selected provider. The provider’s own terms, data-processing terms, retention rules, and location apply. Teachers and institutions must use only providers that they are authorised to use with student work.</p> },
        { title: "Extension storage and security", content: <p>The extension stores the selected provider, endpoint, and model as browser preferences. An API key for a remote provider is retained only in Chrome session storage and is cleared when the browser session ends. MoodlIA does not sell data, use it for advertising or profiling, allow MoodlIA personnel to read it, or use it for purposes unrelated to the extension’s teacher-facing correction feature.</p> },
        { title: "MoodlIA Backup Converter", content: <p>Backup Converter reads, inspects, transforms, and repackages a Moodle backup entirely in the user’s browser. The application does not upload the selected .mbz file, store it on a MoodlIA server, use analytics, or send its contents to a third party. The working archive remains in browser memory and is cleared when the page is reloaded or closed. Users remain responsible for keeping the original backup safe and testing a converted copy before using it on a live Moodle site.</p> },
        { title: "Why and on what basis", content: <p>We use email data to answer your request, provide support, and manage any pre-contractual conversation you initiate. We use essential technical logs to keep the service secure and reliable. The legal basis is the steps you request before a possible contract, where applicable, and our legitimate interest in replying to enquiries and protecting the service.</p> },
        { title: "Recipients and retention", content: <p>Data is not sold or used for advertising. It may be processed by providers that host the website or email service, acting under their applicable terms and safeguards. Enquiries are kept only for as long as needed to respond and manage the resulting relationship; security logs are retained for the period needed to investigate incidents and maintain service security.</p> },
        { title: "Your rights", content: <p>You may request access, correction, deletion, objection, restriction, or portability where applicable by emailing <a href="mailto:contact@moodlia.com">contact@moodlia.com</a>. You may also lodge a complaint with the Spanish Data Protection Agency (AEPD) or your competent supervisory authority.</p> },
      ],
    },
    cookies: {
      title: "Cookies",
      description: "Information about cookies and similar technologies on moodlia.com.",
      path: "/cookies",
      alternatePath: "/es/cookies",
      sections: [
        { title: "Current use", content: <p>Moodlia.com does not currently use analytics, advertising, profiling, or social-media cookies. It does not store browser identifiers for those purposes, so a consent banner is not shown.</p> },
        { title: "If this changes", content: <p>If non-essential cookies or similar technologies are added in the future, this page will be updated and they will not be activated until you have received the required information and, where required, given consent. Essential technologies needed to deliver a service you explicitly request may be used without consent where permitted by law.</p> },
        { title: "How to manage cookies", content: <p>You can delete or block cookies in your browser settings. Blocking technical cookies can affect the operation of websites that rely on them. This website currently has no optional-cookie settings because it does not use optional cookies.</p> },
      ],
    },
  },
  es: {
    legal: {
      title: "Aviso legal",
      description: "Información sobre la titularidad y el uso de moodlia.com.",
      path: "/es/aviso-legal",
      alternatePath: "/legal-notice",
      sections: [
        { title: "Titular del sitio web", content: <>
          <p>MoodlIA es un proyecto independiente de código abierto operado por Pablo Gallego (NIF: 35320739F). Domicilio: Conchidos Cerponzóns nº 8, 36152 Pontevedra, España. Puedes contactar en <a href="mailto:contact@moodlia.com">contact@moodlia.com</a>.</p>
        </> },
        { title: "Finalidad del sitio web", content: <p>Este sitio presenta la familia de proyectos de código abierto MoodlIA, explica su alcance y ofrece un canal directo de contacto para consultas y ayuda. No ofrece proceso de compra, suscripciones de pago ni contratación electrónica.</p> },
        { title: "Propiedad intelectual", content: <p>Los textos, el diseño y los elementos de marca del sitio están protegidos por la normativa aplicable. Cada proyecto de MoodlIA puede distribuirse bajo su propia licencia de código abierto, indicada en su repositorio. No se concede ninguna licencia sobre el nombre MoodlIA ni sobre el contenido de este sitio salvo indicación expresa.</p> },
        { title: "Enlaces externos y disponibilidad", content: <p>Este sitio puede enlazar servicios y repositorios de terceros. Su contenido y sus prácticas de privacidad se rigen por sus propias condiciones. Procuramos mantener el sitio actualizado y disponible, pero no garantizamos disponibilidad ininterrumpida ni la vigencia permanente de cada recurso externo.</p> },
      ],
    },
    privacy: {
      title: "Privacidad",
      description: "Cómo trata MoodlIA los datos personales al usar moodlia.com o contactar con nosotros.",
      path: "/es/privacy",
      alternatePath: "/privacy",
      sections: [
        { title: "Quién es responsable", content: <p>El responsable de los datos descritos en esta política es Pablo Gallego, con NIF 35320739F y domicilio en Conchidos Cerponzóns nº 8, 36152 Pontevedra, España. Contacto: <a href="mailto:contact@moodlia.com">contact@moodlia.com</a>.</p> },
        { title: "Datos que tratamos", content: <p>La web es estática y no incluye cuentas, formularios, analítica, publicidad ni una base de datos de visitantes. Si nos escribes, tratamos los datos de contacto y la información que decidas incluir. La infraestructura técnica también puede generar registros limitados, como dirección IP, hora, URL solicitada e información del navegador, para proteger y operar el servicio.</p> },
        { title: "Extensión de navegador MoodlIA Corrector", content: <p>MoodlIA Corrector se ejecuta localmente en el navegador del docente, en las páginas de calificación de tareas de Moodle. Cuando el docente solicita una propuesta de corrección, puede leer el contexto visible de calificación de Moodle: información del curso y la tarea, nombre del estudiante cuando aparece en la página, texto de la entrega, adjuntos de texto seleccionados, información de rúbricas o guías de evaluación, notas y campos de comentarios. Estos datos se usan únicamente para generar una propuesta que el docente revisa. La extensión nunca envía automáticamente el formulario de calificación de Moodle.</p> },
        { title: "Proveedores de IA y comunicación de datos", content: <p>MoodlIA no opera un servicio de IA para Corrector ni recibe los datos de Moodle tratados por la extensión. El docente o la institución elige un servicio local de Ollama o un proveedor compatible con OpenAI e indica su endpoint. Al solicitar una propuesta, el contexto necesario de Moodle se envía directamente a ese proveedor seleccionado. Se aplican sus propios términos, condiciones de tratamiento, conservación y ubicación de datos. Los docentes y las instituciones deben usar únicamente proveedores autorizados para el tratamiento de trabajos del alumnado.</p> },
        { title: "Almacenamiento y seguridad de la extensión", content: <p>La extensión guarda como preferencias del navegador el proveedor, endpoint y modelo elegidos. Una clave API para un proveedor remoto se conserva solo en el almacenamiento de sesión de Chrome y se elimina al finalizar la sesión del navegador. MoodlIA no vende datos, no los usa para publicidad ni elaboración de perfiles, no permite que el personal de MoodlIA los lea y no los emplea para fines ajenos a la función de propuestas de corrección para docentes.</p> },
        { title: "MoodlIA Backup Converter", content: <p>Backup Converter lee, inspecciona, transforma y vuelve a empaquetar una copia de Moodle íntegramente en el navegador del usuario. La aplicación no sube el archivo .mbz seleccionado, no lo guarda en un servidor de MoodlIA, no utiliza analítica ni envía su contenido a terceros. El archivo de trabajo permanece en la memoria del navegador y se elimina al recargar o cerrar la página. La persona usuaria sigue siendo responsable de conservar la copia original y probar el archivo convertido antes de utilizarlo en un sitio Moodle real.</p> },
        { title: "Para qué y con qué base", content: <p>Utilizamos los datos de correo para responder a tu consulta, prestar ayuda y gestionar la conversación precontractual que inicies. Usamos los registros técnicos esenciales para mantener el servicio seguro y fiable. La base jurídica es la aplicación de medidas precontractuales solicitadas por ti, cuando corresponda, y nuestro interés legítimo en responder consultas y proteger el servicio.</p> },
        { title: "Destinatarios y conservación", content: <p>No vendemos datos ni los utilizamos para publicidad. Pueden ser tratados por proveedores que alojan el sitio o el correo, con sus correspondientes condiciones y garantías. Las consultas se conservan solo el tiempo necesario para responder y gestionar la relación resultante; los registros de seguridad, durante el tiempo necesario para investigar incidentes y mantener la seguridad.</p> },
        { title: "Tus derechos", content: <p>Puedes solicitar acceso, rectificación, supresión, oposición, limitación o portabilidad cuando corresponda escribiendo a <a href="mailto:contact@moodlia.com">contact@moodlia.com</a>. También puedes presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) o la autoridad de control competente.</p> },
      ],
    },
    cookies: {
      title: "Cookies",
      description: "Información sobre cookies y tecnologías similares en moodlia.com.",
      path: "/es/cookies",
      alternatePath: "/cookies",
      sections: [
        { title: "Uso actual", content: <p>Moodlia.com no utiliza actualmente cookies de analítica, publicidad, elaboración de perfiles ni redes sociales. Tampoco almacena identificadores del navegador para esos fines, por lo que no se muestra un banner de consentimiento.</p> },
        { title: "Si esto cambia", content: <p>Si en el futuro se añaden cookies u otras tecnologías no necesarias, esta página se actualizará y no se activarán hasta que hayas recibido la información exigida y, cuando sea necesario, prestado tu consentimiento. Las tecnologías esenciales para prestar un servicio solicitado expresamente podrán utilizarse sin consentimiento cuando la ley lo permita.</p> },
        { title: "Cómo gestionar las cookies", content: <p>Puedes eliminar o bloquear cookies desde la configuración de tu navegador. Bloquear cookies técnicas puede afectar al funcionamiento de los sitios que dependan de ellas. Esta web no cuenta ahora con ajustes de cookies opcionales porque no las utiliza.</p> },
      ],
    },
  },
};

export function createLegalMetadata(kind: LegalPageKind, locale: Locale): Metadata {
  const page = copy[locale][kind];
  return {
    title: `${page.title} | MoodlIA`,
    description: page.description,
    alternates: {
      canonical: page.path,
      languages: { en: copy.en[kind].path, es: copy.es[kind].path, "x-default": copy.en[kind].path },
    },
    robots: { index: true, follow: true },
  };
}

export function LegalPage({ kind, locale }: { kind: LegalPageKind; locale: Locale }) {
  const page = copy[locale][kind];
  const home = locale === "es" ? "/es" : "/";
  const homeLabel = locale === "es" ? "Inicio" : "Home";
  const skip = locale === "es" ? "Saltar al contenido principal" : "Skip to main content";
  const breadcrumb = locale === "es" ? "Migas de pan" : "Breadcrumb";

  return <>
    <a className="skip-link" href="#main-content" lang={locale}>{skip}</a>
    <SiteHeader locale={locale} currentPath={page.path} alternatePath={page.alternatePath} />
    <main id="main-content" className="legal-main" lang={locale}>
      <header className="legal-header">
        <nav className="breadcrumb" aria-label={breadcrumb}>
          <a href={home}>{homeLabel}</a><span className="breadcrumb-item"><i aria-hidden="true">/</i><span>{page.title}</span></span>
        </nav>
        <h1>{page.title}</h1>
        <p>{page.description}</p>
      </header>
      <div className="legal-body">
        {page.sections.map((section) => <section key={section.title} aria-labelledby={`legal-${section.title}`}>
          <h2 id={`legal-${section.title}`}>{section.title}</h2>
          {section.content}
        </section>)}
      </div>
    </main>
    <SiteFooter locale={locale} />
  </>;
}

export const legalPaths = {
  legal: { en: copy.en.legal.path, es: copy.es.legal.path },
  privacy: { en: copy.en.privacy.path, es: copy.es.privacy.path },
  cookies: { en: copy.en.cookies.path, es: copy.es.cookies.path },
};
