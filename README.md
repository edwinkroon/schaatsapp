# Schaatsapp

Vite React TypeScript project met TailwindCSS, shadcn/ui en Recharts voor schaatsdata visualisatie.

## Structuur

```
src/
├── components/
│   ├── ui/           # shadcn: button, tabs, input, card
│   └── dashboard/    # Sidebar, Header, ChartTabs, Dashboard
├── lib/
│   ├── data.ts       # PapaParse + mock schaatsdata
│   └── utils.ts      # cn() helper
├── hooks/
│   └── useSchaatsData.ts  # Custom hook voor state
├── App.tsx
├── main.tsx
└── index.css
```

## Features

- **Mock data**: 100 laps voor transponder FZ-62579 (lap_time, baan, datum, snelheid)
- **Dark mode**: Toggle in header, persistent via localStorage
- **Charts**: Lap tijd, snelheid (lijn), snelheid (bar) via Recharts
- **CSV**: Import via plakken, export naar bestand

## Starten

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployen (voor anderen)

De app kan gratis worden gehost op **Vercel** of **Netlify**. De API-proxy naar vinksite.com is al geconfigureerd.

### Optie 1: Vercel (aanbevolen)

1. Push de code naar [GitHub](https://github.com)
2. Ga naar [vercel.com](https://vercel.com) en log in met GitHub
3. Klik "Add New Project" en kies je repository
4. Vercel herkent Vite automatisch – klik "Deploy"
5. De app krijgt een URL zoals `schaatsapp-xxx.vercel.app`

### Optie 2: Netlify

1. Push de code naar GitHub
2. Ga naar [netlify.com](https://netlify.com) en log in
3. "Add new site" → "Import an existing project" → kies GitHub
4. Build command: `npm run build`, Publish directory: `dist`
5. Deploy – de app krijgt een URL zoals `xxx.netlify.app`

### Eigen domein

Bij Vercel en Netlify kun je in de instellingen een eigen domein koppelen (bijv. `schaatsapp.jouwdomein.nl`).
