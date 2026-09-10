import crypto from 'crypto';
import { formatDate } from './utils';
import { getFinancialYear, formatFinancialYear } from './financialYear';

export interface TenBdValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fieldErrors: Record<string, string>;
}

export interface TenBdSummary {
  financialYear: string;
  totalDonations: number;
  totalAmount: number;
  eligibleCount: number;
  eligibleAmount: number;
  validCount: number;
  needsCorrectionCount: number;
  missingPanCount: number;
  invalidPanCount: number;
  missingAddressCount: number;
  missingPincodeCount?: number;
}

/**
 * Validates Indian PAN format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).
 */
export function isValidPan(pan?: string | null): boolean {
  if (!pan) return false;
  const clean = pan.trim().toUpperCase();
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(clean);
}

/**
 * Validates a single donation record for Form 10BD compliance.
 * Never silently modifies data; returns all exact issues.
 */
export function validateDonationFor10BD(donation: any): TenBdValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const fieldErrors: Record<string, string> = {};

  // 1. Donor Name
  if (!donation.donorName || donation.donorName.trim().length < 2) {
    errors.push('Donor full name is required (minimum 2 characters).');
    fieldErrors.donorName = 'Missing or invalid donor name';
  }

  // 2. Donation Amount
  const amount = Number(donation.amount);
  if (isNaN(amount) || amount <= 0) {
    errors.push('Valid positive donation amount is required.');
    fieldErrors.amount = 'Invalid donation amount';
  }

  // 3. Donation Date
  const donationDate = donation.createdAt ? new Date(donation.createdAt) : null;
  if (!donationDate || isNaN(donationDate.getTime())) {
    errors.push('Valid donation date is required.');
    fieldErrors.date = 'Missing or invalid donation date';
  }

  // 4. Donor PAN (Mandatory for Section 80G Form 10BD / Form 10BE)
  if (!donation.donorPan || donation.donorPan.trim().length === 0) {
    errors.push('Permanent Account Number (PAN) is missing. PAN is mandatory under Section 80G to claim tax exemption.');
    fieldErrors.donorPan = 'PAN is missing for 80G deduction';
  } else if (!isValidPan(donation.donorPan)) {
    errors.push(`Invalid PAN format "${donation.donorPan}". Must be exactly 10 alphanumeric characters (5 letters, 4 numbers, 1 letter, e.g. ABCDE1234F).`);
    fieldErrors.donorPan = 'Invalid PAN format';
  }

  // 5. Donor Address (Mandatory in Form 10BD Table Column 7)
  if (!donation.donorAddress || donation.donorAddress.trim().length < 5) {
    errors.push('Donor postal address is missing or incomplete (minimum 5 characters required for Form 10BD filing).');
    fieldErrors.donorAddress = 'Address incomplete or missing';
  }

  // 6. Donor PIN Code (Mandatory in Form 10BD Table Column 8)
  const pin = donation.donorPincode ? String(donation.donorPincode).trim() : '';
  if (!pin || !/^[1-9][0-9]{5}$/.test(pin)) {
    errors.push('Valid 6-digit Indian PIN Code is required for Form 10BD filing (e.g. 271201).');
    fieldErrors.donorPincode = 'Valid 6-digit PIN code required';
  }

  // 7. Payment Reference
  if (!donation.paymentId && !donation.orderId && donation.paymentMethod !== 'OFFLINE' && donation.paymentMethod !== 'CASH') {
    warnings.push('Transaction / UTR reference ID is recommended.');
    fieldErrors.paymentReference = 'Missing payment reference';
  }

  // 8. 80G Eligibility
  if (donation.donationEligible80G === false) {
    warnings.push('Donation is marked as ineligible for Section 80G deduction.');
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    warnings,
    fieldErrors,
  };
}

/**
 * Validates an array of donations and returns aggregated statistics and issue logs.
 */
export function validateBatchFor10BD(donations: any[], targetFy?: string): TenBdSummary {
  const fy = targetFy || (donations[0]?.financialYear ? donations[0].financialYear : getFinancialYear(new Date()));
  
  let totalAmount = 0;
  let eligibleCount = 0;
  let eligibleAmount = 0;
  let validCount = 0;
  let needsCorrectionCount = 0;
  let missingPanCount = 0;
  let invalidPanCount = 0;
  let missingAddressCount = 0;
  let missingPincodeCount = 0;

  for (const d of donations) {
    const amt = Number(d.amount) || 0;
    totalAmount += amt;

    const isEligible = d.donationEligible80G !== false;
    if (isEligible) {
      eligibleCount++;
      eligibleAmount += amt;
    }

    const validation = validateDonationFor10BD(d);

    if (validation.isValid) {
      validCount++;
    } else {
      needsCorrectionCount++;
    }

    if (!d.donorPan || d.donorPan.trim().length === 0) {
      missingPanCount++;
    } else if (!isValidPan(d.donorPan)) {
      invalidPanCount++;
    }

    if (!d.donorAddress || d.donorAddress.trim().length < 5) {
      missingAddressCount++;
    }

    const p = d.donorPincode ? String(d.donorPincode).trim() : '';
    if (!p || !/^[1-9][0-9]{5}$/.test(p)) {
      missingPincodeCount++;
    }
  }

  return {
    financialYear: fy,
    totalDonations: donations.length,
    totalAmount,
    eligibleCount,
    eligibleAmount,
    validCount,
    needsCorrectionCount,
    missingPanCount,
    invalidPanCount,
    missingAddressCount,
    missingPincodeCount,
  };
}

