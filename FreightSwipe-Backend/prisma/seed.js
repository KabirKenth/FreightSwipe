/**
 * Demo seed for FreightSwipe.
 *
 * Produces a believable snapshot of a running freight marketplace: real Canadian
 * lanes, loads spread across every status, matches at every stage of the swipe
 * flow, and completed jobs with reviews attached.
 *
 * Idempotent — it wipes and rebuilds the demo dataset, so it is safe to re-run to
 * reset the live demo.
 *
 *   node prisma/seed.js          (or: npm run db:seed from the repo root)
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'demo1234';

const day = 24 * 60 * 60 * 1000;
const now = Date.now();
/** Days from now as a Date; negative for the past. */
const inDays = (n) => new Date(now + n * day);

// --- People -----------------------------------------------------------------

const SHIPPERS = [
  { key: 'demoShipper', email: 'demo.shipper@freightswipe.app', name: 'Northwind Distribution', balance: 18400 },
  { key: 'maple',       email: 'ops@mapleridgefoods.ca',        name: 'Maple Ridge Foods',       balance: 9250 },
  { key: 'cascade',     email: 'dispatch@cascadebuild.ca',      name: 'Cascade Building Supply', balance: 22750 },
  { key: 'bayview',     email: 'logistics@bayviewbev.ca',       name: 'Bayview Beverage Co.',    balance: 6100 },
  { key: 'steel',       email: 'freight@ontariosteel.ca',       name: 'Ontario Steel Works',     balance: 31500 },
];

const TRUCKERS = [
  { key: 'demoTrucker', email: 'demo.trucker@freightswipe.app', name: 'Dave Kowalczyk',        balance: 12680, vehicleType: "Dry Van 53'",    licenseId: 'ON-CDL-4471902', verified: true },
  { key: 'amrit',       email: 'amrit.sandhu@carrier.ca',       name: 'Amrit Sandhu',          balance: 8420,  vehicleType: "Reefer 53'",     licenseId: 'ON-CDL-3318845', verified: true },
  { key: 'marie',       email: 'mc.tremblay@transport.qc.ca',   name: 'Marie-Claude Tremblay', balance: 15230, vehicleType: 'Flatbed',        licenseId: 'QC-CDL-8820114', verified: true },
  { key: 'jonah',       email: 'j.whitefeather@haul.ca',        name: 'Jonah Whitefeather',    balance: 4870,  vehicleType: 'Step Deck',      licenseId: 'MB-CDL-2204778', verified: true },
  { key: 'tomas',       email: 'tomas.silva@rigline.ca',        name: 'Tomas Silva',           balance: 2140,  vehicleType: 'Straight Truck', licenseId: 'BC-CDL-9911236', verified: false },
  { key: 'rachel',      email: 'r.oyelaran@northroad.ca',       name: 'Rachel Oyelaran',       balance: 19980, vehicleType: "Dry Van 53'",    licenseId: 'AB-CDL-5567301', verified: true },
];

// --- Places -----------------------------------------------------------------

