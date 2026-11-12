# ==============================================================================
# BWANA PRODUCTION TERRAFORM: AWS APPLICATION LOAD BALANCER (ALB) MODULE
# Architecture: CloudFront CDN -> ALB -> Multi-AZ ECS Fargate Tasks
# ==============================================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
  }
}

variable "environment" {
  type        = string
  default     = "production"
  description = "Target environment name (production, staging)"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID where the ALB and ECS tasks reside"
}

variable "public_subnet_ids" {
  type        = list(string)
  description = "Public subnet IDs spanning at least 2 Availability Zones for ALB"
}

variable "certificate_arn" {
  type        = string
  description = "AWS Certificate Manager (ACM) ARN for HTTPS TLS 1.3 termination"
  default     = ""
}

variable "app_port" {
  type        = number
  default     = 3000
  description = "Container port exposed by Bwana application"
}

variable "health_check_path" {
  type        = string
  default     = "/api/health"
  description = "Probe route for ALB target group health verification"
}

# ------------------------------------------------------------------------------
# 1. SECURITY GROUP FOR APPLICATION LOAD BALANCER
# ------------------------------------------------------------------------------

resource "aws_security_group" "alb_sg" {
  name_prefix = "bwana-alb-sg-${var.environment}-"
  description = "Security group for Bwana internet-facing Application Load Balancer"
  vpc_id      = var.vpc_id

  # Ingress HTTP (redirected to HTTPS)
  ingress {
    description      = "HTTP from anywhere (redirects to HTTPS)"
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  # Ingress HTTPS
  ingress {
    description      = "HTTPS from anywhere (or restricted to CloudFront Origin Prefix List)"
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  # Egress to private subnets / container tasks only
  egress {
    description = "Forward traffic to backend container target group"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "bwana-alb-sg-${var.environment}"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Project     = "Bwana"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# ------------------------------------------------------------------------------
# 2. INTERNET-FACING APPLICATION LOAD BALANCER (ALB)
# ------------------------------------------------------------------------------

resource "aws_lb" "main" {
  name               = "bwana-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  ip_address_type    = "dualstack" # IPv4 + IPv6 support
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = var.public_subnet_ids

  idle_timeout               = 60
  enable_deletion_protection = var.environment == "production" ? true : false
  drop_invalid_header_fields = true # RFC compliance & anti-header-smuggling

  tags = {
    Name        = "bwana-alb-${var.environment}"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Project     = "Bwana"
  }
}

# ------------------------------------------------------------------------------
# 3. TARGET GROUP (IP TARGET TYPE FOR ECS FARGATE)
# ------------------------------------------------------------------------------

resource "aws_lb_target_group" "app_tg" {
  name_prefix          = "bw-tg-"
  port                 = var.app_port
  protocol             = "HTTP"
  vpc_id               = var.vpc_id
  target_type          = "ip" # Required for ECS Fargate awsvpc networking
  deregistration_delay = 30   # Fast draining during continuous deployment

  health_check {
    enabled             = true
    path                = var.health_check_path
    protocol            = "HTTP"
    port                = "traffic-port"
    matcher             = "200"
    interval            = 15
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  stickiness {
    type            = "lb_cookie"
    cookie_duration = 86400
    enabled         = false # Stateless microservices architecture
  }

  tags = {
    Name        = "bwana-app-tg-${var.environment}"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Project     = "Bwana"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# ------------------------------------------------------------------------------
# 4. HTTP LISTENER (PORT 80 -> REDIRECT TO HTTPS 443)
# ------------------------------------------------------------------------------

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# ------------------------------------------------------------------------------
# 5. HTTPS LISTENER (PORT 443 -> FORWARD TO TARGET GROUP WITH TLS 1.3)
# ------------------------------------------------------------------------------

resource "aws_lb_listener" "https" {
  count             = var.certificate_arn != "" ? 1 : 0
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06" # Secure modern cipher suite
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app_tg.arn
  }
}

# Fallback forward rule on port 80 if SSL certificate is not yet issued in dev
resource "aws_lb_listener" "http_forward_fallback" {
  count             = var.certificate_arn == "" ? 1 : 0
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app_tg.arn
  }
}

# ------------------------------------------------------------------------------
# OUTPUTS
# ------------------------------------------------------------------------------

output "alb_dns_name" {
  description = "Canonical public DNS hostname of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "Route 53 hosted zone ID of the ALB for Alias records"
  value       = aws_lb.main.zone_id
}

output "target_group_arn" {
  description = "Target group ARN to be attached to the ECS Service"
  value       = aws_lb_target_group.app_tg.arn
}

output "alb_security_group_id" {
  description = "Security group ID of the ALB"
  value       = aws_security_group.alb_sg.id
}
