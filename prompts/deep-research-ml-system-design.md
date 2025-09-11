# ML System Design Interview Preparation

Generate a comprehensive ML system design interview preparation document for a specific ML topic. This prompt takes a JSON record and produces a detailed technical document focused on interview discussion points and technical depth appropriate for different seniority levels.

## Input Format
A JSON record containing:
- `company_name`: String - Company name (e.g., "Meta")
- `ml_topic`: String - ML system design topic (e.g., "Design a News Feed ML Ranking System")
- `interview_frequency`: String - Frequency ranking (e.g., "Very High", "High", "Medium", "Low")
- `product_description`: String - Brief description of the ML system and key challenges

## Output Format
Generate a comprehensive markdown document with the following sections:

### 1. Interview Overview
- **E7 Focus**: Advanced ML concepts, technical depth, algorithm expertise
- Problem scope and technical complexity
- Key ML challenges and technical requirements
- Interview discussion flow and technical deep-dives

### 2. Problem Definition & Technical Requirements
- **E7 Focus**: Complex ML problem formulation, advanced constraints
- Problem statement and technical objectives
- ML-specific success metrics and evaluation criteria
- Scale requirements and technical constraints
- **E7 Criteria**: Advanced problem decomposition, multi-objective optimization

### 3. Advanced Data Strategy & Feature Engineering
- **E7 Focus**: Sophisticated feature engineering, advanced data techniques
- Complex data sources and collection strategies
- Advanced feature engineering techniques (embeddings, transformations)
- Data quality, validation, and preprocessing pipelines
- **E7 Criteria**: Feature store design, advanced data augmentation, data versioning

### 4. Advanced ML Model Design
- **E7 Focus**: Deep understanding of model architectures, research integration
- Model selection with detailed technical justification
- Advanced architecture design and optimization
- Multi-task learning, ensemble methods, and advanced techniques
- **E7 Criteria**: Novel architectures, research paper integration, technical innovation

### 5. Advanced Training & Evaluation
- **E7 Focus**: Sophisticated training strategies, advanced evaluation methods
- Advanced training techniques (distributed training, gradient optimization)
- Sophisticated evaluation methodology and metrics
- Advanced A/B testing and statistical significance
- **E7 Criteria**: Training optimization, advanced evaluation frameworks, model selection

### 6. Model Serving & Inference Optimization
- **E7 Focus**: Advanced serving techniques, optimization strategies
- Complex online inference requirements
- Advanced model serving architectures
- Model compression, quantization, and optimization
- **E7 Criteria**: Real-time inference, model optimization, serving patterns

### 7. Advanced System Architecture
- **E7 Focus**: Complex system design, advanced integration patterns
- Sophisticated system components and interactions
- Advanced data flow and processing pipelines
- Complex integration patterns and protocols
- **E7 Criteria**: Advanced system patterns, complex data flows, optimization

### 8. Advanced Monitoring & ML Observability
- **E7 Focus**: Sophisticated ML monitoring, advanced analytics
- Advanced ML monitoring metrics and techniques
- Model drift detection and adaptation
- Advanced alerting and anomaly detection
- **E7 Criteria**: ML-specific monitoring, model performance analytics, drift detection

### 9. Advanced Scalability & Performance
- **E7 Focus**: Complex scaling strategies, advanced optimization
- Advanced scaling strategies for ML workloads
- Performance optimization and bottleneck analysis
- Resource optimization and efficiency
- **E7 Criteria**: Advanced scaling patterns, performance optimization, resource efficiency

### 10. Advanced ML Topics (E7 Focus)
- **E7 Criteria**: Deep ML expertise, advanced techniques, research knowledge
- Advanced ML algorithms and techniques
- Research integration and cutting-edge methods
- Complex optimization and mathematical foundations
- Advanced evaluation and validation techniques
- Future ML trends and emerging technologies

### 11. Technical Deep-Dive Discussion Points
- **E7 Focus**: Advanced technical concepts, algorithm deep-dives
- Complex technical decisions and trade-offs
- Advanced follow-up questions and technical challenges
- Edge cases and failure scenarios
- **E7 Criteria**: Algorithm complexity, mathematical foundations, advanced techniques

### 12. Advanced Technical Interview Questions
- **E7 Focus**: Deep technical knowledge, advanced ML concepts
- Advanced technical deep-dive questions
- Complex system design follow-ups
- **E7 Criteria**: Advanced ML algorithms, mathematical depth, technical expertise

## Requirements
- **Interview-focused**: Structure content for interview discussion, not implementation
- **E7 Technical Focus**: Emphasize advanced ML concepts, algorithm expertise, and technical depth
- **ML Depth & Breadth**: Cover advanced algorithms, mathematical foundations, and cutting-edge techniques
- **Practical examples**: Use concrete numbers, metrics, and real-world scenarios
- **Interview flow**: Organize content for 45-60 minute technical interview discussion
- **Follow-up ready**: Include edge cases, trade-offs, and technical deep-dive topics
- **No infrastructure details**: Focus on ML concepts, not server setup or deployment

## Seniority Level Focus
- **E5-E6**: Basic ML implementation, model design, evaluation
- **E7**: Advanced ML concepts, algorithm expertise, technical depth, research integration
- **E8+**: Research leadership, novel algorithm development, technical innovation

## Parameters
- `seniority_level`: String (default: "E7") - Target seniority level ("E5", "E6", "E7", "E8")
- `focus_area`: String (optional) - Specific ML area to emphasize (e.g., "deep_learning", "optimization", "evaluation", "algorithms")
- `interview_duration`: String (default: "60min") - Interview duration ("45min", "60min", "90min")

## Example Usage
```json
{
  "company_name": "Meta",
  "ml_topic": "Design a News Feed ML Ranking System",
  "interview_frequency": "Very High",
  "product_description": "Design a machine learning system for Facebook News Feed ranking. Key ML challenges: real-time feature engineering, user engagement prediction models, content diversity optimization, A/B testing frameworks, and scaling ML models to billions of users."
}
```

## Output Location
Save the generated document to: `content/ml-system-designs/{company_name}/{ml_topic}.md`
