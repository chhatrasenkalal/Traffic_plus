import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Endpoint to download the full clean project zip
app.get('/api/download-zip', (_req, res) => {
  const zipPath = path.join(__dirname, 'trafficpulse.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="trafficpulse.zip"');
    return res.sendFile(zipPath);
  }
  return res.status(404).json({ error: 'Zip file not found' });
});

// Endpoint to download the full clean project codebase PDF
app.get('/api/download-pdf', (_req, res) => {
  const pdfPath = path.join(__dirname, 'trafficpulse-codebase.pdf');
  if (fs.existsSync(pdfPath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="trafficpulse-codebase.pdf"');
    return res.sendFile(pdfPath);
  }
  return res.status(404).json({ error: 'PDF file not found' });
});

// Initialize Gemini SDK if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI:', err);
  }
}

// AI Insights endpoint
app.post('/api/insights', async (req, res) => {
  const { metrics, reports, activePhase, speed, rushMultiplier } = req.body;

  if (!ai || !apiKey) {
    // Return fallback payload
    return res.json({
      success: false,
      isAi: false,
      fallback: true,
      message: 'Gemini API key not configured. Using local rule-based engine.',
    });
  }

  try {
    const prompt = `
You are TrafficPulse AI, an autonomous urban signal control intelligence engine analyzing a simulated 4-way intersection digital twin.
Current Live Simulation Telemetry:
- Time of Day Simulation: ${metrics?.timeOfDayString || 'Morning Peak'}
- Active Phase: ${activePhase || 'Phase A (North-South)'}
- Rush Hour Multiplier: ${rushMultiplier || 1.0}x
- Fixed Controller Avg Wait: ${metrics?.fixed?.avgWait?.toFixed(1) || 0}s | Max Queue: ${metrics?.fixed?.maxQueue || 0} | Processed: ${metrics?.fixed?.totalProcessed || 0}
- Adaptive Controller Avg Wait: ${metrics?.adaptive?.avgWait?.toFixed(1) || 0}s | Max Queue: ${metrics?.adaptive?.maxQueue || 0} | Processed: ${metrics?.adaptive?.totalProcessed || 0}
- Current Wait Reduction (Improvement): ${metrics?.improvementPercent?.toFixed(1) || 0}%
- Phase A (North-South) Queue: ${metrics?.phaseAQueue || 0} vehicles
- Phase B (East-West) Queue: ${metrics?.phaseBQueue || 0} vehicles
- Recent Citizen Reports count: ${(reports || []).length}
${reports && reports.length > 0 ? `Latest Citizen Reports:\n` + reports.slice(0, 3).map((r: any) => `- [${r.type}] ${r.direction}: ${r.description} (Severity: ${r.severity})`).join('\n') : 'No active incident reports.'}

Provide a concise, professional urban mobility operational analysis with:
1. Executive Summary (2 sentences highlighting why Adaptive is or isn't winning and current flow state)
2. Bottleneck Diagnostics (1-2 sentences on Phase A vs Phase B imbalance or incident impact)
3. Actionable Timing Recommendations (2-3 concrete bullet recommendations like green extension, phase bias, or incident flush)
4. Estimated Environmental Impact (CO2 reduction / fuel idle saved estimate based on wait time delta)

Return response in valid JSON with format:
{
  "summary": "string",
  "diagnostics": "string",
  "recommendations": ["string", "string", "string"],
  "environmentalImpact": "string",
  "recommendedAction": "string"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    return res.json({
      success: true,
      isAi: true,
      data: parsed,
    });
  } catch (error: any) {
    console.warn('Gemini API execution notice (falling back to rule-based engine):', error?.message);
    return res.json({
      success: false,
      isAi: false,
      fallback: true,
      error: error?.message || 'Gemini inference unavailable, local rule-based engine will be used.',
    });
  }
});

// Vite middleware in dev or static files in production
const isProduction = process.env.NODE_ENV === 'production';
if (!isProduction) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`TrafficPulse server running on http://0.0.0.0:${PORT}`);
});
