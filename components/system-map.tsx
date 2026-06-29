import { Mermaid } from './mermaid';

/**
 * High-level map: which department owns which app, and how the four apps
 * pass information between each other. Tuned for non-technical readers —
 * swimlane per department, plain-language arrow labels.
 */
export function SystemMap() {
  const chart = `
flowchart LR
  subgraph CLIENT["👤 CLIENT"]
    direction TB
    VISITOR[Visits website]
    CL_BOOK[Books a call]
    CL_PORTAL[Signs contract<br/>by email]
  end

  subgraph SALES["💼 SALES"]
    direction TB
    SAL_REVIEW[Reviews booking<br/>requests]
    SAL_CONTRACT[Drafts &amp; sends<br/>contract]
  end

  subgraph DELIVERY["🛠 DELIVERY"]
    direction TB
    DEL_MEET[Runs the meeting]
    DEL_TASKS[Tracks work<br/>in Tasks app]
  end

  subgraph ADMIN["🗂 ADMIN / OPS"]
    direction TB
    OPS_CMS[Edits website<br/>content]
    OPS_BOARD[Watches every<br/>booking &amp; contract]
  end

  subgraph PLATFORM["⚙️ PLATFORM"]
    direction TB
    SITE["🌐 Marketing site<br/>devya.dev"]
    BOOK["📅 Booking app<br/>booking.devya-solutions.com"]
    TASKS["✅ Tasks app<br/>tasks.devya-solutions.com"]
    CON["📝 Contracts app<br/>contracts.devya-solutions.com"]
    DASH["🗂 Admin dashboard<br/>admin.devya-solutions.com"]
    DATA[("💾 Shared database<br/>one source of truth")]
  end

  VISITOR ==> SITE
  CL_BOOK ==> BOOK
  CL_PORTAL ==> CON
  SAL_REVIEW ==> TASKS
  SAL_CONTRACT ==> CON
  DEL_MEET ==> TASKS
  DEL_TASKS ==> TASKS
  OPS_CMS ==> DASH
  OPS_BOARD ==> DASH

  SITE -. content -.-> DATA
  BOOK <==> DATA
  TASKS <==> DATA
  CON <==> DATA
  DASH <==> DATA

  classDef lane fill:#0d0d0d,stroke:#2a2a2a,color:#f5f5f5,stroke-width:1.5px
  classDef step fill:#1a1a1a,stroke:#3a3a3a,color:#f5f5f5,stroke-width:1.5px,rx:10,ry:10
  classDef app fill:#102018,stroke:#34d399,color:#a7f3d0,stroke-width:2px,rx:12,ry:12
  classDef store fill:#1a0f1f,stroke:#a855f7,color:#e9d5ff,stroke-width:2px

  class VISITOR,CL_BOOK,CL_PORTAL,SAL_REVIEW,SAL_CONTRACT,DEL_MEET,DEL_TASKS,OPS_CMS,OPS_BOARD step
  class SITE,BOOK,TASKS,CON,DASH app
  class DATA store

  linkStyle default stroke:#9a9a9a,stroke-width:1.8px
`;
  return <Mermaid chart={chart} id="system" fontSize={20} />;
}

/**
 * Plain-language journey: prospect lands on the website, books a call,
 * meeting becomes a task, sales sends a contract, client signs.
 * Replaces endpoint-noise with verbs everyone understands.
 */
