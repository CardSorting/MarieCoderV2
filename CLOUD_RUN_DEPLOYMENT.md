# Cloud Run Deployment Guide

This guide explains how to deploy the Cline Backend MVP to Google Cloud Run.

## Prerequisites

1. Google Cloud SDK installed and configured
2. Docker installed locally (for local testing)
3. A Google Cloud Project with Cloud Run API enabled
4. Required environment variables configured as secrets or environment variables

## Quick Start

### 1. Build and Deploy with Cloud Build

```bash
# Set your project ID
export PROJECT_ID=your-project-id
export REGION=us-central1

# Submit build to Cloud Build
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_REGION=$REGION,_MEMORY=2Gi,_CPU=2
```

### 2. Deploy Manually with gcloud

```bash
# Build the Docker image
docker build -f docker/Dockerfile -t gcr.io/$PROJECT_ID/cline-backend .

# Push to Container Registry
docker push gcr.io/$PROJECT_ID/cline-backend

# Deploy to Cloud Run
gcloud run deploy cline-backend \
  --image gcr.io/$PROJECT_ID/cline-backend \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 0 \
  --port 8080 \
  --set-env-vars "NODE_ENV=production,PORT=8080,HOST=0.0.0.0" \
  --set-secrets "JWT_SECRET=jwt-secret:latest,ANTHROPIC_API_KEY=anthropic-key:latest"
```

### 3. Using Service Configuration File

```bash
# Edit service.yaml and replace PROJECT_ID with your project ID
# Then deploy:
gcloud run services replace service.yaml --region=$REGION
```

## Environment Variables

### Required

- `JWT_SECRET`: Secret key for JWT token generation
- `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`: AI provider API key

### Optional

- `PORT`: Server port (default: 8080, Cloud Run sets this automatically)
- `HOST`: Host to bind to (default: 0.0.0.0)
- `NODE_ENV`: Environment mode (production)
- `WORKSPACE_DIR`: Directory for workspaces (default: /workspaces)
- `CLINE_DIR`: Cline configuration directory (default: /root/.cline)
- `CLINE_CORE_PATH`: Path to cline-core.js
- `CLINE_HOST_PATH`: Path to cline-host binary
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins
- `LOG_LEVEL`: Logging level (error, warn, info, debug)
- `ENABLE_METRICS`: Enable Prometheus metrics (default: true)

## Secrets Management

For sensitive values, use Cloud Secret Manager:

```bash
# Create secrets
echo -n "your-jwt-secret" | gcloud secrets create jwt-secret --data-file=-
echo -n "your-api-key" | gcloud secrets create anthropic-key --data-file=-

# Grant Cloud Run access
gcloud secrets add-iam-policy-binding jwt-secret \
  --member="serviceAccount:cline-backend@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Use in deployment
gcloud run services update cline-backend \
  --set-secrets "JWT_SECRET=jwt-secret:latest,ANTHROPIC_API_KEY=anthropic-key:latest" \
  --region $REGION
```

## Resource Configuration

### Recommended Settings

- **Memory**: 2Gi (adjust based on workload)
- **CPU**: 2 (or 1 for lighter workloads)
- **Max Instances**: 10 (adjust based on expected load)
- **Min Instances**: 0 (for cost optimization) or 1 (for zero cold starts)
- **Timeout**: 300s (5 minutes, max 3600s)
- **Concurrency**: 80 (default, adjust based on request patterns)

### Cost Optimization

- Set `min-instances` to 0 for development/test environments
- Use CPU throttling (enabled by default)
- Adjust memory based on actual usage (monitor via Cloud Console)
- Use startup CPU boost only if cold starts are a concern

## Health Checks

Cloud Run automatically uses the following endpoints:

- **Liveness**: `GET /health/live` - Returns 200 if process is alive
- **Readiness**: `GET /health/ready` - Returns 200 if service is ready to accept traffic
- **Startup**: Uses liveness probe with extended timeout

## Monitoring

### View Logs

```bash
gcloud run services logs read cline-backend --region=$REGION
```

### View Metrics

1. Go to Cloud Console > Cloud Run > cline-backend
2. Navigate to Metrics tab
3. Monitor:
   - Request count
   - Latency (p50, p95, p99)
   - Error rate
   - Memory/CPU utilization
   - Instance count

### Prometheus Metrics

The service exposes Prometheus metrics at `/metrics` endpoint.

## Troubleshooting

### Cold Start Issues

1. Increase `min-instances` to 1 or higher
2. Enable `startup-cpu-boost` (enabled by default in service.yaml)
3. Reduce initial dependencies and optimize startup code
4. Use smaller container images

### Memory Issues

1. Monitor memory usage in Cloud Console
2. Increase memory allocation if needed
3. Check for memory leaks in application code
4. Review instance logs for OOM errors

### Timeout Issues

1. Increase timeout value (max 3600s)
2. Optimize long-running operations
3. Consider breaking tasks into smaller chunks
4. Use background processing for heavy tasks

### Connection Issues

1. Ensure service binds to `0.0.0.0` (not `localhost`)
2. Verify PORT environment variable is set correctly
3. Check Cloud Run service logs for connection errors
4. Verify network/firewall rules allow traffic

## Local Testing

Test the Cloud Run-optimized build locally:

```bash
# Build image
docker build -f docker/Dockerfile -t cline-backend:local .

# Run with Cloud Run-like environment
docker run -p 8080:8080 \
  -e PORT=8080 \
  -e HOST=0.0.0.0 \
  -e NODE_ENV=production \
  -e JWT_SECRET=test-secret \
  -e ANTHROPIC_API_KEY=test-key \
  cline-backend:local
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
      - name: Submit build
        run: |
          gcloud builds submit --config=cloudbuild.yaml \
            --substitutions=_REGION=us-central1
```

## Notes

- Cloud Run uses ephemeral storage - files written to disk are lost when instance stops
- Use Cloud Storage or databases for persistent storage
- Workspace data should be stored in Cloud Storage or external databases
- Health checks must respond quickly (< 4 seconds) or instance may be restarted
- Graceful shutdown is handled automatically via SIGTERM signal

