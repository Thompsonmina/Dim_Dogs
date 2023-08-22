
import DimDogs_artefacts from '../out/DimDogs.sol/DimDogs.json'
// import { notification, notificationOff, format_to_wei, convertIterableToMap, delay } from "./utils";
import { storeState, getState, fetchUsers, fetchCIDFromAllChains} from "./user_management.js"


import { MetaMaskSDK } from '@metamask/sdk';
import { ethers } from "ethers";


const DimDogs_Abi = DimDogs_artefacts["abi"];
// const DimDogs_ContractAddress = "0xEF7b97eb0087Bcfb7C4c7f0410FBA5d74C9789fd";
const DimDogs_ContractAddresses = {
  linea: "0x574aA290F6A5D8b4181eF7c8dbC282eebEb1b3AF", goerli: "0x9d3BeEAC4026d41Ca2504189fB869C964b76B050",
  alfajores:  "0xC028dF898A418dDe242C6083e79a1e911fB8E10f"
};






const MMSDK = new MetaMaskSDK();
ethereum = MMSDK.getProvider(); // You can also access via window.ethereum


let signer;
let provider;
let current_address;
let doggo_contract;

const [linea_goerli, goerli, alfajores] = ["0xe704", "0x5", "0xaef3"];
const valid_chain_ids = [linea_goerli, goerli, alfajores]
const chain_ids_to_names = {}
chain_ids_to_names[linea_goerli] = "linea"
chain_ids_to_names[goerli] = "goerli"
chain_ids_to_names[alfajores] = "alfajores";

const chain_names_to_rpcs = {
  linea: "https://linea-goerli.infura.io/v3/1f3bee80dedd41b5b1e78b4798c06a60",
  goerli: "https://goerli.infura.io/v3/1f3bee80dedd41b5b1e78b4798c06a60",
  alfajores: "https://celo-alfajores.infura.io/v3/1f3bee80dedd41b5b1e78b4798c06a60"
}

const rpc_contract = async (rpc, contract_address) => {
  try {
    console.log("Before contract")
    let provider = new ethers.providers.JsonRpcProvider(rpc);
    let contract = new ethers.Contract(contract_address, DimDogs_Abi, provider);
    console.log("After contract", contract)
    return contract;
  }
  catch (err) {
      console.log(err, "error");
  }
  
}

const get_other_chain_doggos = async (global_users, username) => {
  let chain_names = Object.keys(global_users[username])
  console.log(chain_names, "chain_names")
  let other_doggos = {}
  for (let chain_name of chain_names) {
    let rpc = chain_names_to_rpcs[chain_name];
    let contract_address =  DimDogs_ContractAddresses[chain_name]

    let contract = await rpc_contract(rpc, contract_address);
    let doggos = await getDoggos(contract);

    let owneraddress = global_users[username][chain_name];
    doggos = doggos.filter(d => d.owner.toLowerCase() === owneraddress.toLowerCase());
    other_doggos[chain_name] = doggos;

  }
  return other_doggos;

}

const connectMetaMaskWallet = async function () {
    if (ethereum.isMetaMask) {

        // await notification("⚠️ Please approve this DApp to use it.")
        try {

            provider = new ethers.providers.Web3Provider(
                ethereum,
                "any"
            );
            console.log("here?");
            
            signer = provider.getSigner();
            console.log("passed finder")
           
        }
        catch (error) {
            // await notification(`⚠️ ${error}.`)
            console.error(error);
        }
    }
    else {
        // await notification("⚠️ Please install Metamask.")
        console.log("Please install Metamask.");
    }
}

function closeBanner() {
  document.getElementById('banner').style.display = 'none';
  document.getElementById('all_content').classList.remove('hidden');
}

async function onCreateDoggo(contract) {

  const name = document.getElementById('dog_name').value;

  // Log the name and cost to the console
  console.log('Name:', name);  
  try {

    // if (user_hash != null) {
    if (true) {
      await contract.create_doggo(name)
      
      // await notification(`🎉 You successfully added your task`)
      console.log("You have created a doggo!")

    } else {
      // await notification("You have to be verified to perform this action")
      console.log("You have to be verified to perform this action")
    }
  }
  catch (error) {
      // await notification(`⚠️ An error occured ${error}.`)
    console.log(`⚠️ An error occured ${error}.`)
  }

}

