output "registry_public_ip" {
  description = "Public IP address of the registry instance."
  value       = aws_instance.registry.public_ip
}

output "registry_ssh_user" {
  description = "Default SSH user for the Ubuntu AMI."
  value       = "ubuntu"
}

output "registry_private_key_pem" {
  description = "Private SSH key generated for Ansible."
  value       = tls_private_key.registry.private_key_pem
  sensitive   = true
}
