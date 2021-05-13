import ApiConnection from "./ApiConnection";
export default class Profile {
    api: ApiConnection;
    constructor(api: ApiConnection);
    refresh(): Promise<void>;
    getLoggedIn(): boolean;
    getId(): any;
    getUsername(): any;
    getVerified(): any;
    getSupporter(): undefined;
    requestVerificationEmail(email: string): Promise<any> | undefined;
}
