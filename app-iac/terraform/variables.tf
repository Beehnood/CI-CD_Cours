variable "aws_region" {
  description = "AWS region used for the application EC2 instance."
  type        = string
}

variable "project_name" {
  description = "Prefix used for AWS resource names."
  type        = string
  default     = "registry-app"
}

variable "instance_type" {
  description = "EC2 instance type."
  type        = string
  default     = "t2.micro"
}

variable "allowed_ssh_cidr" {
  description = "CIDR allowed to reach SSH."
  type        = string
  default     = "0.0.0.0/0"
}

variable "allowed_app_cidr" {
  description = "CIDR allowed to reach application ports."
  type        = string
  default     = "0.0.0.0/0"
}
