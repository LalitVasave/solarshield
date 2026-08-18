# SolarShield Kubernetes Deployment Guide

This directory contains the declarative infrastructure required to run SolarShield on an enterprise Kubernetes cluster (EKS, GKE, AKS).

## Architecture

* **PostgreSQL (StatefulSet)**: Persistent database for storing farm, panel, and inspection data.
* **Redis (Deployment)**: Message broker and result backend for Celery.
* **FastAPI (Deployment + LoadBalancer)**: Highly available web server exposed to the public internet.
* **Celery Workers (Deployment + HPA)**: Machine learning workers that auto-scale up to 50 pods when CPU utilization spikes during drone inspections.

## Deployment Instructions

To deploy to a cluster, run the following commands sequentially:

```bash
# 1. Create the dedicated namespace
kubectl apply -f k8s/namespace.yaml

# 2. Deploy configuration and secrets
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# 3. Deploy the persistent data layer
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml

# 4. Wait for database and redis to become ready
kubectl get pods -n solarshield -w

# 5. Deploy the application and auto-scaling workers
kubectl apply -f k8s/api.yaml
kubectl apply -f k8s/worker.yaml
```

To see the live public IP address assigned to your API:
```bash
kubectl get svc api-service -n solarshield
```
