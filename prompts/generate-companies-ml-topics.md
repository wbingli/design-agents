# Generate ML System Design Interview Topics

Generate a comprehensive list of machine learning system design interview topics from top technology companies in JSON format. Each record represents one ML system design question with its interview context and frequency ranking.

## Output Format
Return a JSON array where each record contains:
- `company_name`: String - Company name
- `ml_topic`: String - ML system design topic/question
- `interview_frequency`: String - Frequency ranking (e.g., "Very High", "High", "Medium", "Low")
- `product_description`: String - Description of the product/service and system design challenges for ML engineers preparing for interviews

## Requirements
- Start with Meta company and rank topics by interview frequency (Very High to Low)
- Include 30-50 records total (multiple records per company)
- Focus on companies known for ML/AI innovation and frequent interviewers
- Each company should have 3-5 different ML system design topic records
- Topics should be specific system design questions (e.g., "Design a News Feed Ranking System", "Design a Recommendation System", "Design a Real-time Chat System")
- Product descriptions should explain the system design challenges, scalability requirements, and key components that ML engineers need to discuss in interviews

## Example Structure
```json
[
  {
    "company_name": "Meta",
    "ml_topic": "Design a News Feed Ranking System",
    "interview_frequency": "Very High",
    "product_description": "Design a personalized news feed ranking system for Facebook. Key challenges: real-time ranking, user engagement prediction, content diversity, A/B testing, and scaling to billions of users. Discuss candidate generation, ranking models, feature engineering, and system architecture."
  },
  {
    "company_name": "Meta",
    "ml_topic": "Design a Recommendation System",
    "interview_frequency": "High",
    "product_description": "Design a recommendation system for Instagram content discovery. Key challenges: cold start problem, real-time recommendations, user behavior modeling, and content understanding. Discuss collaborative filtering, content-based filtering, hybrid approaches, and evaluation metrics."
  }
]
```

## Companies to Include
Focus on: Google, Meta, Amazon, Microsoft, Apple, Netflix, Uber, Airbnb, Tesla, OpenAI, NVIDIA, Salesforce, Adobe, Spotify, Twitter/X, LinkedIn, Pinterest, Snapchat, TikTok, and other major tech companies with significant ML investments.

## Output Location
Save the generated JSON to: `content/companies-ml-topics.json`

## Parameters
- `max_companies`: Number (default: 20) - Maximum number of companies to generate
- `focus_area`: String (optional) - Specific ML domain to emphasize (e.g., "computer_vision", "nlp", "recommendation_systems")
- `output_file`: String (default: "content/companies-ml-topics.json") - File path to save the results
