// =====================================================
//  config.js — Project info & AI context
// =====================================================

const CONFIG = {
  // Gemini API key (optional — user can also enter it in chatbot)
  GEMINI_API_KEY: '',

  PROJECT: {
    name:     'Hybrid Wind-Solar Charging Station with Anti-Theft System',
    power:    '1.2kW total (600W Solar + 600W Wind)',
    location: 'Baliuag University, Baliuag, Bulacan',
    year:     2026,
    team: [
      { name: 'Marden',                 role: 'Lead Engineer',       phone: '+63 912 345 6789' },
      { name: 'Rhey Victor Guillermo',  role: 'Systems Designer',    phone: '+63 923 456 7890' },
      { name: 'Victor Guillermo',       role: 'Security Specialist', phone: '+63 934 567 8901' },
      { name: "Ma'am Jennifer Del Amen",role: 'Project Adviser',     phone: '' }
    ]
  },

  get AI_CONTEXT() {
    return `You are an AI assistant for a Hybrid Wind-Solar Charging Station project (thesis/capstone).
Project: ${this.PROJECT.name}
Power: ${this.PROJECT.power}
Location: ${this.PROJECT.location}

Components: Arduino Nano (ATmega328P 16MHz), 16x2 LCD (I2C), 4x4 Matrix Keypad,
Solenoid Lock (12V 10kg), 4-ch Relay (5V 10A), LM2596 Buck Converter (5V@3A),
SIM800L GSM Module, 600W Polycrystalline Solar Panel, 600W Wind Turbine,
12V 200Ah Deep Cycle Battery (×2), MPPT 60A + PWM 30A Charge Controllers,
1500W Pure Sine Wave Inverter.

Security: 4-digit PIN, solenoid lock, motion detection, GSM SMS alerts, tamper-proof steel.
Charging: 4×USB-A (5V/2.4A), 2×USB-C PD (65W), 12V DC, 220V AC.
Team: ${this.PROJECT.team.map(m => `${m.name} (${m.role})`).join(', ')}

Respond in a friendly, helpful, and concise manner. Be technical when asked.`;
  }
};