const PLACES = {
  torontoDC:   { address: '1450 Wilson Ave',         city: 'Toronto',     province: 'ON', postalCode: 'M3M 1J8', country: 'Canada' },
  mississauga: { address: '6750 Century Ave',        city: 'Mississauga', province: 'ON', postalCode: 'L5N 2V8', country: 'Canada' },
  brampton:    { address: '8200 Dixie Rd',           city: 'Brampton',    province: 'ON', postalCode: 'L6T 5P6', country: 'Canada' },
  hamilton:    { address: '310 Burlington St E',     city: 'Hamilton',    province: 'ON', postalCode: 'L8L 4H1', country: 'Canada' },
  london:      { address: '1275 Sovereign Rd',       city: 'London',      province: 'ON', postalCode: 'N5V 4K7', country: 'Canada' },
  windsor:     { address: '3400 Rhodes Dr',          city: 'Windsor',     province: 'ON', postalCode: 'N8W 5A4', country: 'Canada' },
  ottawa:      { address: '2000 Thurston Dr',        city: 'Ottawa',      province: 'ON', postalCode: 'K1G 4K7', country: 'Canada' },
  kingston:    { address: '785 Sir John A Macdonald Blvd', city: 'Kingston', province: 'ON', postalCode: 'K7L 4X5', country: 'Canada' },
  montrealE:   { address: '9500 Rue Notre-Dame E',   city: 'Montreal',    province: 'QC', postalCode: 'H1L 3R6', country: 'Canada' },
  quebecCity:  { address: '2600 Boul Wilfrid-Hamel', city: 'Quebec City', province: 'QC', postalCode: 'G1P 2J3', country: 'Canada' },
  winnipeg:    { address: '1425 Inkster Blvd',       city: 'Winnipeg',    province: 'MB', postalCode: 'R2X 2W7', country: 'Canada' },
  saskatoon:   { address: '3502 Faithfull Ave',      city: 'Saskatoon',   province: 'SK', postalCode: 'S7P 0B2', country: 'Canada' },
  calgary:     { address: '5820 76 Ave SE',          city: 'Calgary',     province: 'AB', postalCode: 'T2C 4L8', country: 'Canada' },
  edmonton:    { address: '12820 184 St NW',         city: 'Edmonton',    province: 'AB', postalCode: 'T5V 1T4', country: 'Canada' },
  vancouver:   { address: '8055 North Fraser Way',   city: 'Burnaby',     province: 'BC', postalCode: 'V5J 5M8', country: 'Canada' },
  kelowna:     { address: '1935 Kirschner Rd',       city: 'Kelowna',     province: 'BC', postalCode: 'V1Y 4N7', country: 'Canada' },
  halifax:     { address: '30 Simmonds Dr',          city: 'Dartmouth',   province: 'NS', postalCode: 'B3B 1N9', country: 'Canada' },
  moncton:     { address: '135 Millennium Blvd',     city: 'Moncton',     province: 'NB', postalCode: 'E1E 2G8', country: 'Canada' },
  thunderBay:  { address: '975 Alloy Dr',            city: 'Thunder Bay', province: 'ON', postalCode: 'P7B 5Z8', country: 'Canada' },
  reginaYard:  { address: '444 McDonald St',         city: 'Regina',      province: 'SK', postalCode: 'S4N 6E1', country: 'Canada' },
};

// --- Loads ------------------------------------------------------------------
// no match key              -> untouched, so it shows in every trucker's swipe deck
// match: { trucker, status } -> a single match at that stage of the flow
// review                    -> both parties left a review (COMPLETED loads only)

