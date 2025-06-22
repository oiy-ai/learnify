#!/bin/bash

# Simple script to fix "another operation (install/upgrade/rollback) is in progress" error
# Usage: ./fix-helm-pending-simple.sh [RELEASE_NAME] [NAMESPACE]

# GKE cluster configuration
GCP_PROJECT_ID="learnify-463605"
GCP_CLUSTER_NAME="learnify-cluster"
GCP_CLUSTER_LOCATION="asia-east2"

# Default values
RELEASE_NAME=${1:-"affine"}
NAMESPACE=${2:-"dev"}

echo "🔧 Fixing Helm pending operation..."
echo "Release: $RELEASE_NAME"
echo "Namespace: $NAMESPACE"
echo "GKE Cluster: $GCP_CLUSTER_NAME in $GCP_CLUSTER_LOCATION"
echo "=================================="

# Check if tools are available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl not found"
    exit 1
fi

if ! command -v helm &> /dev/null; then
    echo "❌ helm not found"
    exit 1
fi

if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud not found"
    exit 1
fi

echo "✅ Tools check passed"

# Connect to GKE cluster
echo "🔗 Connecting to GKE cluster..."
gcloud config set project "$GCP_PROJECT_ID"
gcloud container clusters get-credentials "$GCP_CLUSTER_NAME" --zone="$GCP_CLUSTER_LOCATION" --project="$GCP_PROJECT_ID"

if [ $? -eq 0 ]; then
    echo "✅ Successfully connected to GKE cluster"
else
    echo "❌ Failed to connect to GKE cluster"
    exit 1
fi

# Check current status
echo "🔍 Checking Helm status..."
if helm status "$RELEASE_NAME" -n "$NAMESPACE" &> /dev/null; then
    echo "📊 Current release status:"
    helm status "$RELEASE_NAME" -n "$NAMESPACE" | head -10
    echo ""
    
    # Try rollback first
    echo "🔄 Attempting rollback..."
    if helm rollback "$RELEASE_NAME" -n "$NAMESPACE" --timeout=5m 2>/dev/null; then
        echo "✅ Rollback successful!"
    else
        echo "⚠️  Rollback failed, deleting release..."
        # Force delete the problematic release
        helm delete "$RELEASE_NAME" -n "$NAMESPACE" --timeout=5m
        echo "✅ Release deleted"
    fi
else
    echo "ℹ️  No existing release found"
    exit 0
fi

# Verify cleanup
echo "🔍 Verifying cleanup..."
if helm status "$RELEASE_NAME" -n "$NAMESPACE" &> /dev/null; then
    echo "⚠️  Release still exists:"
    helm status "$RELEASE_NAME" -n "$NAMESPACE"
else
    echo "✅ Release successfully cleaned"
fi

echo ""
echo "📈 Current releases in namespace $NAMESPACE:"
helm list -n "$NAMESPACE"

echo ""
echo "✅ Done! You can now retry your deployment." 