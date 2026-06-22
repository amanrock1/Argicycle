<div align="center">

<img src="https://via.placeholder.com/120x120/1e293b/4ade80?text=🌱" alt="Agricycle Logo" width="100" style="border-radius: 20px;" />

# Agricycle
**Turning City Trash into Farmer's Gold**

[![React](https://img.shields.io/badge/React-19.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Firebase](https://img.shields.io/badge/Firebase-Admin-FFCA28?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-success.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  <b>Agricycle</b> is a circular economy platform bridging the Municipal Corporation of Delhi (MCD) and regional farmers. <br/>
  We transform kitchen waste into affordable organic compost, simultaneously tackling the urban landfill crisis and agricultural input costs.
</p>

[Explore Live Demo](#) • [Report Bug](https://github.com/amanrock1/Argicycle/issues) • [Request Feature](https://github.com/amanrock1/Argicycle/issues)

</div>

---

## 📸 Platform Sneak Peek

> **Design Tip:** *Replace these placeholders with high-resolution, uncropped screenshots of the application running in production.*

<div align="center">
  <img src="https://via.placeholder.com/900x450/0f172a/4ade80?text=Dashboard+Interface+Screenshot" alt="MCD Dashboard" width="100%" style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"/>
  <p><i>The MCD Command Center — tracking segregation efficiency, compost production, and carbon offset in real-time.</i></p>
</div>

<br/>

<div align="center">
  <img src="https://via.placeholder.com/900x450/0f172a/60a5fa?text=Farmer+Ordering+Portal+Screenshot" alt="Farmer Portal" width="100%" style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"/>
  <p><i>Farmer Interface — accessible ordering, real-time compost inventory, and predictive crop advisory.</i></p>
</div>

---

## ✨ Core Features

<table width="100%">
  <tr>
    <td width="50%" valign="top">
      <h3>🌾 For Farmers</h3>
      <ul>
        <li><b>Smart Irrigation Alerts:</b> Hyper-local forecasts delivered via IVR and WhatsApp to optimize water usage.</li>
        <li><b>Affordable Compost Access:</b> High-grade organic compost sourced from city waste at ₹4/kg (vs ₹9 for urea).</li>
        <li><b>Bumper Harvest Advisory:</b> Crop-specific application schedules based on soil health and climate data.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>🏙️ For Municipalities (MCD)</h3>
      <ul>
        <li><b>Zero-Hardware Tracking:</b> Mobile-first forms log collection metrics per ward without expensive GPS systems.</li>
        <li><b>Segregation Monitoring:</b> Track wet vs. dry waste ratios to spot neglecting wards and enforce policy.</li>
        <li><b>Unified Impact Dashboard:</b> Real-time analytics on landfill diversion and audited carbon credit tracking.</li>
      </ul>
    </td>
  </tr>
</table>

### 🔄 The Matchmaking Engine
Our predictive algorithms match regional farm cropping cycles and fertilizer demand with MCD compost inventory levels, preventing stockouts during critical sowing seasons.

---

## 🏗️ System Architecture

Agricycle connects municipal waste data directly to farmer supply chains through a decoupled architecture. 

```mermaid
graph TD
    %% Node Styling
    classDef frontend fill:#1e293b,stroke:#4ade80,stroke-width:2px,color:#fff,rx:5px,ry:5px;
    classDef backend fill:#1e293b,stroke:#60a5fa,stroke-width:2px,color:#fff,rx:5px,ry:5px;
    classDef database fill:#0f172a,stroke:#eab308,stroke-width:2px,color:#fff,rx:5px,ry:5px;
    classDef external fill:#334155,stroke:#94a3b8,stroke-width:1px,color:#fff,stroke-dasharray: 5 5,rx:5px,ry:5px;

    %% Client Layer
    subgraph Client [Frontend Layer - React + Vite]
        A[MCD Dashboard UI]:::frontend
        B[Farmer Portal UI]:::frontend
        C[Landing & Public Stats]:::frontend
    end

    %% Service Layer
    subgraph API [Service Layer - Node.js + Express]
        D[API Gateway]:::backend
        E[Matchmaking Engine]:::backend
        F[Impact Calculator]:::backend
    end

    %% Data Layer
    subgraph DB [Data Persistence]
        G[(Firebase Auth/Admin)]:::database
        H[(Realtime DB/JSON Store)]:::database
    end

    %% External Services
    subgraph External [External Integrations]
        I[Meteorological APIs]:::external
        J[WhatsApp/IVR Service]:::external
    end

    %% Connections
    A & B & C -->|REST API calls| D
    D <--> E
    D <--> F
    D -->|Authenticates & Syncs| G
    E & F -->|Reads/Writes| H
    E -->|Fetches Weather| I
    E -->|Triggers Alerts| J
    J -.->|Push Notifications| B
```

---

## 🚀 Getting Started

Follow these instructions to set up Agricycle locally for development and testing.

### Prerequisites
- Node.js (`v18.x` or higher recommended)
- npm (`v9.x` or higher)
- Firebase Admin credentials (`firebase-credentials.json`)

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/amanrock1/Argicycle.git
   cd Argicycle
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**  
   Create a `.env` file in the root directory:
   ```env
   # API & Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database/Firebase Config
   # Ensure your firebase-credentials.json is placed in the project root
   ```

4. **Launch the Application**  
   The project uses `concurrently` to run both the Node backend and Vite frontend simultaneously:
   ```bash
   npm run dev
   ```

5. **Access the platform**  
   - Frontend UI: [http://localhost:5173](http://localhost:5173)  
   - Backend API: [http://localhost:3000](http://localhost:3000)

---

## 🗺️ Product Roadmap

- [x] **Phase 1: Minimum Viable Product** — Core landing page, static dashboard, and basic UI flow.
- [x] **Phase 2: Data Integration** — Firebase connectivity, API routing, and live metrics calculations.
- [ ] **Phase 3: Alert Infrastructure** — Automated WhatsApp and IVR integrations for weather/irrigation advisories.
- [ ] **Phase 4: Advanced Matchmaking** — Machine learning pipeline for predicting farm cycles and compost demand.
- [ ] **Phase 5: Field Mobile App** — Dedicated progressive web app (PWA) for sanitation workers logging data offline.

---

## 🤝 Contributing

We welcome contributions from the community to help make Agricycle more robust and impactful. 

1. **Fork** the repository.
2. **Create a branch:** `git checkout -b feature/your-feature-name`
3. **Commit your changes:** `git commit -m 'feat: Add some amazing feature'`
4. **Push to the branch:** `git push origin feature/your-feature-name`
5. **Open a Pull Request.**

*Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting.*

---

## 👨‍💻 Author

- **Name:** Aman Kumar Prabhat
- **GitHub:** [amanrock1/aman_portfolio](https://github.com/amanrock1/aman_portfolio)
- **LinkedIn:** [Aman Prabhat](https://www.linkedin.com/in/aman-prabhat-b75735325/)
- **Portfolio:** [amankumarprabhat.vercel.app](https://amankumarprabhat.vercel.app/)

---

<div align="center">
  <b>Built with ❤️ to fuel a greener, sustainable future.</b><br>
  <sub>Agricycle Initiative &copy; 2026</sub>
</div>
