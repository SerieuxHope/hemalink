// HemaLink Deterministic Donor Matching & Ranking Engine
// Implements explainable 6-factor multi-criteria scoring with donor fatigue protection

import { EligibilityService, BloodGroup, BloodComponent } from './eligibilityService.js';
import { queryOne, queryAll } from '../db/database.js';

export interface MatchingWeights {
  proximity: number;
  availability: number;
  urgency: number;
  reliability: number;
  fatigue: number;
  operational: number;
}

export const DEFAULT_WEIGHTS: MatchingWeights = {
  proximity: 0.35,
  availability: 0.20,
  urgency: 0.15,
  reliability: 0.10,
  fatigue: 0.10,
  operational: 0.10,
};

export interface DonorRecord {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  email?: string;
  blood_group: BloodGroup;
  approximate_locality: string;
  pincode: string;
  latitude: number;
  longitude: number;
  availability_status: 'available_emergency' | 'weekdays_only' | 'weekends_only' | 'unavailable';
  last_donation_date: string | null;
  temporary_deferral_until: string | null;
  deferral_reason: string | null;
  requests_received_count: number;
  requests_accepted_count: number;
  requests_declined_count: number;
  last_notified_at: string | null;
  notification_consent: number;
  channel_preference: string;
  preferred_blood_bank_id?: string;
  verified_status: string;
}

export interface ShortageRecord {
  id: string;
  blood_bank_id: string;
  blood_bank_name?: string;
  blood_group: BloodGroup;
  component: BloodComponent;
  units_required: number;
  units_committed: number;
  urgency: 'critical' | 'high' | 'moderate' | 'planned';
  required_by: string;
  hourly_receiving_capacity: number;
  latitude: number;
  longitude: number;
}

export interface RankedDonorMatch {
  donor_id: string;
  user_id: string;
  name: string;
  blood_group: BloodGroup;
  approximate_locality: string;
  distance_km: number;
  travel_time_mins: number;
  total_score: number;
  proximity_score: number;
  availability_score: number;
  urgency_score: number;
  reliability_score: number;
  fatigue_score: number;
  operational_score: number;
  fatigue_level: 'Low' | 'Moderate' | 'High';
  is_eligible: boolean;
  why_ranked: string[];
  last_donation_display: string;
  recent_requests_count: number;
}

export class DonorMatchingService {
  /**
   * Calculates Haversine distance in kilometers between two geo-coordinates
   */
  static calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  /**
   * Estimates urban travel time in minutes based on distance
   */
  static estimateTravelTimeMins(distanceKm: number): number {
    // Average urban speed ~22 km/h + 5 min dispatch/prep baseline
    const transitMins = (distanceKm / 22) * 60;
    return Math.max(8, Math.round(transitMins + 5));
  }

