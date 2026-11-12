# ==============================================================================
# BWANA PRODUCTION TERRAFORM: AMAZON CLOUDFRONT CDN WITH SOUTHERN AFRICA EDGE
# PoPs: Johannesburg (JNB50) and Cape Town (CPT50)
# ==============================================================================

variable "environment" {
  type    = string
  default = "production"
}

variable "alb_dns_name" {
  type        = string
  description = "Origin domain name pointing to the Application Load Balancer"
}

variable "domain_name" {
  type        = string
  default     = "bwana.africa"
  description = "Custom root domain name"
}

variable "certificate_arn" {
  type        = string
  default     = ""
  description = "ACM Certificate ARN in us-east-1 for CloudFront"
}

# ------------------------------------------------------------------------------
# CLOUDFRONT DISTRIBUTION
# ------------------------------------------------------------------------------

resource "aws_cloudfront_distribution" "bwana_cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Bwana Commercial Discovery CDN (Southern Africa Optimized)"
  price_class         = "PriceClass_All" # Includes Africa edge locations (Johannesburg / Cape Town)
  http_version        = "http2and3"      # HTTP/3 enabled for mobile network resilience

  # Primary Origin: Application Load Balancer
  origin {
    domain_name = var.alb_dns_name
    origin_id   = "BwanaALBOrigin"

    custom_origin_config {
      http_port                = 80
      https_port               = 443
      origin_protocol_policy   = "https-only"
      origin_ssl_protocols     = ["TLSv1.2"]
      origin_keepalive_timeout = 60
      origin_read_timeout      = 60
    }

    custom_header {
      name  = "X-Custom-Origin-Secret"
      value = "bwana-edge-verification-token"
    }
  }

  # Default Cache Behavior: Dynamic API routing (pass-through, no caching, all cookies & headers)
  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "BwanaALBOrigin"

    forwarded_values {
      query_string = true
      headers      = ["Host", "Authorization", "Accept", "Origin", "User-Agent"]

      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    compress               = true
  }

  # Ordered Cache Behavior 1: Static UI Assets & JavaScript bundles (Aggressive Edge Caching)
  ordered_cache_behavior {
    path_pattern     = "/assets/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "BwanaALBOrigin"

    forwarded_values {
      query_string = false
      headers      = ["Origin"]
      cookies {
        forward = "none"
      }
    }

    min_ttl                = 86400    # 1 day
    default_ttl            = 604800   # 7 days
    max_ttl                = 31536000 # 1 year
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = var.certificate_arn == "" ? true : false
    acm_certificate_arn            = var.certificate_arn != "" ? var.certificate_arn : null
    ssl_support_method             = var.certificate_arn != "" ? "sni-only" : null
    minimum_protocol_version       = "TLSv1.2_2021"
  }

  tags = {
    Environment = var.environment
    Project     = "Bwana"
    ManagedBy   = "Terraform"
  }
}

output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.bwana_cdn.domain_name
}

output "cloudfront_hosted_zone_id" {
  value = aws_cloudfront_distribution.bwana_cdn.hosted_zone_id
}
