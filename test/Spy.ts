/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from "chai";
import hre, { ethers, fhenixjs } from "hardhat";
import { Spy } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import {
  createPermissionForContract,
  getTokensFromFaucet,
} from "../utils/instance";

describe("Spy", function () {
  let signer: SignerWithAddress;

  let spy: Spy;
  let spyAddress: string;

  before(async () => {
    signer = (await ethers.getSigners())[0];
    // console.log(signer.address);
    // await getTokensFromFaucet(hre, signer.address);

    const spyFactory = await ethers.getContractFactory("Spy");
    spy = await spyFactory.deploy("0xabadc4402C14844431fC7521613b6922c7bdde80", 
      "0x70C3f7fd4c9bECA84c5e3Ff117e41c7219f7a84D",
      "0xe900053491381d51c343Cc799f177A7c7CEA5BE3",
      "0xcABEabea42780204dCB3E399CE9226f589Db3E4C",
      "0x98Ede4324cB3A413b620A0B0d3267Ee68202e581");
    await spy.waitForDeployment();
    spyAddress = await spy.getAddress();
  });

  describe("Deployment", function () {
    // it("Should deploy", async function () {
    //   const counterVal = await counter.getCounter();
    //   expect(await counter.getCounter()).to.equal(0n);
    // });

    it("should not set the requirement for the 0th checkpoint by Alice", async function () {
      const encToCount = await fhenixjs.encrypt_uint32(100);

      try {
        await spy.connect(signer).setSecretRequirement(0, encToCount);
      } catch (error: unknown) {
        expect((error as Error).message).to.equal(
            "execution reverted: Given checkpoint byte can not be accessed from this address",
          );
      }
    });

    it("should set the requirement by the 0th checkpoint (bob)", async function () {
        const encToCount = await fhenixjs.encrypt_uint32(100);
        signer = (await ethers.getSigners())[1];
        const tx = await spy.connect(signer).setSecretRequirement(0, encToCount);
        
        await expect(tx).to.emit(spy, "RequirementUpdated").withArgs("0x70C3f7fd4c9bECA84c5e3Ff117e41c7219f7a84D", 0);
    });
  });
});
