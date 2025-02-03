import csv
import random
from datetime import datetime

def generate_network_data(num_subnets, systems_per_subnet):
    # Lists for random data generation
    device_types = ['windows', 'linux', 'router', 'firewall', 'switch']
    os_versions = {
        'windows': ['Windows Server 2019', 'Windows Server 2022', 'Windows 10', 'Windows 11'],
        'linux': ['Ubuntu 20.04', 'CentOS 7', 'RHEL 8', 'Debian 11'],
        'router': ['Cisco IOS 15.1', 'Juniper JunOS 21.1'],
        'firewall': ['PFSense 2.6', 'FortiOS 7.0'],
        'switch': ['Cisco IOS 17.3', 'HPE OS 16.04']
    }
    services = {
        'windows': ['rdp', 'smb', 'dns', 'dhcp', 'http', 'https'],
        'linux': ['ssh', 'http', 'https', 'ftp', 'smtp', 'dns'],
        'router': ['snmp', 'ssh', 'telnet'],
        'firewall': ['https', 'ssh', 'ipsec'],
        'switch': ['snmp', 'ssh', 'telnet']
    }

    network_data = []

    # Generate subnet ranges
    subnet_bases = [f"192.168.{i+1}" for i in range(num_subnets)]

    for subnet_index, subnet_base in enumerate(subnet_bases):
        # Each subnet gets a router
        router_data = {
            'hostname': f'router-subnet-{subnet_index + 1}',
            'ip_address': f'{subnet_base}.1',
            'subnet_mask': '255.255.255.0',
            'device_type': 'router',
            'os_version': random.choice(os_versions['router']),
            'mac_address': ':'.join(['%02x' % random.randint(0, 255) for _ in range(6)]),
            'gateway': f'{subnet_base}.1',
            'dns_servers': '8.8.8.8,8.8.4.4',
            'domain': 'example.com',
            'running_services': ','.join(random.sample(services['router'], k=2))
        }
        network_data.append(router_data)

        # Generate systems for this subnet
        for system_index in range(systems_per_subnet):
            device_type = random.choice(device_types)

            system_data = {
                'hostname': f'{device_type}-{subnet_index + 1}-{system_index + 1}',
                'ip_address': f'{subnet_base}.{10 + system_index}',
                'subnet_mask': '255.255.255.0',
                'device_type': device_type,
                'os_version': random.choice(os_versions[device_type]),
                'mac_address': ':'.join(['%02x' % random.randint(0, 255) for _ in range(6)]),
                'gateway': f'{subnet_base}.1',
                'dns_servers': '8.8.8.8,8.8.4.4',
                'domain': 'example.com',
                'running_services': ','.join(random.sample(services[device_type], k=min(3, len(services[device_type]))))
            }
            network_data.append(system_data)

    return network_data

def save_to_csv(data, filename):
    if not data:
        return

    fieldnames = data[0].keys()

    with open(filename, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)

def main():
    # Get user input
    num_subnets = int(input("How many subnets do you want to create? "))
    systems_per_subnet = int(input("How many systems per subnet? "))

    # Generate the data
    network_data = generate_network_data(num_subnets, systems_per_subnet)

    # Save to CSV
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f'network_topology_{timestamp}.csv'
    save_to_csv(network_data, filename)

    print(f"\nGenerated {len(network_data)} devices across {num_subnets} subnets")
    print(f"Data saved to: {filename}")

if __name__ == "__main__":
    main()