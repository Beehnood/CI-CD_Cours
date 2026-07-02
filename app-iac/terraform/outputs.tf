output "app_public_ip" {
  description = "Public IP address of the application instance."
  value       = aws_instance.app.public_ip
}

output "app_ssh_user" {
  description = "Default SSH user for the Ubuntu AMI."
  value       = "ubuntu"
}

output "app_private_key_pem" {
  description = "Private SSH key generated for Ansible."
  value       = tls_private_key.app.private_key_pem
  sensitive   = true
}
