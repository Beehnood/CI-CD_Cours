data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

resource "tls_private_key" "registry" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "registry" {
  key_name   = "${var.project_name}-key"
  public_key = tls_private_key.registry.public_key_openssh
}

resource "aws_security_group" "registry" {
  name        = "${var.project_name}-sg"
  description = "Secure Docker registry access"

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  ingress {
    description = "HTTPS registry"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [var.allowed_https_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg"
  }
}

resource "aws_instance" "registry" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  key_name                    = aws_key_pair.registry.key_name
  vpc_security_group_ids      = [aws_security_group.registry.id]
  associate_public_ip_address = true

  tags = {
    Name = "${var.project_name}-ec2"
  }
}
