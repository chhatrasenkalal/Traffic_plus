# TrafficPulse — Adaptive Urban Signal Control & Digital Twin

TrafficPulse is an intelligent urban mobility and digital twin traffic management platform. It models real-time junction telemetry, parallel adaptive vs. fixed signal controllers, automated emergency green corridors, multi-persona operations (TMC Operator, Admin, Police, Emergency, Citizen), and empirical proof benchmarks.

---

## 🚀 Quick Start (Running Locally)

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm** or **bun** / **yarn**

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional for AI Insights)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Google Gemini API key if you want to use the server-side AI insights engine:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: If no key is provided, TrafficPulse automatically uses its built-in rule-based fallback engine seamlessly.)*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🌟 Key Features

1. **3D Live City Twin (`#/city`)**
   - Interactive 4-junction urban corridor (Downtown Core, Tech Park, Harbor Crossing, West Bypass).
   - Real-time car physics, dynamic signal changes, and camera angle controls.
   - Dynamic **Day & Night Simulation** with full Light/Dark mode support.

2. **Sim Lab (`#/lab`)**
   - Side-by-side scientific benchmark: Traditional Fixed Timer vs. Adaptive Queue Controller.
   - Sliders for traffic intensity (rush hour), sensor disruptions, and weather conditions.
   - Measured delay reduction (+35% to +43%).

3. **Emergency Green Corridor (`#/emergency`)**
   - Automatic preemption along ambulance and emergency vehicle routes.
   - Flips traffic signals green in advance, cutting hospital ETA by ~40%.

4. **Multi-Role Command Center**
   - Switch between **City Admin**, **TMC Operator**, **Police Chief**, **Emergency Dispatch**, and **Citizen Commuter**.
   - Role-targeted notifications and audit logs.

5. **Pitch & Presenter Guide**
   - Built-in 3-minute demo script, non-tech analogies, and presentation walkthrough.

---

## 🛠 Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Three.js, Lucide Icons, Recharts, Motion.
- **Backend**: Node.js, Express, Vite middleware mode, Google GenAI SDK.
