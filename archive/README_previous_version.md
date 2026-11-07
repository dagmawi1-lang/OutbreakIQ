# OutbreakIQ 🧬
### AI-Assisted Public Health Surveillance & Disease Trend Analysis

**Turning public health data into accessible intelligence.**

OutbreakIQ is an AI-assisted public health surveillance platform designed to help users explore infectious disease reporting patterns, identify unusual statistical changes, and better understand public health trends through interactive data visualization and analysis.

Developed for **DSH Hacks V2 – AI x Healthcare**.

---

## 🌍 Project Overview

Public health organizations collect enormous amounts of disease-related information. However, exploring this information, identifying unusual reporting patterns, and communicating findings can be challenging.

OutbreakIQ aims to simplify this process by combining public health datasets, statistical anomaly detection, geographic visualization, and AI-assisted explanations into one interactive platform.

Rather than simply displaying statistics, OutbreakIQ helps users investigate what the data shows and understand why certain observations may deserve additional attention.

## ✨ Key Features

### 📊 Interactive Intelligence Dashboard
- Explore infectious disease reporting statistics.
- View historical reporting trends.
- Filter observations by disease and geographic area.
- Review detected statistical anomalies.

### 🗺️ Geographic Disease Surveillance
- Explore geographic disease-reporting patterns.
- Visualize reporting differences across locations.
- Investigate regional trends.

### 🧠 Statistical Anomaly Detection
- Analyze historical reporting patterns.
- Calculate rolling statistical baselines.
- Identify unusually high observations.
- Generate anomaly scores for further investigation.

### 🤖 AI-Assisted Explanations
- Explain unusual statistical observations.
- Summarize available reporting information.
- Help users interpret historical patterns.
- Provide context about data limitations.

### 📁 Data Management
- Retrieve public health reporting data.
- Import CSV datasets.
- Export observations for additional analysis.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React | Frontend interface |
| Vite | Development environment |
| JavaScript | Application logic |
| Node.js | Backend runtime |
| Express.js | API development |
| Python | Planned advanced data analysis |
| Statistical Analysis | Anomaly detection |
| Leaflet | Geographic visualization |
| Git & GitHub | Version control |

## 🏗️ Project Structure

```text
OutbreakIQ/
│
├── src/
│   ├── components/
│   ├── data/
│   ├── App.jsx
│   └── main.jsx
│
├── server/
│   ├── server.js
│   ├── analysis.js
│   └── server.test.js
│
├── docs/
│
├── public/
│
├── package.json
├── vite.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm
- Git

### Installation

Clone the repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Navigate into the project:

```bash
cd OutbreakIQ
```

Install dependencies:

```bash
npm install
```

Start the development environment:

```bash
npm run dev
```

Follow the terminal instructions to open the application in your browser.

### Backend

Navigate into the server directory if it has a separate package configuration, install its dependencies, and follow the server startup instructions in the project documentation.

## 📚 Data Sources

OutbreakIQ is designed to work with publicly available public health information.

Primary intended source:

- [CDC National Notifiable Diseases Surveillance System (NNDSS)](https://data.cdc.gov/d/x9gk-5huc)

Additional potential sources:

- [Centers for Disease Control and Prevention](https://www.cdc.gov/)
- [World Health Organization](https://www.who.int/)
- [WHO Global Health Observatory](https://www.who.int/data/gho)

Data availability, reporting periods, and geographic coverage may vary.

## 🔬 How Anomaly Detection Works

OutbreakIQ uses historical observations to establish a statistical baseline.

The current screening approach uses rolling averages and standard deviations to identify observations that differ substantially from historical patterns.

An anomaly is a statistical signal, not proof of an outbreak.

Future development may incorporate more advanced machine learning techniques and additional historical datasets.

## 🔒 Responsible AI & Data Limitations

OutbreakIQ is an exploratory public health data analysis platform.

It is not intended to:

- Diagnose medical conditions.
- Replace healthcare professionals.
- Confirm disease outbreaks.
- Provide emergency medical guidance.
- Predict individual patient outcomes.

Public health reporting data can be provisional, incomplete, or subject to revision. All detected anomalies should be independently reviewed before drawing conclusions.

Synthetic demonstration data, where used, should not be interpreted as actual reported disease cases.

## 🛣️ Future Development

Planned improvements include:

- Expanded international disease surveillance.
- Advanced machine learning models.
- Improved geographic intelligence.
- Historical anomaly comparisons.
- More sophisticated trend analysis.
- Enhanced AI-powered research assistance.
- Additional public health data integrations.

## 🎯 Competition

**DSH Hacks V2**

Theme: AI x Healthcare

OutbreakIQ was developed to explore how artificial intelligence, data science, and software engineering can contribute to making public health information more accessible and understandable.

## 👨‍💻 Developer

Independently developed as a student engineering project.

## 📄 License

Released under the MIT License. See [LICENSE](LICENSE) for details.

---

**OutbreakIQ — Making public health data easier to explore, understand, and investigate.**