  /**
   * Evaluates and ranks all candidates for an active shortage
   */
  static matchDonorsForShortage(
    shortage: ShortageRecord,
    options: {
      maxRadiusKm?: number;
      weights?: MatchingWeights;
    } = {}
  ): RankedDonorMatch[] {
    const maxRadius = options.maxRadiusKm || 40.0;
    const weights = options.weights || DEFAULT_WEIGHTS;

    // Fetch all active donors joined with user basic names
    const donors = queryAll<DonorRecord & { user_name: string }>(`
      SELECT 
        dp.*,
        u.name as user_name,
        u.email as email,
        u.phone as phone
      FROM donor_profiles dp
      JOIN users u ON dp.user_id = u.id
      WHERE u.status = 'active'
    `);

    const rankedList: RankedDonorMatch[] = [];

    for (const donor of donors) {
      // 1. Hard filters evaluation
      const eligibility = EligibilityService.evaluateDonorEligibility(
        donor,
        {
          blood_group: shortage.blood_group,
          component: shortage.component,
          required_by: shortage.required_by,
        },
        56
      );

      // Must pass blood compatibility, account status, consent, and not be actively deferred
      if (!eligibility.hardFilterPassed) {
        continue;
      }

      // 2. Distance calculation
      const distanceKm = this.calculateDistanceKm(
        donor.latitude,
        donor.longitude,
        shortage.latitude,
        shortage.longitude
      );

      if (distanceKm > maxRadius) {
        continue;
      }

      const travelTimeMins = this.estimateTravelTimeMins(distanceKm);

      // 3. Multi-Criteria Scoring (Normalized 0 - 100)

      // A. Proximity Score (35%)
      // Max score at <= 3km, decays smoothly up to 35km
      let proximityScore = 100;
      if (distanceKm > 3) {
        proximityScore = Math.max(10, Math.round(100 - (distanceKm - 3) * 2.8));
      }

      // B. Availability Score (20%)
      const today = new Date().getDay(); // 0 = Sun, 6 = Sat
      const isWeekend = today === 0 || today === 6;
      let availabilityScore = 60;
      if (donor.availability_status === 'available_emergency') {
        availabilityScore = 100;
      } else if (donor.availability_status === 'weekdays_only' && !isWeekend) {
        availabilityScore = 90;
      } else if (donor.availability_status === 'weekends_only' && isWeekend) {
        availabilityScore = 90;
      } else if (donor.availability_status === 'unavailable') {
        availabilityScore = 10;
      }

      // C. Urgency Fit (15%)
      // Required-by time vs travel time + donor availability
      const requiredByMs = new Date(shortage.required_by).getTime();
      const nowMs = Date.now();
      const minutesRemaining = Math.max(0, Math.round((requiredByMs - nowMs) / 60000));

      let urgencyScore = 70;
      if (minutesRemaining <= 180 && shortage.urgency === 'critical') {
        // Under 3 hours: prioritize very close donors with fast response
        if (travelTimeMins <= 25) {
          urgencyScore = 100;
        } else if (travelTimeMins <= 45) {
          urgencyScore = 80;
        } else {
          urgencyScore = 40;
        }
      } else if (minutesRemaining <= 360) {
        urgencyScore = travelTimeMins <= 40 ? 95 : 75;
      } else {
        urgencyScore = 85;
      }

      // D. Response Reliability (10%)
      const totalPastRequests = donor.requests_accepted_count + donor.requests_declined_count;
      let reliabilityScore = 75; // baseline for new donors with no history
      if (totalPastRequests > 0) {
        const acceptRatio = donor.requests_accepted_count / totalPastRequests;
        reliabilityScore = Math.round(acceptRatio * 100);
      }

      // E. Fatigue Reduction Score (10%)
      // Prevents over-notifying donors who have had recent requests
      let fatigueScore = 100;
      let fatigueLevel: 'Low' | 'Moderate' | 'High' = 'Low';
      const recentReqs = donor.requests_received_count;

      if (recentReqs === 0) {
        fatigueScore = 100;
        fatigueLevel = 'Low';
      } else if (recentReqs === 1) {
        fatigueScore = 80;
        fatigueLevel = 'Low';
      } else if (recentReqs === 2) {
        fatigueScore = 55;
        fatigueLevel = 'Moderate';
      } else {
        fatigueScore = 20;
        fatigueLevel = 'High';
      }

      // F. Operational Fit (10%)
      let operationalScore = 60;
      if (donor.blood_group === shortage.blood_group) {
        operationalScore += 25; // Exact blood match is preferred over universal donor
      }
      if (donor.preferred_blood_bank_id === shortage.blood_bank_id) {
        operationalScore += 15;
      }
      operationalScore = Math.min(100, operationalScore);

      // Weighted Total Score
      const totalScore = Math.round(
        proximityScore * weights.proximity +
          availabilityScore * weights.availability +
          urgencyScore * weights.urgency +
          reliabilityScore * weights.reliability +
          fatigueScore * weights.fatigue +
          operationalScore * weights.operational
      );

      // Deterministic "Why this donor was ranked" explanations
      const whyRanked: string[] = [];

      if (donor.blood_group === shortage.blood_group) {
        whyRanked.push(`Exact blood group match (${donor.blood_group})`);
      } else {
        whyRanked.push(`Compatible alternate blood group (${donor.blood_group} for ${shortage.blood_group})`);
      }

      whyRanked.push(`${distanceKm} km away (~${travelTimeMins} min travel)`);

      if (donor.availability_status === 'available_emergency') {
        whyRanked.push('Available immediately for emergency appeals');
      } else {
        whyRanked.push('Available for current schedule window');
      }

      if (totalPastRequests >= 2) {
        whyRanked.push(`Reliable responder (${reliabilityScore}% historical acceptance)`);
      }

      if (fatigueLevel === 'Low') {
        whyRanked.push('Low notification fatigue (uncontacted recently)');
      } else if (fatigueLevel === 'Moderate') {
        whyRanked.push('Moderate notification load');
      }

      if (donor.last_donation_date) {
        whyRanked.push(`Interval satisfied: ${eligibility.daysSinceLastDonation} days since prior donation`);
      } else {
        whyRanked.push('Eligible: Ready for maiden donation at this center');
      }

      const lastDonationDisplay = donor.last_donation_date
        ? `${eligibility.daysSinceLastDonation} days ago`
        : 'Never donated';

      rankedList.push({
        donor_id: donor.id,
        user_id: donor.user_id,
        name: donor.user_name,
        blood_group: donor.blood_group,
        approximate_locality: donor.approximate_locality,
        distance_km: distanceKm,
        travel_time_mins: travelTimeMins,
        total_score: totalScore,
        proximity_score: proximityScore,
        availability_score: availabilityScore,
        urgency_score: urgencyScore,
        reliability_score: reliabilityScore,
        fatigue_score: fatigueScore,
        operational_score: operationalScore,
        fatigue_level: fatigueLevel,
        is_eligible: true,
        why_ranked: whyRanked,
        last_donation_display: lastDonationDisplay,
        recent_requests_count: donor.requests_received_count,
      });
    }

    // Sort descending by total_score, tie-breaking on distance ascending
    rankedList.sort((a, b) => {
      if (b.total_score !== a.total_score) {
        return b.total_score - a.total_score;
      }
      return a.distance_km - b.distance_km;
    });

    return rankedList;
  }
}
