import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

describe('DeployAContract', () => {
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;
  let target: Contract;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();
    const TargetFfactory = await ethers.getContractFactory('DeployChallenge', deployer);
    target = await TargetFfactory.deploy();
    await target.deployed();
  });

  it('exploit', async () => {

    expect(await target.isComplete()).to.equal(true);
  });
});
