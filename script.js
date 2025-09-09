const systemDesignData = {
    meta: {
        'news-feed': {
            title: 'Facebook News Feed System',
            content: `
                <h3>Overview</h3>
                <p>The Facebook News Feed is a personalized feed of stories from friends, pages, and groups that users follow. It's one of the most complex distributed systems, serving billions of users globally.</p>
                
                <h3>Key Components</h3>
                <ul>
                    <li><strong>Feed Generation Service:</strong> Creates personalized feeds using machine learning algorithms</li>
                    <li><strong>Content Ranking:</strong> Scores and ranks content based on user engagement patterns</li>
                    <li><strong>Edge Rank Algorithm:</strong> Considers affinity, weight, and time decay</li>
                    <li><strong>Caching Layer:</strong> Multi-level caching (Redis, Memcached) for fast retrieval</li>
                </ul>
                
                <h3>Architecture Highlights</h3>
                <ul>
                    <li>Push and Pull hybrid model for feed generation</li>
                    <li>Fanout service for distributing posts to followers' feeds</li>
                    <li>Sharded databases based on user ID</li>
                    <li>CDN for media content delivery</li>
                </ul>
                
                <div class="architecture-diagram">
                    [Architecture: User → Load Balancer → Feed Service → Ranking Service → Database/Cache → CDN]
                </div>
            `
        },
        'chat-system': {
            title: 'Facebook Messenger Chat System',
            content: `
                <h3>Overview</h3>
                <p>Facebook Messenger handles billions of messages daily with real-time delivery, supporting text, media, and group conversations.</p>
                
                <h3>Key Components</h3>
                <ul>
                    <li><strong>Message Queue:</strong> Kafka for reliable message delivery</li>
                    <li><strong>WebSocket Connections:</strong> Real-time bidirectional communication</li>
                    <li><strong>Presence Service:</strong> Tracks online/offline status</li>
                    <li><strong>Media Service:</strong> Handles file uploads and media sharing</li>
                </ul>
                
                <h3>Scalability Features</h3>
                <ul>
                    <li>Message sharding by conversation ID</li>
                    <li>Connection pooling for WebSocket management</li>
                    <li>End-to-end encryption for security</li>
                    <li>Message delivery acknowledgments</li>
                </ul>
            `
        },
        'live-streaming': {
            title: 'Facebook Live Streaming',
            content: `
                <h3>Overview</h3>
                <p>Facebook Live allows users to broadcast real-time video to their audience with minimal latency and high quality.</p>
                
                <h3>Key Components</h3>
                <ul>
                    <li><strong>RTMP Ingestion:</strong> Receives live video streams from broadcasters</li>
                    <li><strong>Transcoding Service:</strong> Converts video to multiple resolutions</li>
                    <li><strong>Edge Servers:</strong> Geographically distributed for low latency</li>
                    <li><strong>Chat Integration:</strong> Real-time comments during live streams</li>
                </ul>
                
                <h3>Technical Challenges</h3>
                <ul>
                    <li>Ultra-low latency streaming (sub-second delay)</li>
                    <li>Adaptive bitrate streaming for different network conditions</li>
                    <li>Horizontal scaling for concurrent viewers</li>
                    <li>Real-time analytics and moderation</li>
                </ul>
            `
        }
    },
    google: {
        'search-engine': {
            title: 'Google Search Engine',
            content: `
                <h3>Overview</h3>
                <p>Google Search processes over 8.5 billion searches per day, crawling and indexing billions of web pages to provide relevant results in milliseconds.</p>
                
                <h3>Key Components</h3>
                <ul>
                    <li><strong>Web Crawler (Googlebot):</strong> Discovers and fetches web content</li>
                    <li><strong>Indexing System:</strong> Processes and stores content in searchable format</li>
                    <li><strong>PageRank Algorithm:</strong> Ranks pages based on link authority</li>
                    <li><strong>Query Processing:</strong> Analyzes search intent and context</li>
                </ul>
                
                <h3>Architecture Highlights</h3>
                <ul>
                    <li>Distributed index across thousands of servers</li>
                    <li>Bigtable for storing web page data</li>
                    <li>MapReduce for processing large datasets</li>
                    <li>Multi-tier caching for sub-second response times</li>
                </ul>
                
                <div class="architecture-diagram">
                    [Architecture: Query → Load Balancer → Query Servers → Index Servers → Ranking → Results]
                </div>
            `
        },
        'youtube': {
            title: 'YouTube Video Platform',
            content: `
                <h3>Overview</h3>
                <p>YouTube serves over 2 billion logged-in monthly users, with over 500 hours of video uploaded every minute.</p>
                
                <h3>Key Components</h3>
                <ul>
                    <li><strong>Video Upload Service:</strong> Handles massive file uploads</li>
                    <li><strong>Transcoding Pipeline:</strong> Converts videos to multiple formats</li>
                    <li><strong>CDN Network:</strong> Global content distribution</li>
                    <li><strong>Recommendation Engine:</strong> ML-powered content suggestions</li>
                </ul>
                
                <h3>Scalability Solutions</h3>
                <ul>
                    <li>Chunked video upload for reliability</li>
                    <li>Adaptive streaming (DASH/HLS)</li>
                    <li>Geographically distributed edge caches</li>
                    <li>Automatic scaling based on demand</li>
                </ul>
            `
        },
        'maps': {
            title: 'Google Maps',
            content: `
                <h3>Overview</h3>
                <p>Google Maps provides mapping services, real-time traffic data, and navigation for billions of users worldwide.</p>
                
                <h3>Key Components</h3>
                <ul>
                    <li><strong>Tile Service:</strong> Serves map tiles at different zoom levels</li>
                    <li><strong>Routing Engine:</strong> Calculates optimal paths</li>
                    <li><strong>Traffic Service:</strong> Real-time traffic data processing</li>
                    <li><strong>Places Database:</strong> Stores business and location information</li>
                </ul>
                
                <h3>Technical Features</h3>
                <ul>
                    <li>Hierarchical spatial indexing for fast lookups</li>
                    <li>Real-time traffic data from mobile devices</li>
                    <li>Graph algorithms for route optimization</li>
                    <li>Predictive traffic modeling</li>
                </ul>
            `
        }
    },
    amazon: {
        'e-commerce': {
            title: 'Amazon E-commerce Platform',
            content: `
                <h3>Overview</h3>
                <p>Amazon's e-commerce platform handles millions of products, orders, and customers with high availability and consistency.</p>
                
                <h3>Key Components</h3>
                <ul>
                    <li><strong>Product Catalog:</strong> Searchable database of millions of items</li>
                    <li><strong>Inventory Management:</strong> Real-time stock tracking</li>
                    <li><strong>Order Processing:</strong> Handles purchase flow and fulfillment</li>
                    <li><strong>Payment Service:</strong> Secure transaction processing</li>
                </ul>
                
                <h3>Architecture Principles</h3>
                <ul>
                    <li>Service-oriented architecture (SOA)</li>
                    <li>Eventually consistent data model</li>
                    <li>Horizontal scaling with microservices</li>
                    <li>Circuit breakers for fault tolerance</li>
                </ul>
                
                <div class="architecture-diagram">
                    [Architecture: API Gateway → Microservices → Databases → Cache → CDN]
                </div>
            `
        },
        'aws-s3': {
            title: 'Amazon S3 Storage System',
            content: `
                <h3>Overview</h3>
                <p>Amazon S3 provides scalable object storage with 99.999999999% (11 9's) durability and virtually unlimited capacity.</p>
                
                <h3>Key Components</h3>
                <ul>
                    <li><strong>Object Storage:</strong> Files stored as objects in buckets</li>
                    <li><strong>Metadata Service:</strong> Tracks object locations and properties</li>
                    <li><strong>Replication System:</strong> Multi-AZ data redundancy</li>
                    <li><strong>Access Control:</strong> Fine-grained permissions and policies</li>
                </ul>
                
                <h3>Design Features</h3>
                <ul>
                    <li>Eventual consistency model</li>
                    <li>Automatic partitioning and load balancing</li>
                    <li>Versioning and lifecycle management</li>
                    <li>Cross-region replication</li>
                </ul>
            `
        },
        'recommendation': {
            title: 'Amazon Recommendation System',
            content: `
                <h3>Overview</h3>
                <p>Amazon's recommendation engine drives 35% of their revenue by suggesting relevant products to customers.</p>
                
                <h3>Key Components</h3>
                <ul>
                    <li><strong>Collaborative Filtering:</strong> User-item interaction analysis</li>
                    <li><strong>Content-Based Filtering:</strong> Product feature matching</li>
                    <li><strong>Machine Learning Pipeline:</strong> Real-time model training</li>
                    <li><strong>A/B Testing Framework:</strong> Algorithm performance testing</li>
                </ul>
                
                <h3>Algorithm Techniques</h3>
                <ul>
                    <li>Matrix factorization for user preferences</li>
                    <li>Deep learning for complex patterns</li>
                    <li>Real-time personalization</li>
                    <li>Cold start problem solutions</li>
                </ul>
            `
        }
    },
    netflix: {
        'video-streaming': {
            title: 'Netflix Video Streaming',
            content: `
                <h3>Overview</h3>
                <p>Netflix streams to 230+ million subscribers globally, accounting for 15% of global internet traffic.</p>
                
                <h3>Key Components</h3>
                <ul>
                    <li><strong>Content Encoding:</strong> Multiple bitrate versions of content</li>
                    <li><strong>CDN (Open Connect):</strong> Netflix's custom CDN network</li>
                    <li><strong>Adaptive Streaming:</strong> Dynamic quality adjustment</li>
                    <li><strong>Recommendation Engine:</strong> Personalized content discovery</li>
                </ul>
                
                <h3>Scalability Features</h3>
                <ul>
                    <li>Microservices architecture on AWS</li>
                    <li>Chaos engineering for reliability testing</li>
                    <li>Edge caching for reduced latency</li>
                    <li>Auto-scaling based on demand patterns</li>
                </ul>
            `
        },
        'content-delivery': {
            title: 'Netflix Content Delivery Network',
            content: `
                <h3>Overview</h3>
                <p>Netflix Open Connect is a custom CDN that places content closer to users for optimal streaming experience.</p>
                
                <h3>Key Components</h3>
                <ul>
                    <li><strong>Edge Servers:</strong> Strategically placed worldwide</li>
                    <li><strong>Cache Management:</strong> Intelligent content pre-positioning</li>
                    <li><strong>Bandwidth Optimization:</strong> Efficient content delivery</li>
                    <li><strong>Network Analytics:</strong> Real-time performance monitoring</li>
                </ul>
                
                <h3>Technical Innovations</h3>
                <ul>
                    <li>Predictive caching based on viewing patterns</li>
                    <li>ISP partnerships for direct peering</li>
                    <li>Custom hardware optimization</li>
                    <li>Traffic engineering and load balancing</li>
                </ul>
            `
        }
    },
    uber: {
        'ride-matching': {
            title: 'Uber Ride Matching System',
            content: `
                <h3>Overview</h3>
                <p>Uber's ride matching system connects millions of riders with drivers in real-time across 900+ cities worldwide.</p>
                
                <h3>Key Components</h3>
                <ul>
                    <li><strong>Geospatial Indexing:</strong> Efficient location-based matching</li>
                    <li><strong>Supply-Demand Service:</strong> Real-time driver availability</li>
                    <li><strong>Matching Algorithm:</strong> Optimal rider-driver pairing</li>
                    <li><strong>ETA Service:</strong> Accurate time predictions</li>
                </ul>
                
                <h3>Algorithm Features</h3>
                <ul>
                    <li>Geohashing for spatial partitioning</li>
                    <li>Machine learning for demand prediction</li>
                    <li>Graph algorithms for route optimization</li>
                    <li>Real-time location streaming</li>
                </ul>
                
                <div class="architecture-diagram">
                    [Architecture: Mobile Apps → API Gateway → Matching Service → Location Service → Database]
                </div>
            `
        },
        'surge-pricing': {
            title: 'Uber Surge Pricing System',
            content: `
                <h3>Overview</h3>
                <p>Uber's surge pricing dynamically adjusts prices based on supply and demand to balance the marketplace.</p>
                
                <h3>Key Components</h3>
                <ul>
                    <li><strong>Demand Forecasting:</strong> Predicts rider requests</li>
                    <li><strong>Supply Tracking:</strong> Monitors driver availability</li>
                    <li><strong>Pricing Engine:</strong> Calculates surge multipliers</li>
                    <li><strong>Geographic Zones:</strong> City-specific pricing areas</li>
                </ul>
                
                <h3>Technical Implementation</h3>
                <ul>
                    <li>Real-time data processing with Apache Kafka</li>
                    <li>Machine learning models for price optimization</li>
                    <li>Event-driven architecture for price updates</li>
                    <li>A/B testing for pricing strategies</li>
                </ul>
            `
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const topicItems = document.querySelectorAll('.topic-item');
    const contentArea = document.getElementById('content-area');
    
    topicItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            topicItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get company and topic from data attributes
            const company = this.dataset.company;
            const topic = this.dataset.topic;
            
            // Get content data
            const contentData = systemDesignData[company]?.[topic];
            
            if (contentData) {
                contentArea.innerHTML = `
                    <div class="system-design-content active">
                        <h2>${contentData.title}</h2>
                        ${contentData.content}
                    </div>
                `;
            }
        });
    });
    
    // Add hover effects and smooth scrolling
    const sidebar = document.querySelector('.sidebar');
    sidebar.addEventListener('scroll', function() {
        // Add scroll shadow effect if needed
    });
});