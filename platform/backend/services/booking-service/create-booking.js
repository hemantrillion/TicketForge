const express = require('express');
const router = express.Router();
const { pool, redis } = require('../../config/db');
const { authenticateToken } = require('../user-service/index');

// Helper to generate 10-digit IRCTC PNR
function generatePNR() {
  const prefix = Math.floor(100 + Math.random() * 900);
  const suffix = Math.floor(1000000 + Math.random() * 9000000);
  return `${prefix}-${suffix}`;
}

// POST /api/bookings - Create Train Reservation (PNR Ticket Creation)
router.post('/bookings', authenticateToken, async (req, res) => {
  const user_id = req.user.id;
  const idempotency_key = req.headers['x-idempotency-key'];
  const { event_id, seat_ids, passenger_name, passenger_age, passenger_gender } = req.body;

  if (!idempotency_key) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'X-Idempotency-Key header is required' });
  }
  if (!event_id || !seat_ids || !Array.isArray(seat_ids) || seat_ids.length === 0) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Event ID and at least one Seat/Berth ID required' });
  }

  // Idempotency check: Return existing booking if key has already been processed
  try {
    const existingBooking = await pool.query(
      'SELECT id, pnr_number, user_id, event_id, passenger_name, passenger_age, passenger_gender, status, total_amount, idempotency_key, created_at FROM bookings WHERE idempotency_key = $1',
      [idempotency_key]
    );

    if (existingBooking.rows.length > 0) {
      return res.status(200).json({
        message: 'Duplicate request - returned existing booking',
        booking: existingBooking.rows[0]
      });
    }
  } catch (err) {
    console.error('Idempotency check error:', err);
  }

  // Verify active berth holds in Redis
  for (const seat_id of seat_ids) {
    const holdKey = `seat_hold:${seat_id}`;
    const holdDataRaw = await redis.get(holdKey);
    if (!holdDataRaw) {
      return res.status(400).json({ error: 'HOLD_EXPIRED', message: `Berth ${seat_id} hold has expired or was not claimed.` });
    }
    const holdData = JSON.parse(holdDataRaw);
    if (holdData.user_id !== user_id) {
      return res.status(403).json({ error: 'UNAUTHORIZED_HOLD', message: `Berth ${seat_id} is held by a different user.` });
    }
  }

  const pnr_number = generatePNR();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const seatsResult = await client.query(
      'SELECT id, price FROM seats WHERE id = ANY($1::uuid[]) FOR UPDATE',
      [seat_ids]
    );

    let total_amount = 0;
    seatsResult.rows.forEach(s => {
      total_amount += parseFloat(s.price);
    });

    // Create booking record with PNR
    const bookingResult = await client.query(
      `INSERT INTO bookings (pnr_number, user_id, event_id, passenger_name, passenger_age, passenger_gender, status, idempotency_key, total_amount) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING id, pnr_number, user_id, event_id, passenger_name, passenger_age, passenger_gender, status, total_amount, idempotency_key, created_at`,
      [pnr_number, user_id, event_id, passenger_name || 'Passenger', passenger_age || 30, passenger_gender || 'Male', 'pending', idempotency_key, total_amount]
    );

    const booking = bookingResult.rows[0];

    // Link seats in booking_seats
    for (const seat_id of seat_ids) {
      await client.query(
        'INSERT INTO booking_seats (booking_id, seat_id) VALUES ($1, $2)',
        [booking.id, seat_id]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      booking_id: booking.id,
      pnr_number: booking.pnr_number,
      user_id: booking.user_id,
      event_id: booking.event_id,
      passenger_name: booking.passenger_name,
      passenger_age: booking.passenger_age,
      passenger_gender: booking.passenger_gender,
      status: booking.status,
      total_amount: parseFloat(booking.total_amount),
      idempotency_key: booking.idempotency_key,
      created_at: booking.created_at
    });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(409).json({ error: 'DUPLICATE_BOOKING', message: 'Berth already booked or idempotency conflict' });
    }
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to create booking' });
  } finally {
    client.release();
  }
});

// GET /api/bookings/:id - Get booking details
router.get('/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const bookingResult = await pool.query(
      'SELECT id, pnr_number, user_id, event_id, passenger_name, passenger_age, passenger_gender, status, total_amount, idempotency_key, created_at FROM bookings WHERE id = $1',
      [req.params.id]
    );
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];
    const seatsResult = await pool.query(`
      SELECT s.id as seat_id, s.coach, s.seat_label, s.berth_type, s.section, s.price
      FROM booking_seats bs
      JOIN seats s ON bs.seat_id = s.id
      WHERE bs.booking_id = $1
    `, [booking.id]);

    res.json({
      ...booking,
      total_amount: parseFloat(booking.total_amount),
      seats: seatsResult.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to fetch booking' });
  }
});

module.exports = router;
