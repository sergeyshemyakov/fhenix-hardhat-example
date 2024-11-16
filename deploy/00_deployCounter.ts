import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

/**
 * Deploys a contract named "Counter" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployCounter: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  if (hre.network.name === "hardhat" && process.argv.includes("deploy")) {
    console.warn("Warning: you are deploying to the in-process Hardhat network, but this network gets destroyed right after the deployment task ends.");
  }
  // Fund the account before deploying.
  if (hre.network.name === "localfhenix") {
    if ((await hre.ethers.provider.getBalance(deployer)) === 0n) {
      await hre.fhenixjs.getFunds(deployer);
      console.log("Received tokens from the local faucet. Ready to deploy...");
    }
  }

  // await deploy("Counter", {
  //   from: deployer,
  //   // Contract constructor arguments
  //   args: [],
  //   log: true,
  //   // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
  //   // automatically mining the contract deployment transaction. There is no effect on live networks.
  //   autoMine: true,
  // });

  await deploy("Spy", {
    from: deployer,
    // Contract constructor arguments
    args: [
      "0xabadc4402C14844431fC7521613b6922c7bdde80", 
      "0x70C3f7fd4c9bECA84c5e3Ff117e41c7219f7a84D",
      "0xe900053491381d51c343Cc799f177A7c7CEA5BE3",
      "0xcABEabea42780204dCB3E399CE9226f589Db3E4C",
      "0x98Ede4324cB3A413b620A0B0d3267Ee68202e581"
    ],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });
};

export default deployCounter;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags Counter
deployCounter.tags = ["Spy"];
