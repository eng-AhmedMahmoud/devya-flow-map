import { Mermaid } from './mermaid';

export function SystemMap() {
  const chart = `
flowchart LR
  subgraph Users[" "]
    direction TB
    M[Marketing Team]
    A[Ops Admin]
    C[Website Visitor]
    B[Booking Customer]
  end

  subgraph Apps[" "]
    direction TB
    DASH["Admin Dashboard<br/>admin.devya-solutions.com"]
    SITE["Marketing Site<br/>www.devya.dev"]
    BOOK["Booking App<br/>booking.devya-solutions.com"]
  end

  subgraph Platform[" "]
    direction TB
    API["NestJS API<br/>api.devya-solutions.com"]
    DB[("Postgres<br/>devya-postgres")]
    CF["Cloudflare Images<br/>imagedelivery.net"]
  end

  M -- "CMS edits" --> DASH
  A -- "Bookings" --> DASH
  C -- "Reads pages" --> SITE
  B -- "Book a slot" --> BOOK

  DASH -- "JWT cookie<br/>/api/admin/*" --> API
  SITE -. "ISR 60s<br/>/api/public/*" .-> API
  BOOK -- "/api/calendars<br/>/api/bookings" --> API

  API <--> DB
  DASH -- "Upload" --> API
  API -- "POST images/v1" --> CF
  SITE -. "next/image" .-> CF

  classDef user fill:#1c1c1c,stroke:#6b6b6b,color:#e5e5e5
  classDef app fill:#121212,stroke:#3a3a3a,color:#ffffff
  classDef plat fill:#0f1f1a,stroke:#10b981,color:#a7f3d0
  classDef store fill:#1a0f1f,stroke:#a855f7,color:#e9d5ff

  class M,A,C,B user
  class DASH,SITE,BOOK app
  class API plat
  class DB,CF store
`;
  return <Mermaid chart={chart} id="system" />;
}

export function MarketingFlow() {
  const chart = `
sequenceDiagram
  autonumber
  participant T as Marketing Team
  participant D as Admin Dashboard
  participant API as NestJS API
  participant CF as Cloudflare Images
  participant DB as Postgres
  participant S as Marketing Site

  T->>D: 1. Sign in (admin.devya-solutions.com/login)
  D->>API: POST /api/auth/login
  API-->>D: Set-Cookie devya_session (JWT)
  T->>D: 2. Open /cms/projects → "New"
  T->>D: Upload hero image
  D->>API: POST /api/admin/uploads
  API->>CF: POST /accounts/{id}/images/v1
  CF-->>API: { id, variants[/public] }
  API-->>D: { url, publicId }
  T->>D: 3. Fill fields → Save
  D->>API: POST /api/admin/projects
  API->>DB: INSERT Project (published=true)
  Note over S,API: ISR revalidates every 60s
  S->>API: GET /api/public/projects (next visit)
  API->>DB: SELECT WHERE published
  DB-->>API: rows
  API-->>S: { items: [...] }
  S-->>T: 4. Page renders new project
`;
  return <Mermaid chart={chart} id="marketing-flow" />;
}

export function BookingFlow() {
  const chart = `
sequenceDiagram
  autonumber
  participant C as Booking Customer
  participant B as Booking App
  participant API as NestJS API
  participant DB as Postgres
  participant A as Ops Admin
  participant D as Admin Dashboard

  C->>B: 1. Open booking.devya-solutions.com
  B->>API: GET /api/calendars
  API-->>B: 3 calendars (marketing, dev, business)
  C->>B: 2. Pick calendar + date
  B->>API: GET /api/availability?calendarSlug&date
  API->>DB: existing Bookings for that slot
  API-->>B: { slots: [{time, available}] }
  C->>B: 3. Pick slot + fill form
  B->>API: POST /api/bookings
  API->>DB: INSERT Booking PENDING
  API-->>B: { id, scheduledAt }
  B-->>C: 4. Confirmation page
  Note over A,D: Async — admin reviews later
  A->>D: 5. Open /bookings
  D->>API: GET /api/admin/bookings (JWT)
  API-->>D: list
  A->>D: 6. Mark CONFIRMED / add notes
  D->>API: PATCH /api/admin/bookings/:id
  API->>DB: UPDATE status
`;
  return <Mermaid chart={chart} id="booking-flow" />;
}
