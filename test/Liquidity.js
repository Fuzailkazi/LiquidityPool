const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Liquidity Pool Contract', function () {
  let TokenA, TokenB, LiquidityPool;
  let tokenA, tokenB, liquidityPool;
  let owner, user1, user2;
  const initialSupply = ethers.utils.parseEther('1000000');
  const liquidityAmount = ethers.utils.parseEther('500');

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy TokenA and TokenB
    TokenA = await ethers.getContractFactory('TokenA');
    TokenB = await ethers.getContractFactory('TokenB');

    tokenA = await TokenA.deploy(initialSupply);
    tokenB = await TokenB.deploy(initialSupply);

    await tokenA.deployed();
    await tokenB.deployed();

    // Deploy Liquidity Pool contract
    LiquidityPool = await ethers.getContractFactory('Liquidity');
    liquidityPool = await LiquidityPool.deploy(tokenA.address, tokenB.address);

    await liquidityPool.deployed();

    // Distribute tokens to users for testing
    await tokenA.transfer(user1.address, ethers.utils.parseEther('1000'));
    await tokenB.transfer(user1.address, ethers.utils.parseEther('1000'));
  });

  it('Should add liquidity correctly', async function () {
    await tokenA.connect(user1).approve(liquidityPool.address, liquidityAmount);
    await tokenB.connect(user1).approve(liquidityPool.address, liquidityAmount);

    await liquidityPool
      .connect(user1)
      .addLiquidity(liquidityAmount, liquidityAmount);

    const poolTokenABalance = await tokenA.balanceOf(liquidityPool.address);
    const poolTokenBBalance = await tokenB.balanceOf(liquidityPool.address);

    expect(poolTokenABalance).to.equal(liquidityAmount);
    expect(poolTokenBBalance).to.equal(liquidityAmount);
  });

  it('Should swap TokenA for TokenB correctly', async function () {
    await tokenA.connect(user1).approve(liquidityPool.address, liquidityAmount);
    await tokenB.connect(user1).approve(liquidityPool.address, liquidityAmount);

    await liquidityPool
      .connect(user1)
      .addLiquidity(liquidityAmount, liquidityAmount);

    const swapAmount = ethers.utils.parseEther('50');
    await tokenA.connect(user1).approve(liquidityPool.address, swapAmount);

    await liquidityPool.connect(user1).swapTokenAForTokenB(swapAmount);

    const userTokenBBalance = await tokenB.balanceOf(user1.address);
    expect(userTokenBBalance).to.be.above(ethers.utils.parseEther('950'));
  });

  it('Should remove liquidity correctly', async function () {
    await tokenA.connect(user1).approve(liquidityPool.address, liquidityAmount);
    await tokenB.connect(user1).approve(liquidityPool.address, liquidityAmount);

    await liquidityPool
      .connect(user1)
      .addLiquidity(liquidityAmount, liquidityAmount);

    await liquidityPool.connect(user1).removeLiquidity(liquidityAmount.div(2));

    const userTokenABalance = await tokenA.balanceOf(user1.address);
    const userTokenBBalance = await tokenB.balanceOf(user1.address);

    expect(userTokenABalance).to.be.above(ethers.utils.parseEther('750'));
    expect(userTokenBBalance).to.be.above(ethers.utils.parseEther('750'));
  });
});
