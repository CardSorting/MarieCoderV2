import { Counter, Histogram, Gauge, Registry } from 'prom-client'

const register = new Registry()

export const metrics = {
  // Request metrics
  httpRequestsTotal: new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
    registers: [register]
  }),
  
  httpRequestDuration: new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route'],
    buckets: [0.1, 0.5, 1, 2, 5, 10],
    registers: [register]
  }),
  
  // Instance metrics
  activeInstances: new Gauge({
    name: 'cline_instances_active',
    help: 'Number of active Cline instances',
    registers: [register]
  }),
  
  instanceStartDuration: new Histogram({
    name: 'cline_instance_start_duration_seconds',
    help: 'Time to start a Cline instance',
    buckets: [1, 2, 5, 10, 30],
    registers: [register]
  }),
  
  // Task metrics
  tasksCreated: new Counter({
    name: 'cline_tasks_created_total',
    help: 'Total number of tasks created',
    labelNames: ['provider'],
    registers: [register]
  }),
  
  taskDuration: new Histogram({
    name: 'cline_task_duration_seconds',
    help: 'Duration of tasks in seconds',
    labelNames: ['status'],
    buckets: [10, 30, 60, 300, 600, 1800],
    registers: [register]
  }),
  
  register
}

