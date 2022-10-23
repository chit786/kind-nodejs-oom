#!/bin/bash

# create local k8s cluster
kind create cluster --config=kind/cluster.yaml

# load application image
kind load docker-image leaky-express-example2:1.0 --name kind

# set kube context 
kubectl config use-context kind-kind

# load ingress
kubectl --context kind-kind apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# wait for ingress controller to be up
kubectl --context kind-kind wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s

# deploy k8s resources to expose the express api
kubectl --context kind-kind apply -f k8s/deploy-example2.yaml

# display resources
kubectl --context kind-kind get pods -A