import config = require('config');
import { MonitorActionGroup, MonitorActionGroupEmailReceiver } from '../../.gen/providers/azurerm/monitor-action-group';

import { StackUtil } from '../../util/stack-util';
import { MainStack } from '../main-stack';

export class AgStack {
    public monitorActionGroup: MonitorActionGroup;

    constructor(scope: MainStack) {
        let actionGroup: MonitorActionGroupEmailReceiver[] = config.get('ag.group');

        // Action Group
        this.monitorActionGroup = new MonitorActionGroup(scope, 'MonitorActionGroup', {
            resourceGroupName: scope.rg.resourceGroup.name,
            name: StackUtil.getName('ag'),
            shortName: 'ag',
            emailReceiver: actionGroup,
            tags: {
                product: config.get('product'),
                environment: config.get('stage'),
            },
        });
    }
}
