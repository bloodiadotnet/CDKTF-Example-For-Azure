import config = require('config');
import { ResourceGroup } from '../../.gen/providers/azurerm/resource-group';

import { StackUtil } from '../../util/stack-util';
import { MainStack } from '../main-stack';

export class RgStack {
    public resourceGroup: ResourceGroup;

    constructor(scope: MainStack) {
        // Resource Group
        this.resourceGroup = new ResourceGroup(scope, 'ResourceGroup', {
            name: StackUtil.getName('rg'),
            location: config.get('azure.computing.location'),
            tags: {
                product: config.get('product'),
                environment: config.get('stage'),
            },
        });
    }
}
