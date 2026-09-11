// HemaLink Comprehensive Database Seeding
// Generates realistic health facilities, 120+ diverse donors, inventory, and emergency scenarios

import { initDatabase, execute, queryOne, transaction } from './database.js';
import { BloodGroup } from '../services/eligibilityService.js';

export function seedDatabase(): void {
  initDatabase();

  const existingBank = queryOne('SELECT id FROM blood_banks LIMIT 1');
  if (existingBank) {
    console.log('Database already contains seeded data. Skipping full reseed.');
    return;
  }

  console.log('Seeding HemaLink database with clinical facilities, 120+ donors, and inventory...');

  transaction(() => {
    // 1. Seed System Configuration
    execute(`
      INSERT INTO system_configs (
        id, weight_proximity, weight_availability, weight_urgency, weight_reliability, weight_fatigue, weight_operational,
        interval_whole_blood_days, interval_platelets_days, interval_plasma_days, max_search_radius_km, fatigue_max_requests_14d
      ) VALUES (
        'cfg_default', 0.35, 0.20, 0.15, 0.10, 0.10, 0.10, 56, 14, 28, 35.0, 3
      )
    `);

    // 2. Seed Blood Banks
    const bloodBanks = [
      {
        id: 'bb_city_central',
        name: 'City Central Blood Bank & Transfusion Center',
        code: 'CCBB-01',
        address: '450 Healthcare Blvd, Metro Medical District',
        locality: 'Central District',
        latitude: 12.9716,
        longitude: 77.5946,
        hourly_capacity: 4,
        operating_hours: '24/7 Emergency Operations',
        contact_phone: '+1 (555) 234-8901',
      },
      {
        id: 'bb_metro_trauma',
        name: 'Metro Trauma Center Blood Bank',
        code: 'MTC-02',
        address: '12 Westside Express Way',
        locality: 'Westside Medical Park',
        latitude: 12.9850,
        longitude: 77.5620,
        hourly_capacity: 6,
        operating_hours: '24/7 Level-1 Trauma',
        contact_phone: '+1 (555) 789-1122',
      },
      {
        id: 'bb_st_jude',
        name: 'St. Jude Memorial Blood Center',
        code: 'SJBC-03',
        address: '890 Riverside Boulevard',
        locality: 'East River Campus',
        latitude: 12.9352,
        longitude: 77.6245,
        hourly_capacity: 3,
        operating_hours: '08:00 - 20:00 Daily',
        contact_phone: '+1 (555) 443-9087',
      },
    ];

    for (const bb of bloodBanks) {
      execute(
        `INSERT INTO blood_banks (id, name, code, address, locality, latitude, longitude, hourly_capacity, operating_hours, contact_phone, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
        [bb.id, bb.name, bb.code, bb.address, bb.locality, bb.latitude, bb.longitude, bb.hourly_capacity, bb.operating_hours, bb.contact_phone]
      );
    }

    // 3. Seed Core Users (Staff, Key Donors, Admin)
    const coreUsers = [
      {
        id: 'usr_staff_sarah',
        role: 'staff',
        name: 'Dr. Sarah Chen',
        email: 'staff@hemalink.local',
        phone: '+1 (555) 901-4411',
        blood_bank_id: 'bb_city_central',
      },
      {
        id: 'usr_donor_marcus',
        role: 'donor',
        name: 'Marcus Vance',
        email: 'marcus.vance@donor.local',
        phone: '7985674878',
      },
      {
        id: 'usr_donor_elena',
        role: 'donor',
        name: 'Elena Rostova',
        email: 'elena.rostova@donor.local',
        phone: '+1 (555) 403-9988',
      },
      {
        id: 'usr_donor_david',
        role: 'donor',
        name: 'David Kim',
        email: 'david.kim@donor.local',
        phone: '+1 (555) 201-7733',
      },
      {
        id: 'usr_admin',
        role: 'admin',
        name: 'System Administrator',
        email: 'admin@hemalink.local',
        phone: '+1 (555) 100-0000',
      },
    ];

    for (const u of coreUsers) {
      execute(
        `INSERT INTO users (id, role, name, email, phone, status, blood_bank_id)
         VALUES (?, ?, ?, ?, ?, 'active', ?)`,
        [u.id, u.role, u.name, u.email, u.phone, u.blood_bank_id || null]
      );
    }

    // 4. Seed Primary Key Donors
    execute(`
      INSERT INTO donor_profiles (
        id, user_id, blood_group, approximate_locality, pincode, latitude, longitude,
        availability_status, last_donation_date, temporary_deferral_until, deferral_reason,
        requests_received_count, requests_accepted_count, requests_declined_count,
        notification_consent, channel_preference, preferred_blood_bank_id, verified_status
      ) VALUES (
        'donor_marcus_1', 'usr_donor_marcus', 'O+', 'Richmond Town (~3.8 km)', '560025',
        12.9620, 77.6080, 'available_emergency', date('now', '-94 days'), NULL, NULL,
        1, 3, 0, 1, 'all', 'bb_city_central', 'verified'
      )
    `);

    execute(`
      INSERT INTO donor_profiles (
        id, user_id, blood_group, approximate_locality, pincode, latitude, longitude,
        availability_status, last_donation_date, temporary_deferral_until, deferral_reason,
        requests_received_count, requests_accepted_count, requests_declined_count,
        notification_consent, channel_preference, preferred_blood_bank_id, verified_status
      ) VALUES (
        'donor_elena_2', 'usr_donor_elena', 'O-', 'Indiranagar Stage 1 (~4.5 km)', '560038',
        12.9784, 77.6408, 'available_emergency', date('now', '-72 days'), NULL, NULL,
        0, 4, 1, 1, 'all', 'bb_city_central', 'verified'
      )
    `);

    execute(`
      INSERT INTO donor_profiles (
        id, user_id, blood_group, approximate_locality, pincode, latitude, longitude,
        availability_status, last_donation_date, temporary_deferral_until, deferral_reason,
        requests_received_count, requests_accepted_count, requests_declined_count,
        notification_consent, channel_preference, preferred_blood_bank_id, verified_status
      ) VALUES (
        'donor_david_3', 'usr_donor_david', 'A+', 'Koramangala 4th Block (~5.1 km)', '560034',
        12.9340, 77.6270, 'weekdays_only', date('now', '-18 days'), NULL, 'Recent Whole Blood Donation (< 56 days)',
        2, 2, 1, 1, 'all', 'bb_city_central', 'verified'
      )
    `);

    // 5. Procedurally Seed 120+ Diverse Realistic Donors
    const bloodGroups: BloodGroup[] = ['O+', 'O+', 'O+', 'O-', 'A+', 'A+', 'A-', 'B+', 'B+', 'B-', 'AB+', 'AB-'];
    const localities = [
      { name: 'Downtown Medical District', lat: 12.9730, lon: 77.5960, pin: '560001' },
      { name: 'Richmond Town', lat: 12.9610, lon: 77.6090, pin: '560025' },
      { name: 'Shanthi Nagar', lat: 12.9550, lon: 77.5990, pin: '560027' },
      { name: 'Ulsoor Lake Area', lat: 12.9810, lon: 77.6200, pin: '560008' },
      { name: 'Indiranagar 100ft Rd', lat: 12.9720, lon: 77.6410, pin: '560038' },
      { name: 'Domlur Second Stage', lat: 12.9620, lon: 77.6380, pin: '560071' },
      { name: 'Koramangala 1st Block', lat: 12.9280, lon: 77.6320, pin: '560034' },
      { name: 'Koramangala 5th Block', lat: 12.9350, lon: 77.6180, pin: '560095' },
      { name: 'Malleshwaram West', lat: 13.0030, lon: 77.5700, pin: '560003' },
      { name: 'Rajajinagar 3rd Block', lat: 12.9900, lon: 77.5550, pin: '560010' },
      { name: 'Jayanagar 4th Block', lat: 12.9300, lon: 77.5840, pin: '560011' },
      { name: 'Jayanagar 9th Block', lat: 12.9180, lon: 77.5950, pin: '560069' },
      { name: 'HSR Layout Sector 1', lat: 12.9120, lon: 77.6450, pin: '560102' },
      { name: 'HSR Layout Sector 4', lat: 12.9150, lon: 77.6380, pin: '560102' },
      { name: 'Basavanagudi Historic', lat: 12.9420, lon: 77.5750, pin: '560004' },
      { name: 'Frazer Town / Pulakeshinagar', lat: 12.9970, lon: 77.6140, pin: '560005' },
      { name: 'BTM Layout 2nd Stage', lat: 12.9140, lon: 77.6080, pin: '560076' },
      { name: 'Whitefield Tech Corridor', lat: 12.9690, lon: 77.7500, pin: '560066' },
      { name: 'Electronic City Phase 1', lat: 12.8450, lon: 77.6630, pin: '560100' },
      { name: 'Hebbal Flyover Zone', lat: 13.0350, lon: 77.5970, pin: '560024' },
    ];

    const firstNames = [
      'Aarav', 'Ananya', 'Rohan', 'Priya', 'Vikram', 'Neha', 'Arjun', 'Sneha', 'Aditya', 'Pooja',
      'Karthik', 'Divya', 'Siddharth', 'Meera', 'Rahul', 'Kavita', 'Sanjay', 'Deepa', 'Nikhil', 'Shreya',
      'James', 'Sarah', 'Michael', 'Emily', 'Daniel', 'Jessica', 'David', 'Rachel', 'Brian', 'Amanda',
      'Robert', 'Lisa', 'William', 'Ashley', 'Joseph', 'Sophia', 'Thomas', 'Olivia', 'Kevin', 'Hannah'
    ];
    const lastNames = [
      'Sharma', 'Patel', 'Reddy', 'Iyer', 'Nair', 'Verma', 'Rao', 'Gupta', 'Menon', 'Joshi',
      'Miller', 'Johnson', 'Smith', 'Williams', 'Brown', 'Davis', 'Wilson', 'Taylor', 'Anderson', 'Thomas'
    ];

    for (let i = 1; i <= 120; i++) {
      const fName = firstNames[i % firstNames.length];
      const lName = lastNames[(i * 3) % lastNames.length];
      const fullName = `${fName} ${lName}`;
      const userId = `usr_donor_gen_${i}`;
      const donorId = `donor_gen_${i}`;
      const bGroup = bloodGroups[i % bloodGroups.length];
      const loc = localities[i % localities.length];

      // Add small jitter to latitude and longitude (~100m to 600m)
      const latJitter = (Math.random() - 0.5) * 0.015;
      const lonJitter = (Math.random() - 0.5) * 0.015;
      const finalLat = Math.round((loc.lat + latJitter) * 10000) / 10000;
      const finalLon = Math.round((loc.lon + lonJitter) * 10000) / 10000;

      // Varied donation history:
      // ~65% donated > 56 days ago (eligible now)
      // ~20% donated < 56 days ago (deferred by donation interval)
      // ~10% first time donors
      // ~5% temporary medical deferral (dental, travel, antibiotic)
      let lastDonationDate: string | null = null;
      let deferralUntil: string | null = null;
      let deferralReason: string | null = null;

      const seedType = i % 20;
      if (seedType === 3) {
        // Temporary deferral for 14 days
        deferralUntil = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
        deferralReason = 'Recent dental procedure / oral antibiotics';
        lastDonationDate = new Date(Date.now() - 110 * 86400000).toISOString().split('T')[0];
      } else if (seedType === 7) {
        // Deferred by recent donation (24 days ago)
        lastDonationDate = new Date(Date.now() - 24 * 86400000).toISOString().split('T')[0];
      } else if (seedType === 11) {
        // Deferred by recent donation (42 days ago)
        lastDonationDate = new Date(Date.now() - 42 * 86400000).toISOString().split('T')[0];
      } else if (seedType === 15) {
        // Maiden donor
        lastDonationDate = null;
      } else {
        // Fully eligible (donated 65 - 190 days ago)
        const daysAgo = 60 + (i * 7) % 130;
        lastDonationDate = new Date(Date.now() - daysAgo * 86400000).toISOString().split('T')[0];
      }

      // Varied fatigue and past responses
      const reqCount = (i % 5); // 0 to 4
      const accCount = reqCount > 0 ? Math.floor(reqCount * 0.75) : 0;
      const decCount = reqCount - accCount;

      const availStatus = i % 6 === 0 ? 'weekdays_only' : i % 8 === 0 ? 'weekends_only' : 'available_emergency';

      execute(
        `INSERT INTO users (id, role, name, email, phone, status)
         VALUES (?, 'donor', ?, ?, ?, 'active')`,
        [userId, fullName, `donor${i}@hemalink.local`, `+1 (555) ${100 + (i % 899)}-${1000 + i}`]
      );

      execute(
        `INSERT INTO donor_profiles (
          id, user_id, blood_group, approximate_locality, pincode, latitude, longitude,
          availability_status, last_donation_date, temporary_deferral_until, deferral_reason,
          requests_received_count, requests_accepted_count, requests_declined_count,
          notification_consent, channel_preference, preferred_blood_bank_id, verified_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'all', 'bb_city_central', 'verified')`,
        [
          donorId,
          userId,
          bGroup,
          `${loc.name} (~${Math.round(2 + (i % 14))} km)`,
          loc.pin,
          finalLat,
          finalLon,
          availStatus,
          lastDonationDate,
          deferralUntil,
          deferralReason,
          reqCount,
          accCount,
          decCount,
        ]
      );
    }

    // 6. Seed Complete Blood Inventories across all 3 Blood Banks
    const components = ['Whole Blood', 'Packed RBC', 'Platelets', 'Fresh Frozen Plasma'];
    const allGroups: BloodGroup[] = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

    for (const bb of bloodBanks) {
      for (const bg of allGroups) {
        for (const comp of components) {
          const invId = `inv_${bb.id}_${bg}_${comp.replace(/\s+/g, '')}`;

          // Create specific critical demo condition for City Central Blood Bank O+ Whole Blood:
          let avail = 12 + Math.floor(Math.random() * 15);
          let reserved = 2 + Math.floor(Math.random() * 4);
          let minThresh = 15;
          let expiring48h = Math.floor(Math.random() * 3);

          if (bb.id === 'bb_city_central' && bg === 'O+' && comp === 'Whole Blood') {
            avail = 3; // Exactly 3 available as required by Hackathon Demo Scenario!
            reserved = 1;
            minThresh = 15;
            expiring48h = 0;
          } else if (bb.id === 'bb_city_central' && bg === 'O-' && comp === 'Packed RBC') {
            avail = 2; // Also low for universal donor
            minThresh = 10;
          }

          execute(
            `INSERT INTO inventories (
              id, blood_bank_id, blood_group, component, available_units, reserved_units, min_threshold_units, expiring_units_48h
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [invId, bb.id, bg, comp, avail, reserved, minThresh, expiring48h]
          );
        }
      }
    }

    // 7. Seed Active Critical Shortage Request (The Demo Scenario!)
    // Requirement: 12 units O+ Whole Blood. Stock has 3 units. Net needed = 9.
    const requiredByDate = new Date(Date.now() + 2.5 * 3600000).toISOString(); // +2h 30m from now

    execute(`
      INSERT INTO shortage_requests (
        id, blood_bank_id, created_by_user_id, blood_group, component,
        units_required, units_committed, units_collected, urgency, required_by,
        receiving_location, hourly_receiving_capacity, operational_reason, notes, status, outreach_status
      ) VALUES (
        'shortage_demo_o_plus',
        'bb_city_central',
        'usr_staff_sarah',
        'O+',
        'Whole Blood',
        12,
        3,
        1,
        'critical',
        ?,
        'City Central Transfusion Center, Room 104 - Trauma Receiving',
        4,
        'Emergency surgery for multi-vehicle highway collision trauma with severe internal bleeding',
        'Hospital stock critically depleted (3 units in reserve). Target 12 units total.',
        'active',
        'active'
      )
    `, [requiredByDate]);

    // 8. Seed Appointments and Prior Completed Donations for Realism
    const nowStr = new Date().toISOString();
    const todaySlot = '14:00';

    execute(`
      INSERT INTO appointments (
        id, shortage_request_id, donor_id, blood_bank_id, scheduled_time, slot_hour, status, created_at
      ) VALUES (
        'apt_demo_marcus',
        'shortage_demo_o_plus',
        'donor_marcus_1',
        'bb_city_central',
        ?,
        ?,
        'confirmed',
        ?
      )
    `, [requiredByDate, todaySlot, nowStr]);

    // Seed an initial audit log
    execute(`
      INSERT OR REPLACE INTO audit_logs (id, user_id, user_name, user_role, action, entity_type, entity_id, details, ip_address, timestamp)
      VALUES ('aud_init_1', 'usr_staff_sarah', 'Dr. Sarah Chen', 'staff', 'SHORTAGE_REQUEST_CREATED', 'shortage_request', 'shortage_demo_o_plus', 'Critical shortage created for 12 units O+ Whole Blood', '127.0.0.1', datetime('now'))
    `);

    console.log('Database successfully seeded with 3 blood banks, 123 realistic donors, and the emergency O+ scenario!');
  });
}

// If run directly via node / tsx
if (process.argv[1]?.endsWith('seed.ts')) {
  seedDatabase();
}
