const demandModel = require('./demand-analytics-model');

class SimulationEngine {
  constructor() {
    this.demandModel = demandModel;
    this.intervalId = null;
    this.simSpeed = 1;
  }

  setSpeed(speed) {
    this.simSpeed = speed;
  }

  runSimulationTick(simDate) {
    const trainsToSimulate = ['22436', '12951', '12002', '12626'];
    const depletionOrder = this.demandModel.getBerthDepletionOrder();

    trainsToSimulate.forEach(trainNo => {
      const velocity = this.demandModel.predictBookingVelocity(trainNo, '3A', 'GENERAL');
      const simSecsBooked = (velocity * (this.simSpeed / 24)).toFixed(1);
      
      if (simSecsBooked > 0.5) {
        console.log(`[${simDate.toLocaleTimeString()}] 📈 [ML SIMULATION]: Train ${trainNo} velocity=${velocity} seats/hr. Depleting berths in order: ${depletionOrder.join(' > ')}.`);
      }
    });
  }
}

module.exports = new SimulationEngine();
