import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@sanity/client";

const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf-8").split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq < 0) continue;
        const key = trimmed.slice(0, eq).trim();
        if (process.env[key] !== undefined) continue;
        process.env[key] = trimmed.slice(eq + 1).trim();
    }
}

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId) throw new Error("PUBLIC_SANITY_PROJECT_ID env var is required");
if (!token)
    throw new Error(
        "SANITY_WRITE_TOKEN env var is required. Create a token in sanity.io/manage with editor permissions.",
    );

const client = createClient({
    projectId,
    dataset,
    token,
    apiVersion: "2024-01-01",
    useCdn: false,
});

let keyCounter = 0;
const k = () => `s${(++keyCounter).toString(36)}`;

interface Span {
    _type: "span";
    _key: string;
    text: string;
    marks?: string[];
}

interface MarkDef {
    _type: string;
    _key: string;
    href?: string;
}

interface Block {
    _type: "block";
    _key: string;
    style: "normal" | "h2" | "h3";
    listItem?: "bullet" | "number";
    level?: number;
    markDefs: MarkDef[];
    children: Span[];
}

const p = (text: string): Block => ({
    _type: "block",
    _key: k(),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: k(), text, marks: [] }],
});

const h2 = (text: string): Block => ({
    _type: "block",
    _key: k(),
    style: "h2",
    markDefs: [],
    children: [{ _type: "span", _key: k(), text, marks: [] }],
});

const li = (text: string): Block => ({
    _type: "block",
    _key: k(),
    style: "normal",
    listItem: "bullet",
    level: 1,
    markDefs: [],
    children: [{ _type: "span", _key: k(), text, marks: [] }],
});

const linked = (
    text: string,
    href: string,
    style: "normal" | "h2" | "h3" = "normal",
): Block => {
    const linkKey = k();
    return {
        _type: "block",
        _key: k(),
        style,
        markDefs: [{ _type: "link", _key: linkKey, href }],
        children: [{ _type: "span", _key: k(), text, marks: [linkKey] }],
    };
};

const body: Block[] = [
    p(
        "This privacy policy explains how personal data is collected and processed when visiting this website.",
    ),
    p(
        "Personal data refers to any information relating to an identified or identifiable person, such as name, email address, or IP address.",
    ),
    p(
        "Data processing is carried out in accordance with the General Data Protection Regulation (GDPR) and applicable national data protection laws.",
    ),

    h2("Controller"),
    p("The controller responsible for data processing on this website is:"),
    p("[FULL NAME]"),
    p("[STREET ADDRESS]"),
    p("[POSTAL CODE, CITY]"),
    p("[COUNTRY]"),
    p("Email: [CONTACT EMAIL]"),

    h2("Hosting"),
    p("This website is hosted by Vercel."),
    p(
        "When you visit this website, Vercel may process technical data required to deliver the website, including:",
    ),
    li("IP address"),
    li("browser type and version"),
    li("operating system"),
    li("referrer URL"),
    li("date and time of access"),
    li("requested resources"),
    p(
        "These server logs are necessary to ensure the security, stability, and proper operation of the website.",
    ),
    p(
        "The processing is based on Art. 6(1)(f) GDPR (legitimate interest) in providing a reliable online service.",
    ),
    p(
        "Data may be processed on servers located outside the European Union, including the United States. Vercel participates in the EU-US Data Privacy Framework, ensuring an adequate level of data protection.",
    ),
    linked(
        "More information: https://vercel.com/legal/privacy-policy",
        "https://vercel.com/legal/privacy-policy",
    ),

    h2("Website Analytics"),
    p(
        "This website uses Vercel Web Analytics, a privacy-focused analytics service provided by Vercel.",
    ),
    p(
        "Vercel Analytics collects aggregated and anonymized usage information to help understand how visitors interact with the website. The collected information may include:",
    ),
    li("visited pages"),
    li("referrer URL"),
    li("device type"),
    li("browser and operating system"),
    li("country-level location"),
    li("timestamp of page visits"),
    p("According to the provider, the analytics service:"),
    li("does not use tracking cookies"),
    li("does not track users across websites"),
    li("does not collect personally identifiable information"),
    p(
        "Analytics data is only collected after you grant consent via the cookie banner. The processing is based on Art. 6(1)(a) GDPR (consent).",
    ),
    linked(
        "More information: https://vercel.com/docs/analytics/privacy-policy",
        "https://vercel.com/docs/analytics/privacy-policy",
    ),

    h2("Cookies"),
    p(
        "This website uses a single strictly necessary cookie (cc_cookie) to remember your cookie preferences. It expires after 182 days and contains no personal information.",
    ),
    p(
        "You can change your cookie preferences at any time using the “Cookie settings” link or by clearing your browser storage for this site.",
    ),

    h2("Your Rights"),
    p(
        "Under the GDPR, you have the following rights regarding your personal data:",
    ),
    li("Right of access (Art. 15 GDPR)"),
    li("Right to rectification (Art. 16 GDPR)"),
    li("Right to erasure (Art. 17 GDPR)"),
    li("Right to restriction of processing (Art. 18 GDPR)"),
    li("Right to data portability (Art. 20 GDPR)"),
    li("Right to object to processing (Art. 21 GDPR)"),
    p("To exercise any of these rights, contact: [CONTACT EMAIL]"),

    h2("Supervisory Authority"),
    p(
        "If you believe your data has been processed unlawfully, you have the right to lodge a complaint with a competent supervisory authority in your country of residence.",
    ),
];

const doc = {
    _id: "privacy-policy",
    _type: "page",
    title: "Privacy Policy",
    slug: { _type: "slug", current: "privacy" },
    content: [
        {
            _type: "legal",
            _key: "legal-1",
            title: "Privacy Policy",
            lastUpdated: new Date().toISOString().slice(0, 10),
            body,
            theme: "light",
        },
    ],
};

console.log(`Seeding privacy policy → project=${projectId} dataset=${dataset}`);

const result = await client.createOrReplace(doc);
console.log(`✓ Upserted ${result._id} (${result._type})`);
