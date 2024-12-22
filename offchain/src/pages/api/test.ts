import { Blockfrost, fromHex, fromText, Lucid, mintingPolicyToId, paymentCredentialOf, UTxO, Validator, Data, applyParamsToScript, applyDoubleCborEncoding, getAddressDetails, MintingPolicy, toHex, Constr, validatorToAddress, Kupmios, toUnit } from "@lucid-evolution/lucid";
import { NextApiRequest, NextApiResponse } from "next";
import { AssetClass, InitialMintConfig, MintBurnConfig } from "./apitypes";
import { getFirstUxtoWithAda } from "./fingUtxoFunctions";
import { sha256 } from '@noble/hashes/sha2';
import scripts from '../../../../onchain/plutus.json';
import { fromAddress, MintRedeemer, OutputReference, RewardsDatum } from "./schemas";
import { POSIXTime } from "@/Utils/types";
import { ONE_HOUR_MS, ONE_MIN_MS, TreeToken } from "@/Utils/constants";

//TODO: bring in NFT policyid to burn


type MetadataStructure = [
  {
    "721": {
      [policyId: string]: {
        [assetName: string]: {
          description: string;
          image: string;
          name: string;
        };
      };
    };
  }
];


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    // *****************************************************************/
    //*********  establish network and wallet connection ***************/
    //**************************************************************** */
    const initLucid = async () => {
      if (process.env.NODE_ENV === "development") {
        // const b = new Blockfrost(
        //   process.env.API_URL_PREPROD as string,
        //   process.env.BLOCKFROST_KEY_PREPROD as string
        // );
        const b = new Kupmios(
          process.env.KUPO_ENDPOINT_PREPROD!,
          process.env.OGMIOS_ENDPOINT_PREPROD!
        );
        return Lucid(b, "Preprod");
      } else {
        const b = new Blockfrost(
          process.env.API_URL_MAINNET!,
          process.env.BLOCKFROST_KEY_MAINNET!
        );
        return Lucid(b, "Mainnet");
      }

    };
    const lucid = await initLucid();
    const { address, nftMintPolicyName, burnAssetName }: MintBurnConfig = req.body;
    console.log(address);
    lucid.selectWallet.fromAddress(address, []);
    
    const pid = "ea61370d11e2162541656a85e4d98e57c4c36d470917332532a09937";
    const an = "000de140032d122da9ae5452790308bed94cfe487513e0f3d18f50443f098985";

    const assetUnit = toUnit(pid,an);
    //access the utxo to make sure it exits... it does
    const utxo = await lucid.utxoByUnit(assetUnit);
    console.log("UTxO:", utxo);

    //Error: No variant matched
    const metadata = await lucid.metadataOf<metad>(assetUnit);
    console.log("metadata: ", metadata);
    console.log(metadata.coordinates);
    console.log(metadata.name);
    console.log(metadata.number);
    console.log(metadata.species);
    // const policyId = Object.keys(metadata[0]["721"])[0];
    // const assetName = Object.keys(metadata[0]["721"][policyId])[0];
    // const { description, image, name } = metadata[0]["721"][policyId][assetName];

    // console.log("Metadata Name:", name);
    // console.log("Metadata Image:", image);
    // console.log("Metadata Description:", description);


    res.status(200).json({
      tx: null,
      newTree: null
    });
  }
  else {
    res.status(405).json({ error: "Method not allowed" });
  }
}


type metad = {
  coordinates: string,
  name: string,
  number: string,
  species: string
}