export function EndToEndFlow() {
  const chart = `
flowchart TB
  subgraph CLIENT_LANE["👤 CLIENT"]
    direction LR
    A1[Visits<br/>marketing site]
    A2[Books a call]
    A3[Waits for<br/>confirmation email]
    A4[Joins the meeting]
    A5[Receives signing<br/>email]
    A6[Signs in browser]
  end

  subgraph TEAM_LANE["💼 SALES / DELIVERY"]
    direction LR
    B1[Sees new request<br/>in Tasks app bar]
    B2{Time works<br/>for us?}
    B3[Accept<br/>→ Meeting task created]
    B4[Propose<br/>other times]
    B5[Runs meeting]
    B6[Drafts contract<br/>from template]
    B7[Sends e-sign link]
    B8[Sees SIGNED<br/>in Admin dashboard]
  end

  A1 ==> A2 ==> A3
  A2 -. emails .-> B1
  B1 ==> B2
  B2 -- "✅ yes" --> B3
  B2 -- "↺ propose" --> B4
  B4 -. emails alternatives .-> A3
  B3 -. confirmation email .-> A3
  A3 ==> A4
  B3 ==> B5
  A4 -.-> B5
  B5 ==> B6 ==> B7
  B7 -. emails .-> A5
  A5 ==> A6
  A6 -. notify .-> B8

  classDef client fill:#0f1a2a,stroke:#60a5fa,color:#dbeafe,stroke-width:2px,rx:12,ry:12
  classDef team fill:#0f1f1a,stroke:#34d399,color:#bbf7d0,stroke-width:2px,rx:12,ry:12
  classDef decision fill:#231a0a,stroke:#fbbf24,color:#fde68a,stroke-width:2px

  class A1,A2,A3,A4,A5,A6 client
  class B1,B3,B4,B5,B6,B7,B8 team
  class B2 decision

  linkStyle default stroke:#9a9a9a,stroke-width:2px
`;
  return <Mermaid chart={chart} id="end-to-end" fontSize={19} />;
}

/**
 * Contract life-cycle with status pills. Mirrors backend ContractStatus
 * enum (DRAFT → SENT → VIEWED → SIGNED) so anyone reading this matches
 * what Admin sees in the Contracts table.
 */
export function ContractsFlow() {
  const chart = `
flowchart LR
  subgraph SALES_LANE["💼 SALES"]
    S1[Open Contracts app]
    S2[Pick template<br/>NDA / Project / Retainer]
    S3[Fill client + scope<br/>+ price]
    S4[Click <b>Send</b>]
  end

  subgraph SYSTEM_LANE["⚙️ SYSTEM"]
    Y1((DRAFT))
    Y2((SENT))
    Y3((VIEWED))
    Y4((SIGNED))
    Y5((DECLINED))
    Y6[PDF + signed HTML<br/>kept on server]
  end

  subgraph CLIENT_LANE["👤 CLIENT"]
    C1[Receives email<br/>with sign link]
    C2[Opens link<br/>views contract]
    C3{Action?}
    C4[Types name<br/>+ draws signature]
    C5[Replies<br/>with concerns]
  end

  subgraph ADMIN_LANE["🗂 ADMIN"]
    AD1[Sees row in<br/>Contracts dashboard]
    AD2[Status badge<br/>updates live]
    AD3[Downloads signed PDF]
  end

  S1 ==> S2 ==> S3 ==> S4
  S4 ==> Y1 ==> Y2
  Y2 -. email .-> C1
  C1 ==> C2 ==> Y3
  Y3 ==> C3
  C3 -- "sign" --> C4 ==> Y4
  C3 -- "decline" --> C5 ==> Y5
  Y4 ==> Y6
  Y1 -.-> AD1
  Y2 -.-> AD1
  Y3 -.-> AD2
  Y4 -.-> AD2
  Y5 -.-> AD2
  Y6 -.-> AD3

  classDef sales fill:#0f1f1a,stroke:#34d399,color:#bbf7d0,stroke-width:2px,rx:12,ry:12
  classDef client fill:#0f1a2a,stroke:#60a5fa,color:#dbeafe,stroke-width:2px,rx:12,ry:12
  classDef admin fill:#1a0f1f,stroke:#a855f7,color:#e9d5ff,stroke-width:2px,rx:12,ry:12
  classDef status fill:#161616,stroke:#9a9a9a,color:#f5f5f5,stroke-width:2px
  classDef decision fill:#231a0a,stroke:#fbbf24,color:#fde68a,stroke-width:2px
  classDef signed fill:#0f1f1a,stroke:#34d399,color:#a7f3d0,stroke-width:3px
  classDef declined fill:#2a1010,stroke:#f87171,color:#fecaca,stroke-width:2px

  class S1,S2,S3,S4 sales
  class C1,C2,C4,C5 client
  class AD1,AD2,AD3 admin
  class Y1,Y2,Y3,Y6 status
  class Y4 signed
  class Y5 declined
  class C3 decision

  linkStyle default stroke:#9a9a9a,stroke-width:2px
`;
  return <Mermaid chart={chart} id="contracts-flow" fontSize={19} />;
}

