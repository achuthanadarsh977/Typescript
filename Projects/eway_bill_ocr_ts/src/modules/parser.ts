export interface EwayBillData {
  ewb_details: {
    ewb_number: string;
    ewb_date: string;
    valid_until: string;
    transaction_type: string;
    document_number: string;
    document_date: string;
    value_of_goods: string;
    reason_for_transport: string;
    irn: string;
  };
  from_party: {
    gstin: string;
    name: string;
    place: string;
    state: string;
    pincode: string;
  };
  to_party: {
    gstin: string;
    name: string;
    place: string;
    state: string;
    pincode: string;
  };
  item_details: {
    hsn_code: string;
    product_description: string;
  };
  transporter_details: {
    transporter_gstin: string;
    transporter_name: string;
    vehicle_number: string;
    transport_mode: string;
  };
}

function find(pattern: RegExp, text: string): string {
  const match = text.match(pattern);
  return match ? match[1].trim() : "";
}

function cleanOcrSpaces(s: string): string {
  let r = s;
  // Fix split numbers: "6391 18" → "639118"
  r = r.replace(/(\d) (\d)/g, "$1$2").replace(/(\d) (\d)/g, "$1$2");
  // Fix capital+lowercase split: "V ivanta" → "Vivanta", "T al" → "Tal"
  r = r.replace(/\b([A-Z]) ([a-z])/g, "$1$2");
  // Fix single letter sandwiched after a SHORT uppercase fragment: "ST O SELF" → "STO SELF"
  // Left side capped at 3 chars to avoid merging into full words like "LIMITED T AMIL" → "LIMITEDT AMIL"
  // (must run before single-letter rules below or "O SELF" gets merged into "OSELF")
  r = r.replace(/\b([A-Z]{2,3}) ([A-Z]) ([A-Z]{2,})\b/g, "$1$2 $3");
  // Fix single uppercase letter before 3+ char uppercase word: "T AMIL" → "TAMIL"
  r = r.replace(/\b([A-Z]) ([A-Z]{3,})\b/g, "$1$2");
  // Fix 2-char uppercase fragment before 5+ char uppercase word: "UL TRATECH" → "ULTRATECH"
  r = r.replace(/\b([A-Z]{2}) ([A-Z]{5,})\b/g, "$1$2");
  // Fix space before hyphen in compound words: "SPROCKET -VTC" → "SPROCKET-VTC"
  r = r.replace(/(\w) -(\w)/g, "$1-$2");
  return r;
}

// Known OCR mid-word splits that generic rules cannot fix (both halves are 4+ chars).
// Add new entries here whenever a new split pattern is discovered in production.
const KNOWN_SPLITS: [RegExp, string][] = [
  // ── OCR splits in field-name keywords (fix these first so regex anchors work) ──
  [/\bDeliv\s+ery\b/gi,         "Delivery"],
  [/\bTranspor\s+tation\b/gi,   "Transportation"],
  [/\bTranspor\s+ter\b/gi,      "Transporter"],
  [/\bGener\s+ated\b/gi,        "Generated"],
  [/\bF\s+rom\b/gi,             "From"],
  [/\bdiscr\s+epancy\b/gi,      "discrepancy"],
  // ── Indian city/place name splits ───────────────────────────────────────────
  [/\bCOIMBA TORE\b/gi,   "COIMBATORE"],
  [/\bKEERANA THAM\b/gi,  "KEERANATHAM"],
  [/\bCHENNA I\b/gi,      "CHENNAI"],
  [/\bBANGA LORE\b/gi,    "BANGALORE"],
  [/\bHYDERA BAD\b/gi,    "HYDERABAD"],
  [/\bAHMEDA BAD\b/gi,    "AHMEDABAD"],
  [/\bBHOPA L\b/gi,       "BHOPAL"],
  [/\bLUCKN OW\b/gi,      "LUCKNOW"],
  [/\bNAGP UR\b/gi,       "NAGPUR"],
  [/\bINDO RE\b/gi,       "INDORE"],
  [/\bVADO DARA\b/gi,     "VADODARA"],
  [/\bSURA T\b/gi,        "SURAT"],
  [/\bKANP UR\b/gi,       "KANPUR"],
  [/\bNASH IK\b/gi,       "NASHIK"],
  [/\bFARIDA BAD\b/gi,    "FARIDABAD"],
  [/\bGAZIABA D\b/gi,     "GHAZIABAD"],
  [/\bRAJKO T\b/gi,       "RAJKOT"],
  [/\bJAIP UR\b/gi,       "JAIPUR"],
  [/\bLUDHIA NA\b/gi,     "LUDHIANA"],
  [/\bAGR A\b/gi,         "AGRA"],
  [/\bMYSU RU\b/gi,       "MYSURU"],
  [/\bKOZHIK ODE\b/gi,    "KOZHIKODE"],
  [/\bTIRUP PUR\b/gi,     "TIRUPPUR"],
  [/\bTIRUNELV ELI\b/gi,  "TIRUNELVELI"],
  [/\bVELLO RE\b/gi,      "VELLORE"],
  [/\bERO DE\b/gi,        "ERODE"],
  [/\bSALE M\b/gi,        "SALEM"],
];

function applyKnownSplits(text: string): string {
  let r = text;
  for (const [pattern, replacement] of KNOWN_SPLITS) {
    r = r.replace(pattern, replacement);
  }
  return r;
}

// Remove internal spaces from GSTIN (PDF sometimes adds spaces mid-GSTIN)
function cleanGstin(raw: string): string {
  return raw.replace(/\s+/g, "");
}

// Remove internal spaces from EWB number
function cleanEwbNo(raw: string): string {
  return raw.replace(/\s+/g, "");
}

