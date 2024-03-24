import config = require('config');
import { TerraformOutput } from 'cdktf';
import { MssqlServer } from '../../.gen/providers/azurerm/mssql-server';
import { MssqlDatabase } from '../../.gen/providers/azurerm/mssql-database';
import { MssqlVirtualNetworkRule } from '../../.gen/providers/azurerm/mssql-virtual-network-rule';
import { MssqlFirewallRule } from '../../.gen/providers/azurerm/mssql-firewall-rule';
import { MonitorMetricAlert } from '../../.gen/providers/azurerm/monitor-metric-alert';
import { RandomProvider } from '../../.gen/providers/random/provider';
import { Password } from '../../.gen/providers/random/password';

import { StackUtil } from '../../util/stack-util';
import { Stack } from '../stack';

export class DbStack {
    public mssqlServerConnectionString: string;

    constructor(scope: Stack) {
        // Initializing RandomProvider.
        new RandomProvider(scope, 'RandomProvider', {});

        // Generate a administrator login password
        // Azure password policies have the following requirements:
        // Password must be at least 8 characters and no more than 128 characters.
        // Passwords must contain at least one uppercase letter, one lowercase letter, one number, and one non-alphanumeric symbol.
        const administratorLoginPassword = new Password(scope, 'AdministratorLoginPassword', {
            length: 16,
            special: true,
            upper: true,
            lower: true,
            numeric: true,
            overrideSpecial: '_%@',
        });

        // MSSQL Server
        const mssqlServer = new MssqlServer(scope, 'MSSQLServer', {
            name: StackUtil.getName('mssqlsv'),
            resourceGroupName: scope.rg.resourceGroup.name,
            location: scope.rg.resourceGroup.location,
            version: config.get('db.mssqlServer.version'),
            administratorLogin: config.get('db.mssqlServer.administratorLogin'),
            administratorLoginPassword: administratorLoginPassword.result,
            minimumTlsVersion: '1.2',
            tags: {
                product: config.get('product'),
                environment: config.get('stage'),
            },
        });

        // MSSQL Database
        const mssqlDatabase = new MssqlDatabase(scope, 'MSSQLDatabase', {
            name: StackUtil.getName('mssqldb'),
            serverId: mssqlServer.id,
            collation: config.get('db.mssqlDatabase.collation'),
            maxSizeGb: config.get('db.mssqlDatabase.maxSizeGb'),
            skuName: config.get('db.mssqlDatabase.skuName'),
            shortTermRetentionPolicy: {
                retentionDays: config.get('db.mssqlDatabase.shortTermRetentionPolicy.retentionDays'),
            },
            tags: {
                product: config.get('product'),
                environment: config.get('stage'),
            },
        });

        var allowedSources: {
            cidrIp: string;
            description: string;
        }[] = config.get('vnet.allowedSources');

        // Firewall Rule
        allowedSources.forEach((allowedSource, index) => {
            new MssqlFirewallRule(scope, `MSSQLFirewallRule${index}`, {
                name: allowedSource.description,
                serverId: mssqlServer.id,
                startIpAddress: allowedSource.cidrIp,
                endIpAddress: allowedSource.cidrIp,
            });
        });

        // VNET Integration
        new MssqlVirtualNetworkRule(scope, 'MSSQLVirtualNetworkRule', {
            name: StackUtil.getName('sqlsv-vnet-rule'),
            serverId: mssqlServer.id,
            subnetId: scope.vnet.dbSubnet.id,
            ignoreMissingVnetServiceEndpoint: true,
        });

        // MSSQL Server Connection String
        this.mssqlServerConnectionString = `Server=tcp:${mssqlServer.fullyQualifiedDomainName},${mssqlServer.id};Initial Catalog=${mssqlDatabase.name};Persist Security Info=False;User ID=${mssqlServer.administratorLogin};Password=${administratorLoginPassword.result};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;`;

        // Metric Alert
        new MonitorMetricAlert(scope, 'MonitorMetricAlertDTUConsumption', {
            name: StackUtil.getName('mssqlsv-alert'),
            resourceGroupName: scope.rg.resourceGroup.name,
            description: 'Alert when DTU consumption is high',
            scopes: [mssqlServer.id],
            dynamicCriteria: {
                aggregation: 'Maximum',
                metricNamespace: 'Microsoft.Sql/servers',
                metricName: 'dtu_consumption_percent',
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

        new TerraformOutput(scope, 'MSSQLServerConnectionString', {
            value: this.mssqlServerConnectionString,
            description: 'The connection string for MSSQL Server.',
            sensitive: true, // Important! Connection string contains sensitive information.
        });
    }
}
