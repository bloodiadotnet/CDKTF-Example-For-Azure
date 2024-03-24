#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'cdktf';

import { StackUtil } from '../util/stack-util';
import { Stack } from '../lib/stack';

if (process.env['NODE_ENV'] == null || process.env['NODE_ENV'] === '') {
    throw new Error('NODE_ENV is not set');
}
if (process.env['AZURE_LOCATION'] == null || process.env['AZURE_LOCATION'] === '') {
    throw new Error('AZURE_LOCATION is not set');
}
if (process.env['AZURE_SUBSCRIPTION_ID'] == null || process.env['AZURE_SUBSCRIPTION_ID'] === '') {
    throw new Error('AZURE_SUBSCRIPTION_ID is not set');
}
if (process.env['AZURE_TENANT_ID'] == null || process.env['AZURE_TENANT_ID'] === '') {
    throw new Error('AZURE_TENANT_ID is not set');
}

const app = new App();

Promise.resolve()
    .then(async () => {
        new Stack(app, StackUtil.getName());
        app.synth();
    })
    .catch((err) =>
        console.error({
            message: err.message,
            stack: err.stack,
        }),
    );