async function onClickConnect() {

  console.log("onClickConnect triggered.")
  // exit();
    try {
        let accounts = await ethereum.request({ method: 'eth_requestAccounts', params: [] });
        current_address = accounts[0];
        console.log(current_address);
    }
    catch (error) {
        console.error(error);
    }

    console.log("You are connected to MetaMask.");
    
    const chainId = await ethereum.request({
        method: "eth_chainId",
    });

    console.log(chainId);
    console.log(chain_ids_to_names);
    let chain = chain_ids_to_names[chainId.toString()]
    console.log(chain, "yeah");
    doggo_contract = new ethers.Contract(DimDogs_ContractAddresses[chain], DimDogs_Abi, signer);
    // console.log("not here ayee")
    console.log(doggo_contract, "wont work error")


    console.log("You will be switched to a chain that supports this dapp if you are not already on one.")
    if (!valid_chain_ids.includes(chainId)) {
        await forceSwitchNetwork(linea_goerli, "Linea", "https://rpc.goerli.linea.build", "https://goerli.lineascan.build/", "Ether", "ETH")
        // window.location.reload();
    } else {

        console.log("You are already on a supported chain.")
    }
    closeBanner();



    let contract = doggo_contract

    // handle authentication
    let global_users = await fetchUsers();
    checkAuthentication(chain, current_address, global_users)

    if (document.getElementById("auth-open")) {
      document.getElementById("auth-btn").addEventListener("click", () => { handleAuth(chain, current_address, global_users, contract)  });
   } 
  
  if (document.getElementById("associate-open")) {
    document.getElementById("associate-address-btn").addEventListener("click", () => { associateAddressOnAnotherChain(contract)   });
  } 



    // create doggo event listener
    document.getElementById('create-doggo-btn').addEventListener('click', () => { onCreateDoggo(doggo_contract) });


  
  // handle doggo actions
    await show_pets()
    document.querySelector("#holder").addEventListener("click", async (e) => {
      
      console.log("doggo actions", e)
      let contract = doggo_contract
      const index = e.target.dataset.index
      console.log(index)
          if (e.target.dataset.action == "feed") {
              try {
                  await contract
                      .feed_doggo(index)
    
                console.log("fed doggo")
                show_pets()
              }
              catch (error) {
                  // await notification(`${error}.`)
                  console.log(error)
              }
          }
    
          else if (e.target.dataset.action == "pet") {
              try {
                await contract
                    .pet_doggo(index)
    
              console.log("doggo is happy")
              show_pets()
            }
              catch (error) {
                  // await notification(`${error}.`)
              }
          }
    
          else if (e.target.dataset.action == "revive") {
    
              // if more time do a confimation pop up
              
            console.log(e.target.dataset.reviveprice)
    
              try {
                await contract
                  .revive(index, { value: ethers.utils.parseUnits(e.target.dataset.reviveprice.toString(), "wei") })
    
              console.log("doggo is revived")
              show_pets()
            }
              catch (error) {
                  // await notification(`${error}.`)
                console.log(error)
              }
          }
    
          else if (e.target.dataset.action == "bury") {
            try {
              await contract
                  .burn(index)
    
              console.log("doggo has gone to the great blockchain in the sky")
              show_pets()
              }
              catch (error) {
                  // await notification(`${error}.`)
              }
            }
      }
    // }
    )

}


async function handleNewNetwork() {
    const chainId = await ethereum.request({
      method: "eth_chainId",
    });
    if (!valid_chain_ids.includes(chainId)) {
        console.log("Your network is not supported. Please switch to Linea, Goerli or Alfajores.")
    }
  }

async function forceSwitchNetwork(chain_id, chain_name, rpc_url, block_explorer_url, native_currency_name, native_currency_symbol) {
    try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chain_id }], // Check networks.js for hexadecimal network ids
        });
      } catch (e) {
        if (e.code === 4902) {
          try {
            await ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: chain_id,
                  chainName: chain_name,
                  rpcUrls: [
                    rpc_url,
                  ],
                  nativeCurrency: {
                    name: native_currency_name,
                    symbol: native_currency_symbol,
                    decimals: 18,
                  },
                  blockExplorerUrls: [block_explorer_url],
                },
              ],
            });
          } catch (e) {
            console.log(e);
          }
        }
      }
}

async function renderProfileDetails(authenticated, username, global_users) {

  if (authenticated) {

    let other_doggos = await get_other_chain_doggos(global_users, username)
    document.querySelector("#profile-username").innerHTML = username;
    document.querySelector("#profile-chains").innerHTML = Object.keys(global_users[username]).join(", ");

    console.log(other_doggos, "other doggos")

    let all_doggos = 0;
    

    for (let chain of Object.keys(global_users[username])) {
      let dog_names = other_doggos[chain].map(obj => obj.name);
      document.querySelector(`#profile-${chain}-doggos`).innerHTML = dog_names.join(", ")
      all_doggos += other_doggos[chain].length;
    
    }
    
    document.querySelector("#profile-total-doggos").innerHTML = all_doggos;
    
  }
}

