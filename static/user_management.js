import { create } from 'kubo-rpc-client'
import dotenv from 'dotenv'

import DimDogs_artefacts from '../out/DimDogs.sol/DimDogs.json'
import { ethers } from 'ethers'

const DimDogs_Abi = DimDogs_artefacts["abi"];
// const DimDogs_ContractAddresses = { linea: "0x2C985732333256db948240FcEFc88FA6389e12Cf", goerli: "0xcb7B6A6927b3c6150859C4DeBC54DBE0c437Fc89", alfajores: "0x9d3BeEAC4026d41Ca2504189fB869C964b76B050" };

const LINEA_DEPLOY_ENDPOINT = "https://linea-goerli.infura.io/v3/1f3bee80dedd41b5b1e78b4798c06a60";
const GOERLI_DEPLOY_ENDPOINT = "https://goerli.infura.io/v3/1f3bee80dedd41b5b1e78b4798c06a60";
const ALFAJORES_DEPLOY_ENDPOINT = "https://celo-alfajores.infura.io/v3/1f3bee80dedd41b5b1e78b4798c06a60";

const DimDogs_ContractAddresses = {
  linea: "0x574aA290F6A5D8b4181eF7c8dbC282eebEb1b3AF", goerli: "0x9d3BeEAC4026d41Ca2504189fB869C964b76B050",
  alfajores:  "0xC028dF898A418dDe242C6083e79a1e911fB8E10f"
};

dotenv.config();

// const projectId = process.env.INFURA_IPFS_PROJECT_ID;
// const projectSecret = process.env.INFURA_IPFS_PROJECT_SECRET;
const projectId = "2TzyEVfNzu86NNzLCpNU5ioRQmA"
const projectSecret = "35db911331c35d869cc84bbfbf577675"


console.log(projectId, projectSecret, "project id and secret");

const auth = 
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const infura_ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});


export const storeState = async (new_state) => {

  console.log("got into store state");

  try {
    let resp = await infura_ipfs.add({ path: "Users.json", content: JSON.stringify(new_state) })
    console.log(resp, "yeah yeahh");
    console.log(resp.cid.toString(), "yeah oh yahh cid")
    return resp.cid.toString();

    // return resp;
  } catch (err) {
    console.log(err, "error");
  }

  // try {
  //   let resp = await infura_ipfs.files.write("/test.json", JSON.stringify(state), { create: true })
  //   console.log(resp, "yeah yeahh");
  //   return resp;
  // } catch (err) {
  //   console.log(err, "error");
  // }
 
};


export const getState = async (CID) => {

  let jsonString = '';
  console.log("in the get")
  try { 
    for await (const chunk of infura_ipfs.cat(CID)) {
      console.info(chunk)
      jsonString += new TextDecoder().decode(chunk)
    }
  }
  catch (err) {
    console.log(err, "error");
  }
  console.log(jsonString, "json string");
  const state = JSON.parse(jsonString);
  return state;
}


const fetchCIDFromEvents = async (rpc, contract_address) => {


  try {
    let provider = new ethers.providers.JsonRpcProvider(rpc);
    const currentBlock = await provider.getBlockNumber();
    let contract = new ethers.Contract(contract_address, DimDogs_Abi, provider);
    let events = await contract.queryFilter('GlobalUserStateChange', currentBlock - 1000, currentBlock);
    let logs = events[events.length - 1]
    
    if (logs) {
      logs = logs.args
      console.log(logs, "logs");
      console.log(logs['new_ipfs_global_userstate_cid'], "doggo");
      return { cid: logs['new_ipfs_global_userstate_cid'], timestamp: logs['timestamp'] };
    }
    else {
      return { cid: null, timestamp: 0 };
    }
    
  }
  catch (err) {
    console.log(err, "error");
  }

}

export const fetchCIDFromAllChains = async () => {

  

  let linea = await fetchCIDFromEvents(LINEA_DEPLOY_ENDPOINT, DimDogs_ContractAddresses.linea);
  let goerli = await fetchCIDFromEvents(GOERLI_DEPLOY_ENDPOINT, DimDogs_ContractAddresses.goerli);
  let alfajores = await fetchCIDFromEvents(ALFAJORES_DEPLOY_ENDPOINT, DimDogs_ContractAddresses.alfajores);

  if (linea.cid == null && goerli.cid == null && alfajores.cid == null) {
    return null;
  }
  else {
    if (linea.timestamp > goerli.timestamp && linea.timestamp > alfajores.timestamp) {
      console.log(linea, "linea");
      return linea.cid;
    }
    else if (goerli.timestamp > linea.timestamp && goerli.timestamp > alfajores.timestamp) {
      console.log(goerli, "goerli");
      return goerli.cid;
    }
    else {
      console.log(alfajores, "alfajores");
      return alfajores.cid;
    }
  }

}

export const fetchUsers = async () => {

  // 
  let cid = await fetchCIDFromAllChains();
  if (cid == null) {
    // return null;
    const users = {
        username: {linea:"0x123", goerli: "0x123", alfajores: "0x123" }
      }
      return users;
  }
  let users = getState(cid);
  return users;
}

// client.pin.add("QmeGAVddnBSnKc1DLE7DLV9uuTqo5F7QbaveTjr45JUdQn").then((res) => {
//   console.log(res);
//   console.log("Pinned!");
// });