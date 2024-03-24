export = {
    ag: {
        group: [
            {
                name: 'User1',
                emailAddress: 'user1@example',
            },
            {
                name: 'User2',
                emailAddress: 'user2@example',
            },
            {
                name: 'User3',
                emailAddress: 'user3@example',
            },
            {
                name: 'User4',
                emailAddress: 'user4@example',
            },
            {
                name: 'User5',
                emailAddress: 'user5@example',
            },
        ],
    },

    sa: {
        tier: 'Standard',
        replicationType: 'LRS',
        container: {
            containerAccessType: 'container',
        },
        blob: {
            type: 'Block',
            accessTier: 'Hot',
        },
    },

    db: {
        mssqlServer: {
            version: '12.0',
            administratorLogin: 'dba',
        },
        mssqlDatabase: {
            shortTermRetentionPolicy: {
                retentionDays: 7,
            },
            collation: 'Japanese_CI_AS',
            maxSizeGb: 2,
            skuName: 'Basic',
        },
    },

    sp: {
        osType: 'Linux',
        skuName: 'B1',
    },
};