const format_data = (uri) => {
  let str = uri.split("base64,")[1];
  let buffer = Buffer.from(str, 'base64');

  // Decode the Buffer as a UTF-8 string
  const decodedString = buffer.toString('utf-8');

  return JSON.parse(decodedString.replaceAll("'", '"'));
}

const getDoggos = async function (contract) {
  let totalSupply = await doggo_contract.totalSupply();

  totalSupply = ethers.BigNumber.from(totalSupply).toNumber()
  console.log(totalSupply, "supply")
  const doggos = []

  for (let i = 0; i < Number(totalSupply); i++) {
    const doggo = new Promise(async (resolve) => {
      let meta = await contract.tokenURI(i);
      meta = format_data(meta);
      const owner = await contract.ownerOf(i);

      resolve({
        index: i,
        owner,
        name: meta.name,
        image: meta.image,
        last_fed: meta.last_fed,
        last_pet: meta.last_pet,
        power: meta.power,
        times_revived: meta.revivenum,
        revive_price: meta.reviveprice,
      });
    });
    doggos.push(doggo);
  }
  return Promise.all(doggos);
}


const renderDoggos = function (doggos, address, units) {
  console.log("rendering doggos")
  // console.log(doggos[0].owner, address)
  if (doggos) {
    let owners_doggos = doggos.filter(d => d.owner.toLowerCase() === address.toLowerCase())
    console.log(owners_doggos)

    document.getElementById("holder").innerHTML = ""

    owners_doggos.forEach((_dog) => {
      console.log(_dog)
      const newDiv = document.createElement("div")
      newDiv.className = "bg-white rounded-lg shadow-lg p-4 flex flex-col cursor-pointer"
   
      newDiv.innerHTML = dogviewTemplate(_dog, units)
      document.getElementById("holder").appendChild(newDiv)
    })
  }
}

function toggleDetails(element) {
  const detailsElement = element.querySelector('.details');
  detailsElement.classList.toggle('hidden');
}

const fetchUnitStates = async (contract) => {
  try {
    const stateUnit = await contract.state_unit();
    const deathUnit = await contract.death_unit();
    return { stateUnit: stateUnit, deathUnit: deathUnit };
  } catch (e) {
    throw e;
  }
};

const calc_percent = (time_of_last_action, units) => {
  const stateUnit = Number(units["stateUnit"]);
  const current = Math.round(Date.now() / 1000);

  const diff = stateUnit + Number(time_of_last_action) - current;

  if (diff < 0) return 0;
  else {
    return (diff / stateUnit) * 100;
  }
};

const is_dead = (last_fed, units) => {
  const deathUnit = Number(units["deathUnit"]);
  const current = Math.round(Date.now() / 1000);

  return deathUnit + Number(last_fed) < current;
};

const show_pets =  async () => {
  let units = await fetchUnitStates(doggo_contract);
  console.log("just beffore get doggos")
  let doggos = await getDoggos(doggo_contract, current_address);
   
  renderDoggos(doggos, current_address, units);
}


const handleAuth = async (chain, current_address, global_users, contract) => {

  const username = document.getElementById("username").value;

  console.log(username, "username")
  if (username && Object.keys(global_users).includes(username) && current_address === global_users[username][chain].toLowerCase()) {
    handleLogIn(username, global_users)
  }
  else if (username) {
    handleSignUp(username, global_users, chain, contract)
  } else {
    alert("Input a username in the field please");
  }

 }

const checkAuthentication = async (chain, current_address, global_users) => {

  let authenticated = false;
  let user_name = window.sessionStorage.getItem("DimDoggo_Username");
  console.log(user_name, "user_name")
  console.log(chain)

  if (user_name && Object.keys(global_users).includes(user_name) && current_address === global_users[user_name][chain].toLowerCase()) {
    
    console.log(current_address, "current_address")
    authenticated = true
  }

  renderNavbarAuthComponents(authenticated);
  renderProfileDetails(authenticated, user_name, global_users)

  // let username = document.getElementById("username").value;

  
}

const handleLogIn = async (username, global_users) => {

    window.sessionStorage.setItem("DimDoggo_Username", username);
    renderNavbarAuthComponents(true);  
    renderProfileDetails(true, username, global_users)

}

const associateAddressOnAnotherChain = async (contract) => {

  const username = window.sessionStorage.getItem("DimDoggo_Username");
  let global_users = await fetchUsers();
  let user = global_users[username];

  let already_associated_chains = Object.keys(user);
  let address = document.getElementById("associate-address").value;
  let selected_chain = document.getElementById("associate-chain").value;

  if (selected_chain && already_associated_chains.includes(selected_chain)) {
    alert("an address is already associated with this chain")

  } else if (!ethers.utils.isAddress(address)) {
    alert("address inputted is not valid")
    
  } else if (! already_associated_chains.includes(selected_chain) && ethers.utils.isAddress(address)) {
    try {

      
      global_users[username][selected_chain] = address;
      let c_id = await storeState(global_users);
      contract.associate_address(username, c_id, address);
    } catch (e) {
      console.log(e);
    } 
  }

  else {
    console.log("something went wrong maybe")
  }
}

