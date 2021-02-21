import { ApiConnection, SubscriptionManager, GroupManager, Config } from "..";
export default class Client {
    api: ApiConnection;
    subscriptions: SubscriptionManager;
    groupManager: GroupManager;
    init(config: Config): Promise<void>;
}
