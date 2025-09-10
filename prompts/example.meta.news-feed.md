# Design a Facebook News Feed ML System

Goal: Propose architecture and ML components for ranking the News Feed.

Context:
- Users: billions, diverse network graphs
- Signals: clicks, likes, comments, shares, dwell time
- Constraints: freshness, diversity, fairness, latency < 200ms p95

Tasks:
1) Problem framing and objective function
2) Data sources and feature store schema
3) Candidate generation, ranking, re-ranking
4) Online serving and caching strategy
5) Feedback loop, labeling, and training schedule
6) Metrics (online/offline) and guardrails

Deliverable:
- High-level diagram
- Component list with APIs
- Storage choices and scaling plan
- Risks and trade-offs

Parameters:
- region: string
- user_segment: string


