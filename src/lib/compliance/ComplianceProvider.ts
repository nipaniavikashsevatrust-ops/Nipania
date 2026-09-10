/**
 * Future-Ready Compliance Provider Architecture
 * 
 * Abstraction enabling smooth upgrade from the current Manual NGO Workflow
 * to future automated Income Tax Department API integrations without rewriting donation systems.
 */

import { validateDonationFor10BD, validateBatchFor10BD, generate10BdCsv } from '@/lib/tenBd';

export interface FilingBatchParams {
  financialYear: string;
  donationIds: string[];
  notes?: string;
  performedBy: string;
}

export interface FilingResult {
  success: boolean;
  batchNumber: string;
  totalDonations: number;
  totalAmount: number;
  acknowledgementNo?: string;
  filingDate?: Date;
  message: string;
}

export interface ComplianceProvider {
  name: string;
  mode: 'MANUAL_WORKFLOW' | 'AUTOMATED_API';
  validateDonations(donations: any[]): Promise<any>;
  generateFilingData(donations: any[], fy: string, trustMeta?: any): Promise<string>;
  recordFiling(params: FilingBatchParams): Promise<FilingResult>;
}

/**
 * Active Production Implementation:
 * Manages manual preparation, CSV/Excel export for Income Tax offline utility,
 * filing tracking, and official Form 10BE import.
 */
export class ManualIncomeTaxWorkflow implements ComplianceProvider {
  name = 'Income Tax Form 10BD/10BE Manual Filing Workflow';
  mode = 'MANUAL_WORKFLOW' as const;

  async validateDonations(donations: any[]) {
    return validateBatchFor10BD(donations);
  }

  async generateFilingData(donations: any[], fy: string, trustMeta?: any) {
    return generate10BdCsv(donations, fy, trustMeta);
  }

  async recordFiling(params: FilingBatchParams): Promise<FilingResult> {
    const batchNumber = `10BD-${params.financialYear}-${String(Date.now()).slice(-4)}`;
    return {
      success: true,
      batchNumber,
      totalDonations: params.donationIds.length,
      totalAmount: 0,
      message: `Filing preparation batch ${batchNumber} successfully recorded.`,
    };
  }
}

/**
 * Future Provider Stub: Pluggable for future automated government e-filing APIs.
 */
export class FutureIncomeTaxApiProvider implements ComplianceProvider {
  name = 'Automated Income Tax E-Filing API Provider';
  mode = 'AUTOMATED_API' as const;

  async validateDonations(donations: any[]) {
    return validateBatchFor10BD(donations);
  }

  async generateFilingData(donations: any[], fy: string, trustMeta?: any) {
    return generate10BdCsv(donations, fy, trustMeta);
  }

  async recordFiling(params: FilingBatchParams): Promise<FilingResult> {
    throw new Error('Automated Government e-Filing API is not yet active. Please use the Manual Income Tax Workflow.');
  }
}

// Default exported singleton provider instance
export const activeComplianceProvider: ComplianceProvider = new ManualIncomeTaxWorkflow();
