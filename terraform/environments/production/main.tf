# ==============================================================================
# BWANA PRODUCTION TERRAFORM: ROOT DEPLOYMENT CONFIGURATION
# Provisioning Region: af-south-1 (AWS Cape Town) / global edge
# ==============================================================================

provider "aws" {
  region = "af-south-1" # Primary AWS African Region
  default_tags {
    tags = {
      Project     = "Bwana"
      Environment = "Production"
      Repository  = "bwana-core"
    }
  }
}

# Provider for CloudFront ACM certificates (strictly us-east-1)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

# 1. VPC & Multi-AZ Networking
resource "aws_vpc" "bwana_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "bwana-production-vpc"
  }
}

# Public Subnets across 2 Availability Zones
resource "aws_subnet" "public_a" {
  vpc_id            = aws_vpc.bwana_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "af-south-1a"
  map_public_ip_on_launch = true
  tags = { Name = "bwana-public-a" }
}

resource "aws_subnet" "public_b" {
  vpc_id            = aws_vpc.bwana_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "af-south-1b"
  map_public_ip_on_launch = true
  tags = { Name = "bwana-public-b" }
}

# Private Subnets across 2 Availability Zones
resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.bwana_vpc.id
  cidr_block        = "10.0.10.0/24"
  availability_zone = "af-south-1a"
  tags = { Name = "bwana-private-a" }
}

resource "aws_subnet" "private_b" {
  vpc_id            = aws_vpc.bwana_vpc.id
  cidr_block        = "10.0.20.0/24"
  availability_zone = "af-south-1b"
  tags = { Name = "bwana-private-b" }
}

# Internet Gateway & NAT Gateways
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.bwana_vpc.id
  tags   = { Name = "bwana-igw" }
}

# 2. Deploy Application Load Balancer Module
module "alb" {
  source             = "../../modules/alb"
  environment        = "production"
  vpc_id             = aws_vpc.bwana_vpc.id
  public_subnet_ids  = [aws_subnet.public_a.id, aws_subnet.public_b.id]
  app_port           = 3000
  health_check_path  = "/api/health"
}

# 3. Deploy CloudFront CDN Edge Module
module "cloudfront" {
  source       = "../../modules/cloudfront"
  environment  = "production"
  alb_dns_name = module.alb.alb_dns_name
  domain_name  = "bwana.africa"
}

# 4. Deploy ECS Fargate Service Module
module "ecs" {
  source                = "../../modules/ecs_service"
  environment           = "production"
  vpc_id                = aws_vpc.bwana_vpc.id
  private_subnet_ids    = [aws_subnet.private_a.id, aws_subnet.private_b.id]
  alb_security_group_id = module.alb.alb_security_group_id
  target_group_arn      = module.alb.target_group_arn
  app_port              = 3000
}

output "application_load_balancer_dns" {
  value = module.alb.alb_dns_name
}

output "cloudfront_edge_distribution" {
  value = module.cloudfront.cloudfront_domain_name
}
