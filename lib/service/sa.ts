import config = require('config');
import { TerraformOutput } from 'cdktf';
import { StorageAccount } from '../../.gen/providers/azurerm/storage-account';
import { StorageContainer } from '../../.gen/providers/azurerm/storage-container';
import { StorageBlob } from '../../.gen/providers/azurerm/storage-blob';

import { StackUtil } from '../../util/stack-util';
import { Stack } from '../stack';

export class SaStack {
    public storageAccount: StorageAccount;
    public storageContainer: StorageContainer;

    constructor(scope: Stack) {
        const allowedSources = (config.get('vnet.allowedSources') as Array<{ cidrIp: string }>).map(
            (source) => source.cidrIp,
        );

        // Storage Account
        this.storageAccount = new StorageAccount(scope, 'StorageAccount', {
            name: StackUtil.getName('sa').replace(/-/g, '').toLowerCase(),
            resourceGroupName: scope.rg.resourceGroup.name,
            location: scope.rg.resourceGroup.location,
            accountTier: config.get('sa.tier'),
            accountReplicationType: config.get('sa.replicationType'),
            networkRules: {
                defaultAction: 'Deny',
                ipRules: allowedSources,
                virtualNetworkSubnetIds: [scope.vnet.saSubnet.id],
            },
            tags: {
                product: config.get('product'),
                environment: config.get('stage'),
            },
        });

        // Storage Container
        this.storageContainer = new StorageContainer(scope, 'StorageContainer', {
            name: StackUtil.getName('container'),
            containerAccessType: config.get('sa.container.containerAccessType'),
            storageAccountName: this.storageAccount.name,
        });

        // Storage Blob
        new StorageBlob(scope, 'StorageBlob', {
            name: StackUtil.getName('blob'),
            accessTier: config.get('sa.blob.accessTier'),
            storageAccountName: this.storageAccount.name,
            storageContainerName: this.storageContainer.name,
            type: config.get('sa.blob.type'),
        });

        new TerraformOutput(scope, 'StorageAccountPrimaryAccessKey', {
            value: this.storageAccount.primaryAccessKey,
            description: 'The primary access key for Storage Account.',
            sensitive: true, // Important! Access key contains sensitive information.
        });

        new TerraformOutput(scope, 'StorageAccountPrimaryConnectionString', {
            value: this.storageAccount.primaryConnectionString,
            description: 'The primary connection string for Storage Account.',
            sensitive: true, // Important! Connection string contains sensitive information.
        });
    }
}
