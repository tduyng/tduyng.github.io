+++
title = "[Gozzi] Native mermaid support"
date = 2025-11-23
template = "note.html"
generate_feed = true
aliases = ["/notes/mermaid", "/notes/diagram-support"]

[extra]
comment = true
copy = true
mermaid = true
+++

# [Gozzi] Native mermaid support

Gozzi now has native Mermaid diagram support! Let's test various diagram types.

## Flowchart

A simple flowchart showing decision logic:

```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> A
    C --> E[End]
```

## Sequence Diagram

Showing interaction between components:

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Database

    Client->>Server: HTTP Request
    Server->>Database: Query Data
    Database-->>Server: Return Results
    Server-->>Client: JSON Response
```

## Gantt Chart

Project timeline visualization:

```mermaid
gantt
    title Gozzi Development Roadmap
    dateFormat  YYYY-MM-DD
    section Phase 1
    KaTeX Integration       :done, 2025-11-20, 2d
    Mermaid Integration     :done, 2025-11-22, 1d
    section Phase 2
    Shortcodes              :active, 2025-11-25, 5d
    Image Processing        :2025-12-01, 7d
    section Phase 3
    Data Files              :2025-12-10, 3d
    Asset Pipeline          :2025-12-15, 5d
```

## Class Diagram

Object-oriented structure:

```mermaid
classDiagram
    class ContentParser {
        +Site config.Site
        +ContentMap map
        +Tags map
        +Parse() error
    }

    class Node {
        +Path string
        +Content HTML
        +ToMap() map
    }

    class Builder {
        +Build() error
        +Serve() error
    }

    ContentParser --> Node
    Builder --> ContentParser
```

## State Diagram

Application state management:

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Building: gozzi build
    Building --> Success: Build Complete
    Building --> Error: Build Failed
    Success --> [*]
    Error --> Idle: Fix Issues
    Idle --> Serving: gozzi serve
    Serving --> Watching: File Changed
    Watching --> Building
    Serving --> [*]: Ctrl+C
```

## Pie Chart

Usage statistics:

```mermaid
pie title "Gozzi Feature Usage"
    "Markdown Rendering" : 40
    "Template Functions" : 25
    "Live Reload" : 20
    "SEO Features" : 10
    "Math & Diagrams" : 5
```

## Entity Relationship Diagram

Database schema:

```mermaid
erDiagram
    SITE ||--o{ SECTION : contains
    SECTION ||--o{ PAGE : contains
    PAGE ||--o{ TAG : has
    PAGE {
        string path
        string title
        date published
        html content
    }
    TAG {
        string name
        int count
    }
```

## Mixed Content

You can mix diagrams with regular text and other features. For example, the complexity of our build process can be expressed as $O(n)$ where $n$ is the number of pages.

```mermaid
graph LR
    Markdown --> Parser
    Parser --> Goldmark
    Goldmark --> HTML
    HTML --> Builder
    Builder --> Output
```

And that's it! All diagrams render beautifully with MermaidJS.