const handleSignUp = async (username, global_users, chain, contract) => {

  // your current account will associated with this address on the blockchain. Please keep it safe.

  if (Object.keys(global_users).includes(username)) {
    alert("Username already taken");
  }
  else {
    try {

      global_users[username] = {}
      global_users[username][chain] = current_address;
      let c_id = await storeState(global_users);
      contract.create_user(username, c_id);
      handleLogIn(username, global_users)

    } catch (e) {
      console.log(e);
    }
    
  }  
}

const toggleMenuItems = (authenticated) => {
    if (authenticated) {
      return `
      <div class="nav-item cursor-pointer px-4 py-2 rounded-lg" id="associate-open" onclick="openModal('associateModal')">
                Associate another chain
      </div>
    <div class="nav-item cursor-pointer px-4 py-2 rounded-lg" id="profile-open" onclick="openModal('profileModal')">
                Profile
            </div>
    `;
    }
    else {
      return `
    <div class="nav-item cursor-pointer px-4 py-2 rounded-lg" id="auth-open" onclick="openModal('loginModal')">
      Create Account / Login
    </div>
    `;
    }
}

const renderNavbarAuthComponents = (authenticated) =>{
  
  console.log("got into renderNavbarAuthComponents")
  let menuItem = toggleMenuItems(authenticated);
  document.getElementById("menu-items").innerHTML = menuItem;
  }
  



// if (document.getElementById("profile-open")) {
  // document.getElementById("-btn").addEventListener("click", handleLogIn);

// }

const dogviewTemplate = (doggo, units) => {

  const alive_action_buttons = `
    <button class="retro-btn feed-btn px-4 py-2 rounded-lg font-bold" data-action="feed" data-index="${doggo.index}">Feed</button>

    <button class="retro-btn pet-btn px-4 py-2 rounded-lg font-bold" data-action="pet" data-index="${doggo.index}">Pet</button>
  `;

  const dead_action_buttons = `
    <button class="retro-btn bury-btn px-4 py-2 rounded-lg font-bold" data-action="bury" data-index="${doggo.index}"> Lay to Rest </button>
    <button class="retro-btn revive-btn px-4 py-2 rounded-lg font-bold" data-action="revive" data-index="${doggo.index}" data-reviveprice="${doggo.revive_price.toString()}">Revive  (${ethers.utils.formatEther(doggo.revive_price)} eth}</button>
  `;

  const action_buttons = is_dead(doggo.last_fed, units) ? dead_action_buttons : alive_action_buttons;
  const dog_fed = calc_percent(doggo.last_fed, units);
  const dog_pet = calc_percent(doggo.last_pet, units);
  console.log(dog_fed, dog_pet);

  return `
                <div class="bg-white rounded-lg shadow-md flex-1" onclick="toggleDetails(this)">
                    <img class="card-img w-full object-cover rounded-t-lg" src="${doggo.image}" alt="${doggo.name}">
                    <div class="p-4 text-center text-gray-700">
                        <h2>${doggo.name}</h2>
                    </div>
                    <!-- Extra Details -->
                    <div class="details hidden p-4">
                        <label class="text-lg font-bold">Happiness:</label>
                        <div class="retro-bar-bg w-full rounded-full h-4">
                            <div class="retro-bar-fg text-xs leading-none py-1 text-center text-white rounded-full h-full" style="width: ${dog_pet}%"></div>
                        </div>
                        <label class="text-lg font-bold">Hunger:</label>
                        <div class="retro-bar-bg w-full rounded-full h-4">
                            <div class="retro-bar-fg text-xs leading-none py-1 text-center text-white rounded-full h-full" style="width: ${dog_fed}%"></div>
                        </div>
                        <p class="text-lg font-bold">Power: ${doggo.power}</p>
                        <p class="text-lg font-bold">Number of times revived: ${doggo.times_revived}</p>
                    </div>
                </div>
                <div class="mt-4 buttons-container doggo-actions" id = "${doggo.index}">
                    ${action_buttons}
                </div>
            `;


}



// Top level event listeners

 // MetaMask event listeners
 ethereum.on("chainChanged", handleNewNetwork);
 ethereum.on("accountsChanged", () => {
     window.location.reload();
 });

document.getElementById('connect-btn').addEventListener('click', onClickConnect);

window.addEventListener("load", async () => {
    // await notification("⌛ Loading...");
  await connectMetaMaskWallet();

  await fetchCIDFromAllChains()


});


