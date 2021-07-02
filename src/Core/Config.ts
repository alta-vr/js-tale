import { AuthorizationCode } from "./auth/AuthorizationCodeProvider";
import { ClientCredentials } from "./auth/ClientCredentialsProvider";

type Config = ClientCredentials | AuthorizationCode;

export default Config;