import config = require('config');
import { VirtualNetwork } from '../../.gen/providers/azurerm/virtual-network';
import { Subnet } from '../../.gen/providers/azurerm/subnet';

import { StackUtil } from '../../util/stack-util';
import { MainStack } from '../main-stack';

export class VnetStack {
    public virtualNetwork: VirtualNetwork;
    public spSubnet: Subnet;
    public dbSubnet: Subnet;
    public saSubnet: Subnet;

    constructor(scope: MainStack) {
        // VNET
        this.virtualNetwork = new VirtualNetwork(scope, 'VirtualNetwork', {
            name: StackUtil.getName('vnet'),
            resourceGroupName: scope.rg.resourceGroup.name,
            location: scope.rg.resourceGroup.location,
            addressSpace: config.get('vnet.addressSpace'),
            tags: {
                product: config.get('product'),
                environment: config.get('stage'),
            },
        });

        // Default Subnet
        new Subnet(scope, 'DefaultSubnet', {
            name: StackUtil.getName('default-subnet'),
            resourceGroupName: this.virtualNetwork.resourceGroupName,
            virtualNetworkName: this.virtualNetwork.name,
            serviceEndpoints: ['Microsoft.Sql'],
            addressPrefixes: config.get('vnet.defaultSubnet.addressPrefixes'),
        });

        // Service Plan Subnet
        this.spSubnet = new Subnet(scope, 'SPSubnet', {
            name: StackUtil.getName('sp-subnet'),
            resourceGroupName: this.virtualNetwork.resourceGroupName,
            virtualNetworkName: this.virtualNetwork.name,
            addressPrefixes: config.get('vnet.spSubnet.addressPrefixes'),
            delegation: [
                {
                    name: StackUtil.getName('sp-delegation'),
                    serviceDelegation: {
                        name: 'Microsoft.Web/serverFarms',
                        actions: ['Microsoft.Network/virtualNetworks/subnets/action'],
                    },
                },
            ],
        });

        // SQL Server Subnet
        this.dbSubnet = new Subnet(scope, 'DBSubnet', {
            name: StackUtil.getName('db-subnet'),
            resourceGroupName: this.virtualNetwork.resourceGroupName,
            virtualNetworkName: this.virtualNetwork.name,
            serviceEndpoints: ['Microsoft.Sql'],
            addressPrefixes: config.get('vnet.dbSubnet.addressPrefixes'),
        });

        // Storage Account Subnet
        this.saSubnet = new Subnet(scope, 'SASubnet', {
            name: StackUtil.getName('sa-subnet'),
            resourceGroupName: this.virtualNetwork.resourceGroupName,
            virtualNetworkName: this.virtualNetwork.name,
            serviceEndpoints: ['Microsoft.Storage'],
            addressPrefixes: config.get('vnet.saSubnet.addressPrefixes'),
        });
    }
}
