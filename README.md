# Resilio - Tactical Disaster Logistics Command Center

Resilio is a full-stack, tactical command dashboard designed for national disaster response teams. It aggregates live disaster telemetry from Indonesian agencies (BMKG, BNPB, PetaBencana) and integrates with Google's Gemini AI to dynamically calculate logistics requirements and generate actionable Situation Reports (SitReps).

## 🚀 Features

- **Live Telemetry Aggregation**: Automatically pulls and sanitizes live data from BMKG (Earthquake/Tsunami warnings), BNPB (Regional Risks), and PetaBencana.
- **AI-Powered SitReps**: Integrates the Gemini API to analyze disaster severity, population density, and event type to generate concise, military-grade tactical briefings.
- **Predictive Logistics**: Calculates estimated relief requirements (Water, Medical Kits, Blankets, Food Rations) based on WorldPop demographics and event severity.
- **Tactical Dispatch**: Compiles all mission data into a standard text protocol for instant clipboard export and field deployment.
- **Threat Filtering**: Interactive Map UI allows operators to filter the radar for 'Critical' or 'Tsunami' level events to reduce cognitive noise.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React-Leaflet
- **Backend**: Express (Node.js) acting as a secure proxy and AI ingestion layer
- **AI/ML**: Google GenAI SDK (`gemini-3.6-flash`)
- **Build System**: esbuild (for single-file CommonJS backend artifact generation)

## 📋 Prerequisites

- Node.js v18+
- A Google Gemini API Key

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd resilio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment file and add your Gemini API key:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to include your key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```
   *Note: Do not commit your `.env` file to version control.*

## 💻 Running Locally

To run both the Vite frontend and Express backend concurrently in development mode:

```bash
npm run dev
```
The server will start on `http://localhost:3000`.

## 📦 Production Build

The application uses a custom build pipeline to compile the backend via `esbuild` for containerized environments.

1. **Build the full-stack application:**
   ```bash
   npm run build
   ```
   *This compiles the React frontend to `dist/` and the Express server to `dist/server.cjs`.*

2. **Start the production server:**
   ```bash
   npm start
   ```

## 🔒 Security Architecture

- **Server-Side AI Inference**: The Gemini API key is strictly maintained on the Node.js backend. The client requests predictions via a secure `/api/sitrep` proxy, ensuring credentials are never exposed to the browser.
- **Fault Tolerance**: External telemetry endpoints (BMKG, BNPB) are wrapped in resilient fetch handlers (`safeFetchJSON`) to prevent backend crashes during national API outages.
