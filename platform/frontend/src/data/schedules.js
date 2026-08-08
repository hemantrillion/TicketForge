export const TRAIN_SCHEDULES = {
  '12951': {
    number: '12951',
    name: 'MUMBAI RAJDHANI EXPRESS',
    type: 'PREMIUM EXPRESS',
    from: 'NDLS - New Delhi',
    to: 'MMCT - Mumbai Central',
    runsOn: 'M T W T F S S',
    deptTime: '16:55',
    deptHour: 16,
    deptMin: 55,
    arrTime: '08:35',
    stoppages: [
      { seq: 1, stationCode: 'NDLS', stationName: 'New Delhi', arr: 'Source', dept: '16:55', pf: 'Platform 1', distanceKm: 0, day: 1 },
      { seq: 2, stationCode: 'KOTA', stationName: 'Kota Junction', arr: '21:40', dept: '21:50', pf: 'Platform 2', distanceKm: 465, day: 1 },
      { seq: 3, stationCode: 'RTM', stationName: 'Ratlam Junction', arr: '00:45', dept: '00:50', pf: 'Platform 4', distanceKm: 731, day: 2 },
      { seq: 4, stationCode: 'BRC', stationName: 'Vadodara Junction', arr: '04:10', dept: '04:20', pf: 'Platform 1', distanceKm: 992, day: 2 },
      { seq: 5, stationCode: 'ST', stationName: 'Surat', arr: '05:55', dept: '06:00', pf: 'Platform 2', distanceKm: 1122, day: 2 },
      { seq: 6, stationCode: 'BVI', stationName: 'Borivali', arr: '07:58', dept: '08:00', pf: 'Platform 7', distanceKm: 1355, day: 2 },
      { seq: 7, stationCode: 'MMCT', stationName: 'Mumbai Central', arr: '08:35', dept: 'Destination', pf: 'Platform 1', distanceKm: 1384, day: 2 }
    ]
  },
  '22436': {
    number: '22436',
    name: 'VANDE BHARAT EXPRESS',
    type: 'PREMIUM SEMI-HIGH SPEED',
    from: 'NDLS - New Delhi',
    to: 'MMCT - Mumbai Central',
    runsOn: 'M T W T F S -',
    deptTime: '06:00',
    deptHour: 6,
    deptMin: 0,
    arrTime: '18:15',
    stoppages: [
      { seq: 1, stationCode: 'NDLS', stationName: 'New Delhi', arr: 'Source', dept: '06:00', pf: 'Platform 16', distanceKm: 0, day: 1 },
      { seq: 2, stationCode: 'KOTA', stationName: 'Kota Junction', arr: '09:40', dept: '09:45', pf: 'Platform 1', distanceKm: 465, day: 1 },
      { seq: 3, stationCode: 'BRC', stationName: 'Vadodara Junction', arr: '14:25', dept: '14:30', pf: 'Platform 2', distanceKm: 992, day: 1 },
      { seq: 4, stationCode: 'ST', stationName: 'Surat', arr: '16:00', dept: '16:05', pf: 'Platform 1', distanceKm: 1122, day: 1 },
      { seq: 5, stationCode: 'MMCT', stationName: 'Mumbai Central', arr: '18:15', dept: 'Destination', pf: 'Platform 5', distanceKm: 1384, day: 1 }
    ]
  },
  '12002': {
    number: '12002',
    name: 'SHATABDI EXPRESS',
    type: 'PREMIUM EXPRESS',
    from: 'NDLS - New Delhi',
    to: 'MMCT - Mumbai Central',
    runsOn: 'M T W T F S S',
    deptTime: '06:15',
    deptHour: 6,
    deptMin: 15,
    arrTime: '18:05',
    stoppages: [
      { seq: 1, stationCode: 'NDLS', stationName: 'New Delhi', arr: 'Source', dept: '06:15', pf: 'Platform 2', distanceKm: 0, day: 1 },
      { seq: 2, stationCode: 'AGC', stationName: 'Agra Cantt', arr: '07:50', dept: '07:55', pf: 'Platform 1', distanceKm: 195, day: 1 },
      { seq: 3, stationCode: 'GWL', stationName: 'Gwalior Junction', arr: '09:20', dept: '09:25', pf: 'Platform 3', distanceKm: 313, day: 1 },
      { seq: 4, stationCode: 'VGLJ', stationName: 'VGL Jhansi Junction', arr: '10:45', dept: '10:50', pf: 'Platform 2', distanceKm: 410, day: 1 },
      { seq: 5, stationCode: 'MMCT', stationName: 'Mumbai Central', arr: '18:05', dept: 'Destination', pf: 'Platform 3', distanceKm: 1384, day: 1 }
    ]
  },
  '12626': {
    number: '12626',
    name: 'KERALA EXPRESS',
    type: 'SUPERFAST EXPRESS',
    from: 'NDLS - New Delhi',
    to: 'MMCT - Mumbai Central',
    runsOn: 'M T W T F S S',
    deptTime: '20:10',
    deptHour: 20,
    deptMin: 10,
    arrTime: '14:40',
    stoppages: [
      { seq: 1, stationCode: 'NDLS', stationName: 'New Delhi', arr: 'Source', dept: '20:10', pf: 'Platform 3', distanceKm: 0, day: 1 },
      { seq: 2, stationCode: 'MTJ', stationName: 'Mathura Junction', arr: '21:50', dept: '21:55', pf: 'Platform 2', distanceKm: 141, day: 1 },
      { seq: 3, stationCode: 'KOTA', stationName: 'Kota Junction', arr: '01:20', dept: '01:30', pf: 'Platform 2', distanceKm: 465, day: 2 },
      { seq: 4, stationCode: 'MMCT', stationName: 'Mumbai Central', arr: '14:40', dept: 'Destination', pf: 'Platform 4', distanceKm: 1384, day: 2 }
    ]
  }
};