/**
 * Generates an official Form 10BD Preparation CSV string matching Income Tax format.
 * Includes statutory disclaimer as required by compliance specifications.
 */
export function generate10BdCsv(donations: any[], financialYear: string, trustMeta?: any): string {
  const fyLabel = formatFinancialYear(financialYear);
  const trustName = trustMeta?.name || 'NIPANIA VIKASH SEVA TRUST';
  const trustPan = trustMeta?.pan || 'AAFTN4004N';
  const reg80g = trustMeta?.reg80gNo || 'AAFTN4004NF20214';

  const lines: string[] = [];

  // 1. Mandatory Preparation & Compliance Disclaimers
  lines.push(`"FORM 10BD STATEMENT OF DONATIONS — PREPARATION & VERIFICATION EXPORT"`);
  lines.push(`"Reporting Entity:","${trustName}","PAN:","${trustPan}","80G Reg No:","${reg80g}"`);
  lines.push(`"Financial Year:","${fyLabel}","Generated At:","${new Date().toISOString()}","Total Records:","${donations.length}"`);
  lines.push(`"DISCLAIMER:","10BD Preparation Export — Verify against current Income Tax utility before filing. Not an official e-filing receipt."`);
  lines.push(''); // blank row

  // 2. Official Income Tax Form 10BD Column Headers
  const headers = [
    'Sl No',
    'Pre-acknowledgement Number',
    'ID Code',
    'Identification Number (PAN / Aadhaar / Other)',
    'Section Code',
    'Donor Name',
    'Donor Address',
    'Donor Pincode',
    'Donation Type',
    'Mode of Receipt',
    'Amount of Donation (INR)',
    'Transaction Reference / UTR',
    'Date of Donation',
    'Internal Receipt No',
    '10BD Compliance Status',
  ];
  lines.push(headers.map((h) => `"${h}"`).join(','));

  // 3. Data Rows
  donations.forEach((d, idx) => {
    const slNo = idx + 1;
    const preAck = d.tenBdBatchId || d.tenBdFilingId || '';
    
    // ID Code: 1 = PAN, 2 = Aadhaar, 7 = Other
    const hasPan = Boolean(d.donorPan && isValidPan(d.donorPan));
    const idCode = hasPan ? '1' : '7';
    const idNumber = d.donorPan ? d.donorPan.toUpperCase().trim() : 'NOT_PROVIDED';
    const sectionCode = 'Section 80G(5)(vi)';

    const donorName = (d.donorName || '').replace(/"/g, '""');
    const donorAddress = (d.donorAddress || 'Nipania, Balrampur, Uttar Pradesh').replace(/"/g, '""');
    const donorPincode = d.donorPincode || '271201';

    // Donation Type: Corpus, Specific grant, Others
    let donationType = 'Others';
    if (d.projectTitle?.toLowerCase().includes('corpus')) {
      donationType = 'Corpus';
    } else if (d.projectTitle && !d.projectTitle.toLowerCase().includes('general')) {
      donationType = 'Specific grant';
    }

    // Mode of Receipt
    let mode = 'Electronic (UPI/NEFT/Card)';
    const pm = (d.paymentMethod || '').toUpperCase();
    if (pm === 'CASH') mode = 'Cash';
    else if (pm === 'CHEQUE' || pm === 'DEMAND_DRAFT') mode = 'Cheque';
    else if (pm === 'KIND') mode = 'Kind';

    const amount = Number(d.amount) || 0;
    const txRef = (d.paymentId || d.orderId || 'N/A').replace(/"/g, '""');
    const dateStr = d.createdAt ? formatDate(d.createdAt) : '';
    const receiptNo = d.officialReceiptNumber || d.donationId;
    
    const val = validateDonationFor10BD(d);
    const complianceStatus = val.isValid ? 'READY_FOR_10BD' : 'REQUIRES_CORRECTION';

    const row = [
      slNo,
      preAck,
      idCode,
      idNumber,
      sectionCode,
      donorName,
      donorAddress,
      donorPincode,
      donationType,
      mode,
      amount.toFixed(2),
      txRef,
      dateStr,
      receiptNo,
      complianceStatus,
    ];

    lines.push(row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','));
  });

  return lines.join('\r\n');
}

/**
 * Generates an unguessable, secure cryptographic access token for donor 10BE self-service access.
 */
export function generateSecureAccessToken(donationId: string): string {
  const randomBytes = crypto.randomBytes(24).toString('hex');
  const hash = crypto.createHash('sha256').update(`${donationId}-${randomBytes}-${Date.now()}`).digest('hex').slice(0, 48);
  return `sec_${hash}`;
}
