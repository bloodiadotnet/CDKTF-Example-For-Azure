import config = require('config');
import { TerraformOutput } from 'cdktf';
import { LinuxWebApp } from '../../.gen/providers/azurerm/linux-web-app';
import { ServicePlan } from '../../.gen/providers/azurerm/service-plan';
import { AppServiceVirtualNetworkSwiftConnection } from '../../.gen/providers/azurerm/app-service-virtual-network-swift-connection';
import { MonitorMetricAlert } from '../../.gen/providers/azurerm/monitor-metric-alert';

import { StackUtil } from '../../util/stack-util';
import { MainStack } from '../main-stack';

export class SpStack {
    constructor(scope: MainStack) {
        // Service Plan
        const servicePlan = new ServicePlan(scope, 'ServicePlan', {
            name: StackUtil.getName('sp'),
            resourceGroupName: scope.rg.resourceGroup.name,
            location: scope.rg.resourceGroup.location,
            osType: config.get('sp.osType'),
            skuName: config.get('sp.skuName'),
            tags: {
                product: config.get('product'),
                environment: config.get('stage'),
            },
        });

        // WebApp
        const webApp = new LinuxWebApp(scope, 'WebApp', {
            name: StackUtil.getName('webapp'),
            resourceGroupName: servicePlan.resourceGroupName,
            location: servicePlan.location,
            servicePlanId: servicePlan.id,
            clientAffinityEnabled: false,
            httpsOnly: true,
            appSettings: {
                WEBSITES_PORT: '8080',
                AZURE_BLOB_CONTAINER_NAME: scope.sa.storageContainer.name,
                AZURE_BLOB_CONNECTION_STRING: scope.sa.storageAccount.primaryConnectionString,
                AZURE_BLOB_STORAGE_KEY: scope.sa.storageAccount.primaryAccessKey,
                AZURE_MSSQLSERVER_CONNECTION_STRING: scope.db.mssqlServerConnectionString,
                WEBSITE_RUN_FROM_PACKAGE: '1',
            },
            siteConfig: {
                minimumTlsVersion: '1.2',
                applicationStack: {
                    dockerRegistryUrl: 'https://mcr.microsoft.com',
                    dockerImageName: 'dotnet/samples:aspnetapp',
                },
            },
            tags: {
                product: config.get('product'),
                environment: config.get('stage'),
            },
        });

        // VNET Integration
        new AppServiceVirtualNetworkSwiftConnection(scope, 'AppServiceVirtualNetworkSwiftConnection', {
            subnetId: scope.vnet.spSubnet.id,
            appServiceId: webApp.id,
        });

        // Metric Alert
        new MonitorMetricAlert(scope, 'MonitorMetricAlertCPUTime', {
            name: StackUtil.getName('webapp-alert'),
            resourceGroupName: scope.rg.resourceGroup.name,
            description: 'Alert when CPU time is high',
            scopes: [webApp.id],
            dynamicCriteria: {
                aggregation: 'Maximum',
                metricNamespace: 'Microsoft.Web/sites',
                metricName: 'CpuTime',
                operator: 'GreaterThan',
                alertSensitivity: 'High',
                evaluationTotalCount: 4,
                evaluationFailureCount: 2,
            },
            action: [
                {
                    actionGroupId: scope.ag.monitorActionGroup.id,
                },
            ],
            tags: {
                product: config.get('product'),
                environment: config.get('stage'),
            },
        });

        new TerraformOutput(scope, 'WebAppDefaultHostname', {
            value: webApp.defaultHostname,
            description: 'The default hostname for WebApp.',
        });
    }
}
