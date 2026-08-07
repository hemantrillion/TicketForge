const express = require('express');
const router = express.Router();
const { pool, redis } = require('../../config/db');
const { authenticateToken } = require('../user-service/index');

// POST /api/bookings - Create Booking with Idempotency Key Guard
router.post('/bookings', authenticateToken, async (req, res) => {
  const user_id = req.user.id;
  const idempotency_key = req.headers['x-idempotency-key'];
  const { event_id, seat_ids } = req.body;

  if (!idempotency_key) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'X-Idempotency-Key header is required' });
  }
  if (!event_id || !seat_ids || !Array.isArray(seat_ids) || seat_ids.length === 0) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Event ID and at least one Seat ID required' });
  }

  // Idempotency check: Return existing booking if key has already been processed
  try {
    const existingBooking = await pool.query(
      'SELECT id, user_id, event_id, status, total_amount, idempotency_key FROM bookings WHERE idempotency_key = $1',
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

  // Verify active seat holds in Redis
  for (const seat_id of seat_ids) {
    const holdKey = `seat_hold:${seat_id}`;
    const holdDataRaw = await redis.get(holdKey);
    if (!holdDataRaw) {
      return res.status(400).json({ error: 'HOLD_EXPIRED', message: `Seat ${seat_id} hold has expired or was not claimed.` });
    }
    const holdData = JSON.parse(holdDataRaw);
    if (holdData.user_id !== user_id) {
      return res.status(403).json({ error: 'UNAUTHORIZED_HOLD', message: `Seat ${seat_id} is held by a different user.` });
    }
  }

  // Calculate total price
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

    // Create booking record
    const bookingResult = await client.query(
      'INSERT INTO bookings (user_id, event_id, status, idempotency_key, total_amount) VALUES ($1, $2, $3, $4, $5) RETURNING id, user_id, event_id, status, total_amount, idempotency_key, created_at',
      [user_id, event_id, 'pending', idempotency_key, total_amount]
    );

    const booking = bookingResult.rows[0];

    // Link seats in booking_seats join table
    for (const seat_id of seat_ids) {
      await client.query(
        'INSERT INTO booking_seats (booking_id, seat_id) VALUES ($1, $2)',
        [booking.id, seat_id]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      booking_id: booking.id,
      user_id: booking.user_id,
      event_id: booking.event_id,
      status: booking.status,
      total_amount: parseFloat(booking.total_amount),
      idempotency_key: booking.idempotency_key
    });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') { // Unique constraint violation on idempotency_key or seat_id
      return res.status(409).json({ error: 'DUPLICATE_BOOKING', message: 'Seat already booked or idempotency conflict' });
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
      'SELECT id, user_id, event_id, status, total_amount, idempotency_key, created_at FROM bookings WHERE id = $1',
      [req.params.id]
    );
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];
    const seatsResult = await pool.query(`
      SELECT s.id as seat_id, s.seat_label, s.section, s.price
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

// POST /api/bookings/:id/cancel - Cancel booking
router.post('/bookings/:id/cancel', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Update booking status
    const bookingRes = await client.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING id',
      ['cancelled', req.params.id, req.user.id]
    );

    if (bookingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Booking not found' });
    }

    // Release seats
    const seatsRes = await client.query('SELECT seat_id FROM booking_seats WHERE booking_id = $1', [req.params.id]);
    for (const row of seatsRes.rows) {
      await client.query('UPDATE seats SET status = $1 WHERE id = $2', ['available', row.seat_id]);
      await redis.del(`seat_hold:${row.seat_id}`);
    }

    await client.query('COMMIT');
    res.json({ id: req.params.id, status: 'cancelled' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to cancel booking' });
  } finally {
    client.release();
  }
});

module.exports = router;