const LOADS = [
  // ---- Open board: no matches at all, so the demo trucker's deck is full ----
  { shipper: 'maple',   from: 'torontoDC',   to: 'montrealE',  weight: 16800, budget: 2450, deadline: 4, status: 'PENDING', description: 'Palletized dry goods, 22 skids. Dock-to-dock, no liftgate needed.' },
  { shipper: 'cascade', from: 'hamilton',    to: 'ottawa',     weight: 21500, budget: 1980, deadline: 3, status: 'PENDING', description: 'Bundled steel studs and track. Flatbed with straps and edge protectors.' },
  { shipper: 'bayview', from: 'mississauga', to: 'london',     weight: 9400,  budget: 890,  deadline: 2, status: 'PENDING', description: 'Canned beverages, 14 skids. Tail-lift preferred at delivery.' },
  { shipper: 'steel',   from: 'brampton',    to: 'windsor',    weight: 24000, budget: 1650, deadline: 5, status: 'PENDING', description: 'Coiled sheet steel. Coil racks required, tarps supplied by shipper.' },
  { shipper: 'maple',   from: 'torontoDC',   to: 'quebecCity', weight: 12200, budget: 2890, deadline: 6, status: 'PENDING', description: 'Refrigerated dairy, maintain 2-4 degrees C. Reefer download at 06:00.' },
  { shipper: 'cascade', from: 'winnipeg',    to: 'calgary',    weight: 19700, budget: 4120, deadline: 8, status: 'PENDING', description: 'Engineered lumber packs. Trans-Canada run, drop trailer at destination.' },
  { shipper: 'bayview', from: 'vancouver',   to: 'kelowna',    weight: 7300,  budget: 1180, deadline: 3, status: 'PENDING', description: 'Bottled water, 11 skids. Coquihalla route, winter tires in season.' },
  { shipper: 'steel',   from: 'hamilton',    to: 'thunderBay', weight: 22800, budget: 3760, deadline: 9, status: 'PENDING', description: 'Structural beams, 40 ft. Oversize permit already filed by shipper.' },
  { shipper: 'maple',   from: 'halifax',     to: 'moncton',    weight: 8600,  budget: 760,  deadline: 2, status: 'PENDING', description: 'Frozen seafood, -18 degrees C. Short haul, same-day delivery.' },
  { shipper: 'cascade', from: 'edmonton',    to: 'saskatoon',  weight: 17400, budget: 1540, deadline: 4, status: 'PENDING', description: 'Drywall and insulation. Forklift available both ends.' },
  { shipper: 'bayview', from: 'ottawa',      to: 'kingston',   weight: 5900,  budget: 620,  deadline: 2, status: 'PENDING', description: 'Mixed pallets for retail restock. Appointment delivery, 08:00-11:00.' },
  { shipper: 'steel',   from: 'reginaYard',  to: 'winnipeg',   weight: 20100, budget: 1870, deadline: 6, status: 'PENDING', description: 'Rebar bundles. Flatbed, chains and binders required.' },

  // ---- Demo shipper's own open board ----
  { shipper: 'demoShipper', from: 'torontoDC', to: 'calgary',   weight: 18900, budget: 5240, deadline: 11, status: 'PENDING', description: 'Consumer electronics, high value. Air-ride trailer, sealed, no transloads.' },
  { shipper: 'demoShipper', from: 'brampton',  to: 'montrealE', weight: 14300, budget: 1720, deadline: 4,  status: 'PENDING', description: 'Retail overstock, 19 skids. Bilingual paperwork required at delivery.' },

  // ---- Demo shipper: applications waiting on their decision (Pending Matches) ----
  { shipper: 'demoShipper', from: 'mississauga', to: 'ottawa',   weight: 11200, budget: 1390, deadline: 5, status: 'PENDING', description: 'Packaged household goods, 16 skids. Standard dry van.',                 match: { trucker: 'amrit',  status: 'PENDING' } },
  { shipper: 'demoShipper', from: 'torontoDC',   to: 'hamilton', weight: 6400,  budget: 540,  deadline: 3, status: 'PENDING', description: 'Short local shuttle, 9 skids. Two drops in the same industrial park.', match: { trucker: 'rachel', status: 'PENDING' } },
  { shipper: 'demoShipper', from: 'brampton',    to: 'windsor',  weight: 15800, budget: 1610, deadline: 6, status: 'PENDING', description: 'Automotive parts for a Tier 1 plant. JIT window, do not miss the slot.', match: { trucker: 'marie',  status: 'PENDING' } },

  // ---- Demo trucker: applications awaiting a shipper (Accepted Loads) ----
  { shipper: 'maple',   from: 'montrealE', to: 'torontoDC', weight: 13600, budget: 2280, deadline: 5, status: 'PENDING', description: 'Backhaul of empty crates and returns. Loose load, no pallets.', match: { trucker: 'demoTrucker', status: 'PENDING' } },
  { shipper: 'cascade', from: 'london',    to: 'brampton',  weight: 10700, budget: 940,  deadline: 3, status: 'PENDING', description: 'Cabinetry and millwork. Blanket wrap, handle with care.',     match: { trucker: 'demoTrucker', status: 'PENDING' } },

  // ---- Demo trucker: passed on these (Declined Loads) ----
  { shipper: 'steel',   from: 'windsor', to: 'thunderBay', weight: 23900, budget: 2980, deadline: 7, status: 'PENDING', description: 'Heavy plate steel. Requires flatbed with coil racks.', match: { trucker: 'demoTrucker', status: 'REJECTED' } },
  { shipper: 'bayview', from: 'kelowna', to: 'edmonton',   weight: 8900,  budget: 1760, deadline: 6, status: 'PENDING', description: 'Bottled juice, temperature-sensitive. Reefer required.', match: { trucker: 'demoTrucker', status: 'REJECTED' } },

  // ---- Booked, not yet rolling (Matched Loads) ----
  { shipper: 'demoShipper', from: 'torontoDC',   to: 'winnipeg', weight: 17600, budget: 4380, deadline: 7,  status: 'MATCHED', description: 'Seasonal inventory push. Two-driver team preferred for transit time.', match: { trucker: 'demoTrucker', status: 'MATCHED' } },
  { shipper: 'demoShipper', from: 'mississauga', to: 'halifax',  weight: 12800, budget: 5120, deadline: 10, status: 'MATCHED', description: 'Long haul east. Fuel surcharge included in the posted budget.',     match: { trucker: 'jonah',       status: 'MATCHED' }, shipperConfirmed: true },
  { shipper: 'maple',       from: 'quebecCity',  to: 'montrealE', weight: 9800, budget: 830,  deadline: 3,  status: 'MATCHED', description: 'Reefer shuttle between plants. Continuous temperature log required.', match: { trucker: 'demoTrucker', status: 'MATCHED' }, truckerConfirmed: true },
  { shipper: 'steel',       from: 'hamilton',    to: 'calgary',  weight: 21300, budget: 6240, deadline: 12, status: 'MATCHED', description: 'Fabricated frames, tarped. Permits handled by the shipper.',        match: { trucker: 'marie',       status: 'MATCHED' } },

  // ---- On the road (In Transit) ----
  { shipper: 'demoShipper', from: 'brampton',  to: 'vancouver', weight: 16200, budget: 7480, deadline: 4, status: 'IN_TRANSIT', description: 'Transcontinental. Checkpoint updates expected at Winnipeg and Calgary.', match: { trucker: 'demoTrucker', status: 'MATCHED' }, shipperConfirmed: true, truckerConfirmed: true },
  { shipper: 'cascade',     from: 'calgary',   to: 'edmonton',  weight: 19400, budget: 1120, deadline: 1, status: 'IN_TRANSIT', description: 'Roofing materials. Delivering to an active construction site.',        match: { trucker: 'rachel',      status: 'MATCHED' }, shipperConfirmed: true, truckerConfirmed: true },
  { shipper: 'demoShipper', from: 'torontoDC', to: 'ottawa',    weight: 7600,  budget: 780,  deadline: 1, status: 'IN_TRANSIT', description: 'Office fit-out delivery. Inside delivery, dock level, second floor.',   match: { trucker: 'amrit',       status: 'MATCHED' }, shipperConfirmed: true, truckerConfirmed: true },

  // ---- Delivered (Completed) ----
  { shipper: 'demoShipper', from: 'torontoDC',   to: 'montrealE', weight: 15100, budget: 2340, deadline: -6,  status: 'COMPLETED', description: 'Weekly line haul. Delivered on time, clean BOL.',              match: { trucker: 'demoTrucker', status: 'MATCHED' }, shipperConfirmed: true, truckerConfirmed: true, review: { rating: 5, ofTrucker: 'Early to the dock, paperwork perfect. Booking Dave again.', ofShipper: 'Loaded fast and the dock team knew what they were doing.' } },
  { shipper: 'demoShipper', from: 'mississauga', to: 'london',    weight: 8300,  budget: 720,  deadline: -12, status: 'COMPLETED', description: 'Retail restock run. Two drops, both signed for.',                match: { trucker: 'rachel',      status: 'MATCHED' }, shipperConfirmed: true, truckerConfirmed: true, review: { rating: 4, ofTrucker: 'Arrived an hour late on the second drop but kept us posted.', ofShipper: 'Straightforward load, would run it again.' } },
  { shipper: 'maple',       from: 'winnipeg',    to: 'saskatoon', weight: 13900, budget: 1420, deadline: -9,  status: 'COMPLETED', description: 'Reefer produce. Temperature log accepted without exception.',     match: { trucker: 'demoTrucker', status: 'MATCHED' }, shipperConfirmed: true, truckerConfirmed: true, review: { rating: 5, ofTrucker: 'Reefer held temp the whole way. No claims.', ofShipper: 'Quick load out, good communication from dispatch.' } },
  // Left unreviewed on purpose so the "Leave a review" button is visible in the demo.
  { shipper: 'demoShipper', from: 'brampton',    to: 'kingston',  weight: 10400, budget: 960,  deadline: -3,  status: 'COMPLETED', description: 'Delivered Friday afternoon. Awaiting review from both sides.',    match: { trucker: 'demoTrucker', status: 'MATCHED' }, shipperConfirmed: true, truckerConfirmed: true },
  { shipper: 'steel',       from: 'hamilton',    to: 'ottawa',    weight: 20600, budget: 1890, deadline: -15, status: 'COMPLETED', description: 'Structural delivery to a bridge project.',                       match: { trucker: 'marie',       status: 'MATCHED' }, shipperConfirmed: true, truckerConfirmed: true, review: { rating: 5, ofTrucker: 'Handled an awkward site with no fuss.', ofShipper: 'Well organised shipper, permits were all in order.' } },

  // ---- Cancelled ----
  { shipper: 'demoShipper', from: 'torontoDC', to: 'windsor',    weight: 11800, budget: 1240, deadline: -2, status: 'CANCELLED', description: 'Cancelled by the shipper after the receiving plant shut for maintenance.' },
  { shipper: 'bayview',     from: 'montrealE', to: 'quebecCity', weight: 6700,  budget: 540,  deadline: -4, status: 'CANCELLED', description: 'Order pulled before pickup.' },
];

