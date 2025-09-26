# Design a News Feed ML Ranking System – Meta

## Scale and Product Context
- 2.9 billion monthly active users and 1.8 billion daily active users.
- Volume: 4.75 billion posts per day with 100+ billion content interactions daily.
- Latency: sub-200 ms p95 response time for feed generation.
- Throughput: 10,000+ requests per second during peak hours.

## Key ML Challenges and Technical Requirements
- **Real-time ranking:** Process millions of posts in milliseconds.
- **Personalization:** Capture individual user preferences and behavioral signals.
- **Content diversity:** Balance relevance with variety across content types and sources.
- **Cold start:** Support new users and new content with limited history.
- **Multi-objective optimization:** Optimize for engagement, diversity, and safety simultaneously.

## Interview Discussion Flow and Deep-Dive Topics
1. Problem formulation (10 minutes).
2. Data strategy and feature engineering (15 minutes).
3. Model architecture and training (20 minutes).
4. Serving and optimization (10 minutes).
5. Advanced topics and edge cases (5 minutes).

## Mathematical Formulation
\[
\text{Score}(u, p) = f(\theta, x_u, x_p, x_c, x_t)
\]
Where:
- \(u\): user features
- \(p\): post features
- \(c\): context features
- \(t\): temporal features
- \(\theta\): model parameters

## ML Success Metrics and Evaluation Criteria
- **Primary:** Time spent on platform, daily active users.
- **Secondary:** Click-through rate, like rate, share rate, comment rate.
- **Diversity:** Distribution across content types and sources.
- **Safety:** Harmful content detection rate.

## Scale Requirements and System Constraints
- **User scale:** 2.9B monthly users, 1.8B daily users.
- **Content scale:** Billions of posts and interactions across modalities.
- **Core pipeline components:**
  1. Feature retrieval – real-time lookup from feature stores.
  2. Preprocessing – normalization and transformation of features.
  3. Inference – model scoring for personalized ranking.
  4. Performance tuning – balancing inference latency and accuracy.
- **Model trade-offs:**
  - Simple models: fast inference, easier to interpret.
  - Complex models: higher accuracy, slower inference.
  - Balance accuracy and efficiency based on latency budgets.

## Learning Strategy Trade-offs
- **Online learning:** Real-time updates and adaptation to behavioral shifts.
- **Batch learning:** Stable training cycles with better convergence.
- **Trade-off:** Adaptability versus stability.
- **Accuracy versus diversity:**
  - High accuracy maximizes immediate relevance and satisfaction.
  - High diversity promotes exploration and long-term engagement.
  - Trade-off between relevance and exploration.

## Advanced Follow-up Questions and Technical Challenges
### Algorithm Questions
- How would you handle the cold start problem for new users?
- What is the computational complexity of your ranking algorithm?
- How would you implement online learning for your model?

### System Questions
- How would you handle model serving at scale?
- What is your strategy for A/B testing ML models?
- How would you detect and handle model drift?

### Research Questions
- How would you incorporate recent research in transformers?
- What is your approach to multi-modal learning?
- How would you implement causal inference in ranking?

### Exploration and Bandits
1. Design a multi-armed bandit algorithm for content recommendation.
2. How would you implement Thompson sampling for exploration–exploitation?
3. What is the difference between collaborative filtering and content-based filtering?
4. How would you handle the curse of dimensionality in feature engineering?

### Mathematical Questions
1. Derive the gradient of a neural network with respect to its parameters.
2. Explain the mathematical foundation of attention mechanisms.
3. How would you prove the convergence of stochastic gradient descent?
4. What is the relationship between regularization and the bias–variance trade-off?

### System Design Questions
1. Design a distributed training system for large-scale neural networks.
2. How would you implement model versioning and rollback?
3. Design a real-time feature store for ML systems.
4. How would you handle model serving with zero downtime?

### Complex System Design Follow-ups
- **Scalability:**
  1. How would you scale the system to handle 10× more users?
  2. What is your strategy for handling peak traffic?
  3. How would you optimize for different geographic regions?
- **Performance:**
  1. How would you reduce inference latency by 50%?
  2. What is your strategy for memory optimization?
  3. How would you handle model serving on mobile devices?
- **Reliability:**
  1. How would you ensure 99.9% uptime for your ML system?
  2. What is your disaster recovery strategy?
  3. How would you handle data corruption in production?

## Evaluation Focus Areas
1. **Technical depth:** Demonstrate mastery of ML algorithms, mathematical foundations, and system design.
2. **Problem solving:** Break down complex problems and design elegant solutions.
3. **Trade-off awareness:** Understand and articulate competing priorities in ML system design.
4. **Research integration:** Stay current with the latest research and connect it to production needs.
5. **Scalability:** Design systems that support massive scale and real-time requirements.
6. **Evaluation rigor:** Implement comprehensive evaluation and monitoring strategies.
7. **Innovation:** Propose novel improvements to existing systems.
