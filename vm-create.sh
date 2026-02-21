#!/usr/bin/bash
# virt-install is a command line tool which provides an easy way to provision operating systems into virtual machines.

# virt-viewer is a lightweight UI interface for interacting with the graphical display of virtualized guest OS. It can display VNC or SPICE, and uses libvirt to lookup the graphical connection details.

# virt-clone is a command line tool for cloning existing inactive guests. It copies the disk images, and defines a config with new name, UUID and MAC address pointing to the copied disks.

# virt-xml is a command line tool for easily editing libvirt domain XML using virt-install’s command line options.

# virt-bootstrap is a command line tool providing an easy way to setup the root file system for libvirt-based containers
#
# using these tools may be wise
# https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-domain_commands-creating_a_guest_virtual_machine_from_a_configuration_file
# kinda dope
set -e
disk_path='/home/lucas/home/images/base_ubuntu.qcow2'
die () {
    echo $1
    exit 1
}

base_install() {
    virt-install \
    --name guest1 \
    --memory 2048 \
    --vcpus 2 \
    --disk $disk_path \
    --import \
    --os-variant ubuntu22.04 \
}

if [[ -f '/home/lucas/home/images/base_ubuntu.qcow2' ]]; then
    base_install
else
    echo $HOME
    pwd
    die "no base image found"

fi


