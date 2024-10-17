import Joi from "joi";
import { Provider } from "./network";

interface EnvironmentSchema {
    API_PROVIDER: Provider;
    SEPOLIA_API_KEY: string;
    AMOY_API_KEY: string;
    ETHEREUM_API_KEY: string;
    POLYGON_API_KEY: string;
    ETHERSCAN_API_KEY: string;
    POLYGONSCAN_API_KEY: string;
    OKLINK_API_KEY: string;
    OZ_DEFENDER_API_KEY: string;
    OZ_DEFENDER_API_SECRET: string;
    COINMARKETCAP_API_KEY: string;
    GAS_REPORTER_NETWORK: string;
    DEPLOYER_MNEMONIC: string;
    DEPLOYER_PASSPHRASE: string;
    DEPLOYER_ADDRESS: string;
}

const API_KEY_REGEX = /^[0-9A-Za-z_-]{32}$/;
const GUID_V4_REGEX = /^[{]?[0-9A-Fa-f]{8}-([0-9A-Fa-f]{4}-){3}[0-9A-Fa-f]{12}[}]?$/;
const MNEMONIC_REGEX = /^([a-z ]+){12,24}$/;
const ADDRESS_REGEX = /^0x[0-9A-Fa-f]{40}$/;

export function extractEnvironmentVariables(): EnvironmentSchema {
    const envSchema = Joi.object()
        .keys({
            API_PROVIDER: Joi.string()
                .optional()
                .valid("alchemy", "infura")
                .default("alchemy")
                .default("An API provider name"),
            SEPOLIA_API_KEY: Joi.string()
                .required()
                .regex(API_KEY_REGEX)
                .description("An API key for the sepolia testnet"),
            AMOY_API_KEY: Joi.string()
                .required()
                .regex(API_KEY_REGEX)
                .description("An API key for the amoy testnet"),
            ETHEREUM_API_KEY: Joi.string()
                .required()
                .regex(API_KEY_REGEX)
                .description("An API key for the ethereum mainnet"),
            POLYGON_API_KEY: Joi.string()
                .required()
                .regex(API_KEY_REGEX)
                .description("An API key for the polygon mainnet"),
            ETHERSCAN_API_KEY: Joi.string()
                .required()
                .length(34)
                .alphanum()
                .description("An API key for the etherscan service"),
            POLYGONSCAN_API_KEY: Joi.string()
                .required()
                .length(34)
                .alphanum()
                .description("An API key for the polygonscan service"),
            OKLINK_API_KEY: Joi.string()
                .required()
                .regex(GUID_V4_REGEX)
                .description("An API key for the oklink service"),
            OZ_DEFENDER_API_KEY: Joi.string()
                .required()
                .length(32)
                .alphanum()
                .description("An API key for the openzeppelin defender service"),
            OZ_DEFENDER_API_SECRET: Joi.string()
                .required()
                .length(64)
                .alphanum()
                .description("An API secret for the openzeppelin defender service"),
            COINMARKETCAP_API_KEY: Joi.string()
                .optional()
                .allow("")
                .regex(GUID_V4_REGEX)
                .description("An API key for the coinmarketcap service"),
            GAS_REPORTER_NETWORK: Joi.string()
                .optional()
                .allow("ethereum", "polygon")
                .default("ethereum")
                .description("A gas reporter network"),
            DEPLOYER_MNEMONIC: Joi.string()
                .optional()
                .default("test test test test test test test test test test test junk")
                .regex(MNEMONIC_REGEX)
                .description("A mnemonic phrase of a deployer account"),
            DEPLOYER_PASSPHRASE: Joi.string()
                .optional()
                .allow("")
                .description("A passphrase of a deployer account"),
            DEPLOYER_ADDRESS: Joi.string()
                .required()
                .regex(ADDRESS_REGEX)
                .description("An address of a deployer account"),
        })
        .unknown() as Joi.ObjectSchema<EnvironmentSchema>;

    const { value: envVars, error } = envSchema
        .prefs({
            errors: {
                label: "key",
            },
        })
        .validate(process.env);
    if (error) {
        throw new Error(error.annotate());
    }
    return envVars;
}