export function parseEwayBill(text: string): EwayBillData {
  // Normalize whitespace, then fix known OCR splits before any field extraction
  const t = applyKnownSplits(text.replace(/\s+/g, " ").trim());

  // ── EWB header ────────────────────────────────────────────────
  const ewbNoRaw   = find(/E-?Way\s*Bill\s*No[:\s]+([0-9][\s0-9]{10,14}[0-9])/i, t);
  const ewbDate    = find(/E-?Way\s*Bill\s*Date[:\s]+([0-9]{2}\/[0-9]{2}\/[0-9]{4}(?:\s+\d{1,2}:\d{2}\s*[APM]{2})?)/i, t);
  const validUntil = find(/Valid\s*Until[:\s]+([0-9]{2}\/[0-9]{2}\/[0-9]{4}(?:\s+\d{1,2}:\d{2}\s*[APM]{2})?)/i, t);
  const irn        = find(/IRN[:\s]+([a-f0-9]{64})/i, t);
  const transType  = find(/Transaction\s*Type[:\s]+([A-Za-z]+)/i, t);
  const docNo      = find(/Document\s*No\.?\s*([A-Z0-9\-/]+)/i, t);
  const docDate    = find(/Document\s*Date\s+([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i, t);
  const valueGoods = find(/Value\s*of\s*Goods\s+([0-9,]+(?:\.[0-9]{2})?)/i, t);
  const reason     = find(/Reason\s*for\s*Transportation\s+([A-Za-z\s\-]+?)(?=Transporter|HSN|Part\s*-\s*B|$)/i, t);

  // ── From party ────────────────────────────────────────────────
  // {3,20} allows "URP" (Unregistered Person) as well as standard 15-char GSTINs
  const fromGstinRaw = find(/GSTIN\s*of\s*Supplier\s+([A-Z0-9\s]{3,20}),/i, t);
  const fromName     = find(/GSTIN\s*of\s*Supplier\s+[A-Z0-9\s]+,(.+?)(?=Place\s*of\s*Dispatch)/i, t);
  const dispatchRaw  = find(/Place\s*of\s*Dispatch\s+([^G]+?)(?=GSTIN\s*of\s*Recipient)/i, t);

  // Parse "Pune,MAHARASHTRA-410501" from dispatch field (pincode regex allows OCR spaces like "6391 18")
  const fromPlace   = find(/^([^,]+)/, dispatchRaw);
  const fromState   = cleanOcrSpaces(find(/,([A-Z][A-Z\s]+)-\d[\d ]{3,5}\d/, dispatchRaw).trim());
  const fromPin     = find(/-(\d[\d ]{3,5}\d)/, dispatchRaw).replace(/\s+/g, "");

  // ── To party ──────────────────────────────────────────────────
  const toGstinRaw = find(/GSTIN\s*of\s*Recipient\s+([A-Z0-9\s]{15,20}),/i, t);
  const toName     = find(/GSTIN\s*of\s*Recipient\s+[A-Z0-9\s]+,(.+?)(?=Place\s*of\s*Delivery)/i, t);
  const deliveryRaw = find(/Place\s*of\s*Delivery\s+(.+?)(?=Document\s*No)/i, t);

  const toPlace = find(/^(.+?),/, deliveryRaw);
  const toState = cleanOcrSpaces(find(/,([A-Z][A-Z\s]+)-\d[\d ]{3,5}\d/, deliveryRaw).trim());
  const toPin   = find(/-(\d[\d ]{3,5}\d)/, deliveryRaw).replace(/\s+/g, "");

  // ── Item details ──────────────────────────────────────────────
  const hsnCode    = find(/HSN\s*Code\s+([0-9]{4,8})/i, t);
  const productDesc = find(/HSN\s*Code\s+[0-9]{4,8}\s*-\s*(.+?)(?=Reason|$)/i, t);

  // ── Transporter ───────────────────────────────────────────────
  const transporterRaw  = find(/Transporter\s+([A-Z0-9\s]{15,20})\s*&/i, t);
  const transporterName = find(/Transporter\s+[A-Z0-9\s]+&\s*(.+?)(?=Part\s*-\s*B|$)/i, t);
  const vehicleNo       = find(/(?:Road|Rail|Air|Ship)\s+([A-Z]{2}[0-9]{1,2}[A-Z]{0,2}[0-9]{4})/i, t);
  const transportMode   = find(/(Road|Rail|Air|Ship)\s+[A-Z]{2}/i, t);

  return {
    ewb_details: {
      ewb_number:           cleanEwbNo(ewbNoRaw),
      ewb_date:             ewbDate,
      valid_until:          validUntil,
      transaction_type:     transType,
      document_number:      docNo,
      document_date:        docDate,
      value_of_goods:       valueGoods,
      reason_for_transport: cleanOcrSpaces(reason.trim()),
      irn:                  irn,
    },
    from_party: {
      gstin:   cleanGstin(fromGstinRaw),
      name:    cleanOcrSpaces(fromName.trim()),
      place:   fromPlace.trim(),
      state:   fromState,
      pincode: fromPin,
    },
    to_party: {
      gstin:   cleanGstin(toGstinRaw),
      name:    cleanOcrSpaces(toName.trim()),
      place:   cleanOcrSpaces(toPlace.trim()),
      state:   toState,
      pincode: toPin,
    },
    item_details: {
      hsn_code:            hsnCode,
      product_description: cleanOcrSpaces(productDesc.trim()),
    },
    transporter_details: {
      transporter_gstin: cleanGstin(transporterRaw),
      transporter_name:  cleanOcrSpaces(transporterName.trim()),
      vehicle_number:    vehicleNo,
      transport_mode:    transportMode,
    },
  };
}
