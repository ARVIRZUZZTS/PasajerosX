# Dashboard Sidebar (side_bar_2)

Dashboard con sidebar colapsable, navegación principal, toggle de tema oscuro/claro, indicadores de notificaciones y panel de contenido con estadísticas.

## Descripción

Componente de dashboard con sidebar colapsable que incluye:
- Navbar con logo Winkode y badge "Sidebar"
- Sidebar con navegación principal (Dashboard, Sales, View Site, Products, Tags, Analytics, Members)
- Sección de cuenta (Settings, Help & Support)
- Toggle de tema oscuro/claro
- Badges de notificaciones (Sales: 3, Members: 12)
- Panel de contenido con estadísticas, actividad reciente y métricas
- Colapsar/expandir sidebar con animación (256px ↔ 64px)

## Tecnología Original

- **Framework:** React 18+
- **Estilos:** Tailwind CSS
- **Iconos:** lucide-react
- **Lenguaje:** TypeScript

## Adaptación Actual

- **HTML5** - Estructura del dashboard
- **CSS3** - Estilos con variables, transiciones y diseño responsive
- **JavaScript (Vanilla)** - Lógica de interactividad sin dependencias
- **SVG Inline** - Iconos equivalentes a lucide-react

## Cambios Necesarios para Adaptar a React

### Componentes

```tsx
// Estructura de componentes React
App
├── Navbar
│   ├── Logo
│   └── Badge
├── Sidebar
│   ├── TitleSection
│   ├── NavMain
│   │   └── NavOption (x7)
│   ├── AccountSection
│   │   └── NavOption (x2)
│   └── ToggleClose
└── MainContent
    ├── Header
    │   ├── HeaderText
    │   └── HeaderActions
    ├── StatsGrid
    │   └── StatCard (x4)
    └── ContentGrid
        ├── ActivityPanel
        │   └── ActivityItem (x5)
        └── SidePanels
            ├── QuickStatsPanel
            └── TopProductsPanel
```

### Dependencias

```bash
npm install lucide-react
```

### Props

```tsx
interface SidebarProps {
  open: boolean;
  selected: string;
  onToggle: () => void;
  onSelect: (option: string) => void;
}

interface NavOptionProps {
  icon: LucideIcon;
  title: string;
  selected: string;
  onSelect: (title: string) => void;
  open: boolean;
  notifs?: number;
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  change: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

interface ActivityItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  color: 'green' | 'blue' | 'purple' | 'orange' | 'red';
}
```

### Estado

```tsx
const [isDark, setIsDark] = useState(false);
const [open, setOpen] = useState(true);
const [selected, setSelected] = useState("Dashboard");
const [notifCount, setNotifCount] = useState(3);
```

### Estructura de Archivos React

```
src/components/ui/side_bar_2/
├── index.tsx              # Componente principal
├── sidebar.tsx            # Sidebar colapsable
├── nav-option.tsx         # Opción de navegación
├── stats-grid.tsx         # Grid de estadísticas
├── activity-panel.tsx     # Panel de actividad
├── quick-stats.tsx        # Estadísticas rápidas
├── top-products.tsx        # Productos top
└── types.ts               # Tipos TypeScript
```

## Uso

Abrir `index.html` en un navegador para ver el componente en funcionamiento.
