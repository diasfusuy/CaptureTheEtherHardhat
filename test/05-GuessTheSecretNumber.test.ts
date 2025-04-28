import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils } = ethers;

describe('GuessTheSecretNumberChallenge', () => {
  let target: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('GuessTheSecretNumberChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {
    const secretHash = await ethers.provider.getStorageAt(target.address, 0);

    let guessNumber = -1;

    for (let i = 0; i <= 255; i++) {
      const packed = ethers.utils.solidityPack(["uint8"], [i]);
      const hash = ethers.utils.keccak256(packed);

      if (hash == secretHash) {
        guessNumber = i;
        break;
      }
    }

    await target.connect(attacker).guess(guessNumber, {value: ethers.utils.parseEther("1")});

    expect(await target.isComplete()).to.equal(true);
  });
});
