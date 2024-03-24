const stage = process.env.NODE_ENV ? process.env.NODE_ENV : 'default';

export = {
    stage: stage.toLowerCase(),
    product: 'cdktf-example-for-azure',

    azure: {
        computing: {
            tenantId: process.env.AZURE_TENANT_ID,
            subscriptionId: process.env.AZURE_SUBSCRIPTION_ID,
            location: process.env.AZURE_LOCATION,
        },
    },

    vnet: {
        addressSpace: ['10.0.0.0/16'],
        defaultSubnet: {
            addressPrefixes: ['10.0.1.0/24'],
        },
        spSubnet: {
            addressPrefixes: ['10.0.2.0/24'],
        },
        dbSubnet: {
            addressPrefixes: ['10.0.3.0/24'],
        },
        saSubnet: {
            addressPrefixes: ['10.0.4.0/24'],
        },
        allowedSources: [
            { cidrIp: '1.1.1.1', description: 'Example1' },
            { cidrIp: '2.2.2.2', description: 'Example2' },
            { cidrIp: '3.3.3.3', description: 'Example3' },
        ],
    },
};
