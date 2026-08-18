// Use global fetch
const API_URL = 'http://127.0.0.1:5000/api';

async function runTests() {
  console.log('=== Starting HouseHunt Backend Integration Tests ===');

  try {
    const timestamp = Date.now();
    const adminEmail = `admin-${timestamp}@test.com`;
    const userEmail = `user-${timestamp}@test.com`;
    const customerEmail = `customer-${timestamp}@test.com`;

    // 1. Login Admin
    console.log('\n1. Logging in default admin...');
    const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@househunt.com',
        password: 'admin123',
      }),
    });
    const adminUser = await adminLoginRes.json();
    if (!adminLoginRes.ok) throw new Error(`Admin login failed: ${JSON.stringify(adminUser)}`);
    console.log(`Success: Logged in Admin with ID: ${adminUser._id}`);

    // 2. Register Listing Owner
    console.log('\n2. Registering listing owner...');
    const ownerRegRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Owner',
        email: userEmail,
        password: 'password123',
        role: 'user',
      }),
    });
    const ownerUser = await ownerRegRes.json();
    if (!ownerRegRes.ok) throw new Error(`Owner registration failed: ${JSON.stringify(ownerUser)}`);
    console.log(`Success: Registered Owner with ID: ${ownerUser._id}`);

    // 3. Register Customer
    console.log('\n3. Registering customer...');
    const customerRegRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Customer',
        email: customerEmail,
        password: 'password123',
        role: 'user',
      }),
    });
    const customerUser = await customerRegRes.json();
    if (!customerRegRes.ok) throw new Error(`Customer registration failed: ${JSON.stringify(customerUser)}`);
    console.log(`Success: Registered Customer with ID: ${customerUser._id}`);

    // 4. Create property as Owner (should start as pending)
    console.log('\n4. Creating property listing as Owner...');
    const propRes = await fetch(`${API_URL}/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerUser.token}`,
      },
      body: JSON.stringify({
        title: 'Modern Cozy Apartment',
        description: 'A beautiful luxury apartment with nice views.',
        location: 'Indiranagar, Bangalore',
        price: 32000,
        type: 'apartment',
        amenities: ['Wifi', 'Air Conditioning', 'Gym'],
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
      }),
    });
    const property = await propRes.json();
    if (!propRes.ok) throw new Error(`Property creation failed: ${JSON.stringify(property)}`);
    console.log(`Success: Created Property "${property.title}" (Status: ${property.status})`);

    // 5. Query public properties (should be empty/not include the new pending property)
    console.log('\n5. Querying public approved properties...');
    const pubPropRes = await fetch(`${API_URL}/properties`);
    const pubProperties = await pubPropRes.json();
    const foundInPublic = pubProperties.some((p) => p._id === property._id);
    console.log(`Result: Property found in public list? ${foundInPublic} (Expected: false)`);
    if (foundInPublic) throw new Error('Pending property is visible to the public!');

    // 6. Approve property as Admin
    console.log('\n6. Approving property as Admin...');
    const approveRes = await fetch(`${API_URL}/properties/${property._id}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminUser.token}`,
      },
      body: JSON.stringify({ status: 'approved' }),
    });
    const approvedProperty = await approveRes.json();
    if (!approveRes.ok) throw new Error(`Property approval failed: ${JSON.stringify(approvedProperty)}`);
    console.log(`Success: Property status updated to: ${approvedProperty.status}`);

    // 7. Re-query public properties (should now include the approved property)
    console.log('\n7. Re-querying public approved properties...');
    const pubPropRes2 = await fetch(`${API_URL}/properties`);
    const pubProperties2 = await pubPropRes2.json();
    const foundInPublic2 = pubProperties2.some((p) => p._id === property._id);
    console.log(`Result: Property found in public list? ${foundInPublic2} (Expected: true)`);
    if (!foundInPublic2) throw new Error('Approved property is NOT visible to the public!');

    // 8. Book property as Customer
    console.log('\n8. Booking property as Customer...');
    const bookingRes = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerUser.token}`,
      },
      body: JSON.stringify({
        propertyId: property._id,
        startDate: '2026-08-01',
        endDate: '2026-08-15',
        totalPrice: 16000,
      }),
    });
    const booking = await bookingRes.json();
    if (!bookingRes.ok) throw new Error(`Booking failed: ${JSON.stringify(booking)}`);
    console.log(`Success: Booked property (Booking ID: ${booking._id}, Status: ${booking.status})`);

    // 9. View Customer Bookings
    console.log('\n9. Fetching Customer bookings...');
    const customerBookingRes = await fetch(`${API_URL}/bookings/my`, {
      headers: { Authorization: `Bearer ${customerUser.token}` },
    });
    const customerBookings = await customerBookingRes.json();
    console.log(`Success: Found ${customerBookings.length} booking(s) for Customer.`);
    if (customerBookings.length === 0) throw new Error('Customer booking is missing from their list!');

    // 10. Cancel Booking as Customer
    console.log('\n10. Cancelling booking as Customer...');
    const cancelRes = await fetch(`${API_URL}/bookings/${booking._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerUser.token}`,
      },
      body: JSON.stringify({ status: 'cancelled' }),
    });
    const cancelledBooking = await cancelRes.json();
    if (!cancelRes.ok) throw new Error(`Cancellation failed: ${JSON.stringify(cancelledBooking)}`);
    console.log(`Success: Booking status updated to: ${cancelledBooking.status}`);

    // 11. Access Control Check
    console.log('\n11. Testing access control: non-admin trying to approve property...');
    const badApproveRes = await fetch(`${API_URL}/properties/${property._id}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerUser.token}`,
      },
      body: JSON.stringify({ status: 'approved' }),
    });
    if (badApproveRes.status === 403) {
      console.log('Success: Correctly blocked unauthorized approval request with 403!');
    } else {
      throw new Error(`Access control failure: expected 403, got status ${badApproveRes.status}`);
    }

    console.log('\n====================================================');
    console.log('🎉 ALL BACKEND API INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error(error.message);
    process.exit(1);
  }
}

runTests();