async function main() {
  console.log('Seeding FreightSwipe demo data...');

  // Wipe in foreign-key-safe order so the seed can be re-run to reset the demo.
  await prisma.review.deleteMany();
  await prisma.match.deleteMany();
  await prisma.load.deleteMany();
  await prisma.truckerProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.address.deleteMany();
  console.log('  cleared existing data');

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const users = {};

  for (const s of SHIPPERS) {
    users[s.key] = await prisma.user.create({
      data: { email: s.email, name: s.name, passwordHash, role: 'SHIPPER', balance: s.balance },
    });
  }

  for (const t of TRUCKERS) {
    users[t.key] = await prisma.user.create({
      data: {
        email: t.email,
        name: t.name,
        passwordHash,
        role: 'TRUCKER',
        balance: t.balance,
        truckerProfile: {
          create: { vehicleType: t.vehicleType, licenseId: t.licenseId, verified: t.verified },
        },
      },
    });
  }

  users.admin = await prisma.user.create({
    data: { email: 'admin@freightswipe.app', name: 'FreightSwipe Operations', passwordHash, role: 'ADMIN', balance: 0 },
  });
  console.log('  created ' + Object.keys(users).length + ' users');

  // Each load gets its own origin/destination rows, mirroring how the API
  // creates addresses when a shipper posts a load.
  const addressFor = (key) => prisma.address.create({ data: PLACES[key] });

  let matchCount = 0;
  let reviewCount = 0;

  for (const spec of LOADS) {
    const [origin, destination] = await Promise.all([addressFor(spec.from), addressFor(spec.to)]);
    const shipper = users[spec.shipper];

    const load = await prisma.load.create({
      data: {
        shipperId: shipper.id,
        originId: origin.id,
        destinationId: destination.id,
        weight: spec.weight,
        budget: spec.budget,
        deadline: inDays(spec.deadline),
        description: spec.description,
        status: spec.status,
        shipperInTransitConfirmed: Boolean(spec.shipperConfirmed),
        truckerInTransitConfirmed: Boolean(spec.truckerConfirmed),
        createdAt: inDays(spec.deadline - 14),
      },
    });

    if (!spec.match) continue;

    const trucker = users[spec.match.trucker];
    await prisma.match.create({
      data: {
        loadId: load.id,
        truckerId: trucker.id,
        shipperId: shipper.id,
        status: spec.match.status,
        createdAt: inDays(spec.deadline - 10),
      },
    });
    matchCount += 1;

    if (!spec.review) continue;

    await prisma.review.createMany({
      data: [
        { loadId: load.id, reviewerId: shipper.id, reviewedId: trucker.id, rating: spec.review.rating, comment: spec.review.ofTrucker, createdAt: inDays(spec.deadline + 1) },
        { loadId: load.id, reviewerId: trucker.id, reviewedId: shipper.id, rating: spec.review.rating, comment: spec.review.ofShipper, createdAt: inDays(spec.deadline + 1) },
      ],
    });
    reviewCount += 2;
  }

  const openBoard = LOADS.filter((l) => l.status === 'PENDING' && !l.match).length;

  console.log('  created ' + LOADS.length + ' loads (' + openBoard + ' untouched on the open board)');
  console.log('  created ' + matchCount + ' matches and ' + reviewCount + ' reviews');
  console.log('');
  console.log('Demo logins (password: ' + DEMO_PASSWORD + ')');
  console.log('  shipper  demo.shipper@freightswipe.app');
  console.log('  trucker  demo.trucker@freightswipe.app');
  console.log('  admin    admin@freightswipe.app');
  console.log('Done.');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