/**
 * Booking journey, plain-language version. Drops endpoint paths; surfaces
 * the team-side Meeting Requests bar + auto Meeting-task creation.
 */
export function BookingFlow() {
  const chart = `
flowchart LR
  subgraph CLIENT_LANE["👤 CLIENT"]
    C1[Opens Booking app]
    C2[Picks team<br/>+ free slot]
    C3[Submits request]
    C4[Reads pending<br/>email]
    C5{Final time}
    C6[Joins meeting]
  end

  subgraph TEAM_LANE["💼 TEAM"]
    T1[Sees request in<br/><b>Meeting Requests</b> bar]
    T2{Accept or<br/>propose?}
    T3[Accept time]
    T4[Propose<br/>1–10 times]
    T5[Meeting task<br/>auto-created<br/>important + urgency]
  end

  C1 ==> C2 ==> C3 ==> C4
  C3 -. emails .-> T1
  T1 ==> T2
  T2 -- "accept" --> T3
  T2 -- "propose" --> T4
  T3 -. confirmation email .-> C5
  T4 -. options email .-> C5
  C5 -- "client picks" --> T5
  T3 ==> T5
  T5 ==> C6

  classDef client fill:#0f1a2a,stroke:#60a5fa,color:#dbeafe,stroke-width:2px,rx:12,ry:12
  classDef team fill:#0f1f1a,stroke:#34d399,color:#bbf7d0,stroke-width:2px,rx:12,ry:12
  classDef decision fill:#231a0a,stroke:#fbbf24,color:#fde68a,stroke-width:2px

  class C1,C2,C3,C4,C6 client
  class T1,T3,T4,T5 team
  class C5,T2 decision

  linkStyle default stroke:#9a9a9a,stroke-width:2px
`;
  return <Mermaid chart={chart} id="booking-flow" fontSize={19} />;
}

/**
 * Marketing flow stays — minor restyle for type-size + colour parity.
 */
export function MarketingFlow() {
  const chart = `
flowchart LR
  subgraph MARKETING["💼 MARKETING"]
    M1[Signs in to<br/>Admin dashboard]
    M2[Opens CMS section]
    M3[Edits or adds entry]
    M4[Uploads images]
    M5[Hits Save]
  end

  subgraph SYSTEM["⚙️ SYSTEM"]
    S1[Saved in database]
    S2[Images stored on<br/>Cloudflare]
    S3[Public site refreshes<br/>within 60s]
  end

  subgraph VISITOR["👤 VISITOR"]
    V1[Sees updated<br/>page on devya.dev]
  end

  M1 ==> M2 ==> M3 ==> M4 ==> M5
  M5 ==> S1
  M4 -.-> S2
  S1 ==> S3
  S2 -.-> S3
  S3 ==> V1

  classDef team fill:#0f1f1a,stroke:#34d399,color:#bbf7d0,stroke-width:2px,rx:12,ry:12
  classDef sys fill:#161616,stroke:#9a9a9a,color:#f5f5f5,stroke-width:2px,rx:10,ry:10
  classDef visitor fill:#0f1a2a,stroke:#60a5fa,color:#dbeafe,stroke-width:2px,rx:12,ry:12

  class M1,M2,M3,M4,M5 team
  class S1,S2,S3 sys
  class V1 visitor

  linkStyle default stroke:#9a9a9a,stroke-width:2px
`;
  return <Mermaid chart={chart} id="marketing-flow" fontSize={19} />;
}
