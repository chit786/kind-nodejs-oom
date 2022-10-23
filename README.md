## Evaluate tools to investigate NodeJS Memory leaks

### Prerequisites
- `kubectl` cli
- `kind` cli
- `node 16+`
- `docker` cli

```
├── Dockerfile.example1
├── Dockerfile.example2
├── example-1.js
├── example-2.js
├── k8s
│   ├── deploy-example1.yaml
│   └── deploy-example2.yaml
├── kind
│   └── cluster.yaml
├── package-lock.json
├── package.json
├── presentation.md
├── presentation.pdf
├── scripts
│   ├── bootstrap.sh
│   └── cleanup.sh
└── test
    └── load.yaml
```
