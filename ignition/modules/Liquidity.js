const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');

const DeployLiquidityModule = buildModule('DeployLiquidityModule', (m) => {
  // Deploy TokenA and TokenB
  const tokenA = m.contract('TokenA');
  const tokenB = m.contract('TokenB');

  // Deploy the Liquidity Pool contract with the addresses of TokenA and TokenB
  const liquidity = m.contract('Liquidity', [tokenA, tokenB]);

  return { tokenA, tokenB, liquidity };
});

module.exports = DeployLiquidityModule;
