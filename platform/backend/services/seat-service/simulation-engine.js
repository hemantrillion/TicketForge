const redis = require('redis');

// DEMAND VELOCITY MULTIPLIERS BY TRAIN TYPE & ROUTE
const TRAIN_DEMAND_PROFILE = {
  '12951': { name: 'MUMBAI RAJDHANI', multiplier: 3.5 },
  '22436': { name: 'VANDE BHARAT EXP', multiplier: 4.0 },
  '12002': { name: 'SHATABDI EXPRESS', multiplier: 2.5 },
  '12626': { name: 'KERALA EXPRESS', multiplier: 1.5 }
};

class SimulationEngine {
  constructor() {
    this.redisClient = null;
    this.intervalId = null;
  }

  async init() {
    try {
      this.redisClient = redis.createClient({ url: 'redis://localhost:6379' });
      await this.redisClient.connect();
      console.log('✅ Demand-Velocity Simulation Engine connected to Redis');
    } catch (err) {
      console.log('⚠️ Redis not running for Simulation Engine. Running local memory simulation.');
    }
  }

  startSimulation() {
    console.log('🚀 Demand-Velocity Background Simulation Engine Started');
    
    // Run simulation tick every 15 seconds
    this.intervalId = setInterval(async () => {
      this.runSimulationTick();
    }, 15000);
  }

  async runSimulationTick() {
    const timeNow = new Date().toLocaleTimeString();
    
    // Simulate background bookings across popular trains
    Object.keys(TRAIN_DEMAND_PROFILE).forEach((trainNo) => {
      const profile = TRAIN_DEMAND_PROFILE[trainNo];
      const randomDec = Math.floor(Math.random() * profile.multiplier);
      if (randomDec > 0) {
        console.log(`[${timeNow}] 📈 [SIMULATION]: Train ${trainNo} (${profile.name}) booked ${randomDec} seats under high demand velocity.`);
      }
    });
  }

  stopSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      console.log('🛑 Demand-Velocity Simulation Engine Stopped');
    }
  }
}

module.exports = new SimulationEngine();
