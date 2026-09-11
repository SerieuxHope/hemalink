// HemaLink Eligibility & Blood Compatibility Service
// Encapsulates ABO/Rh clinical compatibility rules, donation intervals, and deferral evaluation

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type BloodComponent = 'Whole Blood' | 'Packed RBC' | 'Platelets' | 'Fresh Frozen Plasma';

// Standard ABO/Rh Red Blood Cell / Whole Blood Compatibility Matrix
export const RED_CELL_COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
};

// Plasma Compatibility Matrix (Inverse of Red Cells)
export const PLASMA_COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

// Platelets Compatibility Matrix
export const PLATELET_COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-', 'A-', 'B-', 'AB-'],
  'O+': ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
  'A-': ['A-', 'AB-', 'O-'],
  'A+': ['A+', 'A-', 'AB+', 'AB-', 'O+', 'O-'],
  'B-': ['B-', 'AB-', 'O-'],
  'B+': ['B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['AB-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
};

export interface EligibilityEvaluationResult {
  isCompatible: boolean;
  isEligible: boolean;
  hardFilterPassed: boolean;
  reasons: string[];
  daysSinceLastDonation: number | null;
  nextEligibleDate: string | null;
  deferralStatus: {
    isDeferred: boolean;
    untilDate: string | null;
    reason: string | null;
  };
}

export class EligibilityService {
  /**
   * Check if a donor's blood group is compatible with the recipient blood group and component
   */
  static isBloodCompatible(donorGroup: BloodGroup, recipientGroup: BloodGroup, component: BloodComponent): boolean {
    if (component === 'Fresh Frozen Plasma') {
      const compatibleDonors = PLASMA_COMPATIBILITY[recipientGroup] || [];
      return compatibleDonors.includes(donorGroup);
    }
    if (component === 'Platelets') {
      const compatibleDonors = PLATELET_COMPATIBILITY[recipientGroup] || [];
      return compatibleDonors.includes(donorGroup);
    }
    // Default to Whole Blood and Packed RBC
    const compatibleDonors = RED_CELL_COMPATIBILITY[recipientGroup] || [];
    return compatibleDonors.includes(donorGroup);
  }

  /**
   * Evaluates operational donor screening eligibility
   * Note: Clearly labeled as operational screening. Final medical eligibility is confirmed on-site by staff.
   */
  static evaluateDonorEligibility(
    donor: {
      blood_group: BloodGroup;
      last_donation_date: string | null;
      temporary_deferral_until: string | null;
      deferral_reason: string | null;
      verified_status: string;
      notification_consent: number;
    },
    shortage: {
      blood_group: BloodGroup;
      component: BloodComponent;
      required_by: string;
    },
    intervalDays: number = 56
  ): EligibilityEvaluationResult {
    const reasons: string[] = [];
    const now = new Date();

    // 1. Blood Compatibility
    const isCompatible = this.isBloodCompatible(donor.blood_group, shortage.blood_group, shortage.component);
    if (!isCompatible) {
      reasons.push(`Incompatible blood group (${donor.blood_group} donor for ${shortage.blood_group} ${shortage.component})`);
    } else {
      reasons.push(`Compatible blood group (${donor.blood_group} compatible with ${shortage.blood_group})`);
    }

    // 2. Active Account / Verification
    if (donor.verified_status === 'suspended') {
      reasons.push('Donor account is suspended');
    }

    // 3. Notification Consent
    if (!donor.notification_consent) {
      reasons.push('Donor has opted out of emergency notifications');
    }

    // 4. Temporary Deferral Check
    let isDeferred = false;
    let untilDate: string | null = null;
    let deferralReason: string | null = null;

    if (donor.temporary_deferral_until) {
      const deferralDate = new Date(donor.temporary_deferral_until);
      if (deferralDate > now) {
        isDeferred = true;
        untilDate = donor.temporary_deferral_until;
        deferralReason = donor.deferral_reason || 'Temporary operational deferral';
        reasons.push(`Temporary deferral active until ${untilDate} (${deferralReason})`);
      }
    }

    // 5. Minimum Donation Interval Check (e.g. 56 days for Whole Blood)
    let daysSinceLastDonation: number | null = null;
    let nextEligibleDate: string | null = null;
    let intervalSatisfied = true;

    if (donor.last_donation_date) {
      const lastDate = new Date(donor.last_donation_date);
      const diffMs = now.getTime() - lastDate.getTime();
      daysSinceLastDonation = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      const nextDateObj = new Date(lastDate.getTime() + intervalDays * 24 * 60 * 60 * 1000);
      nextEligibleDate = nextDateObj.toISOString().split('T')[0];

      if (daysSinceLastDonation < intervalDays) {
        intervalSatisfied = false;
        const remaining = intervalDays - daysSinceLastDonation;
        reasons.push(`Donated ${daysSinceLastDonation} days ago; minimum interval requires ${remaining} more days (eligible ${nextEligibleDate})`);
      } else {
        reasons.push(`Interval satisfied: ${daysSinceLastDonation} days since last donation (minimum: ${intervalDays}d)`);
      }
    } else {
      reasons.push('First-time or unrecorded previous donation interval');
    }

    const hardFilterPassed =
      isCompatible &&
      donor.verified_status !== 'suspended' &&
      Boolean(donor.notification_consent) &&
      !isDeferred &&
      intervalSatisfied;

    return {
      isCompatible,
      isEligible: !isDeferred && intervalSatisfied,
      hardFilterPassed,
      reasons,
      daysSinceLastDonation,
      nextEligibleDate,
      deferralStatus: {
        isDeferred,
        untilDate,
        reason: deferralReason,
      },
    };
  }
}
