import config = require('config');
import { App, TerraformStack } from 'cdktf';
import { AzurermProvider } from '../.gen/providers/azurerm/provider';
import { RgStack } from './service/rg';
import { AgStack } from './service/ag';
import { VnetStack } from './service/vnet';
import { SaStack } from './service/sa';
import { DbStack } from './service/db';
import { SpStack } from './service/sp';

export class Stack extends TerraformStack {
    public rg: RgStack;
    public ag: AgStack;
    public vnet: VnetStack;
    public sa: SaStack;
    public db: DbStack;
    public sp: SpStack;

    constructor(app: App, id: string) {
        super(app, id);
        new AzurermProvider(this, 'AzurermProvider', {
            features: {},
            subscriptionId: config.get('azure.computing.subscriptionId'),
            tenantId: config.get('azure.computing.tenantId'),
        });
        this.rg = new RgStack(this); // Resource Group
        this.ag = new AgStack(this); // Action Group
        this.vnet = new VnetStack(this); // VNET / Subnet
        this.sa = new SaStack(this); // Storage Account / Container / Blob
        this.db = new DbStack(this); // SQL Server / SQL Database / Metric Alert
        this.sp = new SpStack(this); // Service Plan / WebApp / Metric Alert
    }
}
