// BloodBridge Core Frontend TypeScript Definitions

export type BloodGroup = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
export type BloodComponent = 'whole_blood' | 'red_cells' | 'platelets' | 'plasma' | 'cryoprecipitate';

export type Role = 'staff' | 'donor' | 'admin';

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone?: string;
  status: string;
  blood_bank_id?: string;
  blood_bank_name?: string;
  donor_profile_id?: string;
  donor_blood_group?: string;
}

export interface BloodBank {
  id: string;
  name: string;
  code: string;
  address: string;
  locality: string;
  latitude: number;
  longitude: number;
  hourly_capacity: number;
  operating_hours: string;
  contact_phone: string;
  status: string;
}

export interface DonorProfile {
  id: string;
  user_id: string;
  name?: string;
  email?: string;
  phone?: string;
  blood_group: string;
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

export interface InventoryItem {
  id: string;
  blood_bank_id: string;
  blood_bank_name?: string;
  blood_group: string;
  component: string;
  available_units: number;
  reserved_units: number;
  min_threshold_units: number;
  expiring_units_48h: number;
  status: 'normal' | 'low' | 'critical';
  last_updated_at: string;
}

export interface ShortageRequest {
  id: string;
  blood_bank_id: string;
  blood_bank_name?: string;
  blood_bank_locality?: string;
  blood_bank_address?: string;
  blood_bank_phone?: string;
  created_by_user_id: string;
  created_by_name?: string;
  blood_group: string;
  component: string;
  units_required: number;
  units_committed: number;
  units_collected: number;
  urgency: 'critical' | 'high' | 'moderate' | 'planned';
  required_by: string;
  receiving_location: string;
  hourly_receiving_capacity: number;
  operational_reason?: string;
  notes?: string;
  status: 'active' | 'fulfilled' | 'cancelled' | 'expired';
  outreach_status: 'active' | 'paused' | 'completed';
  donors_contacted?: number;
  donors_accepted?: number;
  expected_arrivals?: number;
  created_at: string;
}

export interface RankedMatch {
  donor_id: string;
  user_id: string;
  name: string;
  blood_group: string;
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
  match_status?: string;
}

export interface Appointment {
  id: string;
  shortage_request_id: string;
  donor_id: string;
  donor_name?: string;
  donor_phone?: string;
  donor_blood_group?: string;
  donor_locality?: string;
  blood_bank_id: string;
  blood_bank_name?: string;
  blood_bank_locality?: string;
  scheduled_time: string;
  slot_hour: string;
  status: 'confirmed' | 'arrived' | 'completed' | 'cancelled' | 'no_show';
  arrival_time: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  donor_id: string;
  donor_name?: string;
  donor_blood_group?: string;
  shortage_request_id: string;
  channel: 'in_app' | 'sms' | 'email';
  recipient_contact: string;
  title: string;
  message: string;
  urgency_level: string;
  delivery_status: 'queued' | 'delivered' | 'failed';
  sent_at: string;
  read_at: string | null;
  responded_at: string | null;
  response_action: string | null;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  ip_address: string;
  timestamp: string;
}
