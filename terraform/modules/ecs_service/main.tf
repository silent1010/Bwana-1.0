# ==============================================================================
# BWANA PRODUCTION TERRAFORM: ECS FARGATE SERVICE WITH AUTO-SCALING
# ==============================================================================

variable "environment" {
  type    = string
  default = "production"
}

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type        = list(string)
  description = "Private subnets for ECS Fargate tasks across 2+ AZs"
}

variable "alb_security_group_id" {
  type = string
}

variable "target_group_arn" {
  type = string
}

variable "container_image" {
  type        = string
  default     = "725137054735.dkr.ecr.af-south-1.amazonaws.com/bwana-app:latest"
  description = "Container image URI in Amazon ECR"
}

variable "app_port" {
  type    = number
  default = 3000
}

# ------------------------------------------------------------------------------
# 1. SECURITY GROUP FOR ECS FARGATE TASKS
# ------------------------------------------------------------------------------

resource "aws_security_group" "ecs_tasks_sg" {
  name_prefix = "bwana-ecs-tasks-sg-${var.environment}-"
  description = "Allow inbound traffic strictly from ALB target group"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Traffic from ALB"
    from_port       = var.app_port
    to_port         = var.app_port
    protocol        = "tcp"
    security_groups = [var.alb_security_group_id]
  }

  egress {
    description      = "Outbound internet access for database & external APIs"
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name        = "bwana-ecs-tasks-sg-${var.environment}"
    Environment = var.environment
  }
}

# ------------------------------------------------------------------------------
# 2. ECS CLUSTER & TASK DEFINITION
# ------------------------------------------------------------------------------

resource "aws_ecs_cluster" "main" {
  name = "bwana-cluster-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name_prefix = "bwana-ecs-exec-role-"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_ecs_task_definition" "app" {
  family                   = "bwana-app-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "1024" # 1 vCPU
  memory                   = "2048" # 2 GB RAM
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "bwana-container"
      image     = var.container_image
      essential = true
      portMappings = [
        {
          containerPort = var.app_port
          hostPort      = var.app_port
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = tostring(var.app_port) },
        { name = "AWS_REGION", value = "af-south-1" }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/bwana-${var.environment}"
          "awslogs-region"        = "af-south-1"
          "awslogs-stream-prefix" = "fargate"
          "awslogs-create-group"  = "true"
        }
      }
    }
  ])
}

# ------------------------------------------------------------------------------
# 3. ECS SERVICE ATTACHED TO ALB TARGET GROUP
# ------------------------------------------------------------------------------

resource "aws_ecs_service" "app" {
  name            = "bwana-service-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 2 # Multi-AZ baseline for high availability
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.ecs_tasks_sg.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.target_group_arn
    container_name   = "bwana-container"
    container_port   = var.app_port
  }

  deployment_controller {
    type = "ECS" # Supports rolling updates with zero downtime
  }

  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
}

# ------------------------------------------------------------------------------
# 4. AUTO-SCALING POLICY (DYNAMIC LOAD-BASED SCALING)
# ------------------------------------------------------------------------------

resource "aws_appautoscaling_target" "ecs_target" {
  max_capacity       = 20
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.app.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# Scale up based on average CPU > 70%
resource "aws_appautoscaling_policy" "scale_cpu" {
  name               = "bwana-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}
