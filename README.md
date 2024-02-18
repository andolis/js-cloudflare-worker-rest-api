# Worker Simple Rest Api
Explore a secure public API endpoint hosted on Cloudflare Workers, delivering personalized welcome messages and group assignments based on user authentication

# Authentication
To authenticate your requests, include the Authorization header with a bearer token in the format "USER{XXX}" where XXX is a 3-digit numeric ID.

Query Parameter
The API accepts a query parameter stream that can be set to either "true" or "false". For example:

Example Curl Request
```
curl -H "Authorization: USER123" "https://your-cloudflare-worker-url/?stream=true"
```

# Rate Limiting
Each user ID is rate-limited to 4 requests per minute. If the rate limit is exceeded, a 429 Rate Limit Exceeded response is returned.