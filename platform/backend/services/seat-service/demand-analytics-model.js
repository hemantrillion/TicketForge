const demandData = require('./data/historical_demand_data.json');

class DemandAnalyticsModel {
  constructor() {
    this.dataset = demandData;
  }

  /**
   * Predicts booking velocity (seats booked per sim-hour) for a specific train & class
   */
  predictBookingVelocity(trainNumber, classCode, quota = 'GENERAL', seasonalContext = 'REGULAR') {
    const trainMeta = this.dataset.train_popularity_ranks[trainNumber] || { velocity_multiplier: 1.2 };
    const classWeight = this.dataset.class_demand_weights[quota === 'TATKAL' ? 'TATKAL' : classCode] || 1.0;
    const seasonWeight = this.dataset.seasonal_festival_multipliers[seasonalContext] || 1.0;
    const routeWeight = this.dataset.route_demand_multipliers['NDLS_MMCT'] || 2.0;

    // Velocity Score Calculation (Seats per sim-hour)
    const velocityScore = (trainMeta.velocity_multiplier * classWeight * seasonWeight * routeWeight).toFixed(2);
    return parseFloat(velocityScore);
  }

  /**
   * Predicts which berth types sell out first in order of preference
   */
  getBerthDepletionOrder() {
    // Returns ['LB', 'SL', 'MB', 'UB', 'SU'] based on historical demand weights
    const weights = this.dataset.berth_demand_weights;
    return Object.keys(weights).sort((a, b) => weights[b] - weights[a]);
  }
}

module.exports = new DemandAnalyticsModel();
