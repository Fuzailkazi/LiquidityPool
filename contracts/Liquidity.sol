// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenA is ERC20 {
    constructor() ERC20("TokenA", "TKA") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}

contract TokenB is ERC20 {
    constructor() ERC20("TokenB", "TKB") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}

contract Liquidity {
    IERC20 public tokenA;
    IERC20 public tokenB;

    uint256 public reserveA;
    uint256 public reserveB;

    mapping(address => uint256) public liquidity;
    uint256 public totalLiquidity;

    constructor(address _tokenA, address _tokenB) {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    function addLiquidity(uint256 _amountA, uint256 _amountB) public {
        require(_amountA > 0 && _amountB > 0, "Invalid amounts");

        tokenA.transferFrom(msg.sender, address(this), _amountA);
        tokenB.transferFrom(msg.sender, address(this), _amountB);

        uint256 liquidityMinted = (_amountA + _amountB);
        liquidity[msg.sender] += liquidityMinted;
        totalLiquidity += liquidityMinted;

        reserveA += _amountA;
        reserveB += _amountB;
    }

    function removeLiquidity(uint256 _liquidity) public {
        require(_liquidity > 0 && _liquidity <= liquidity[msg.sender], "Invalid liquidity amount");

        uint256 amountA = (_liquidity * reserveA) / totalLiquidity;
        uint256 amountB = (_liquidity * reserveB) / totalLiquidity;

        liquidity[msg.sender] -= _liquidity;
        totalLiquidity -= _liquidity;

        reserveA -= amountA;
        reserveB -= amountB;

        tokenA.transfer(msg.sender, amountA);
        tokenB.transfer(msg.sender, amountB);
    }

    function swapTokenAForTokenB(uint256 _amountA) public {
        require(_amountA > 0 && _amountA <= reserveA, "Invalid swap amount");

        uint256 amountB = getSwapAmount(_amountA, reserveA, reserveB);
        tokenA.transferFrom(msg.sender, address(this), _amountA);
        tokenB.transfer(msg.sender, amountB);

        reserveA += _amountA;
        reserveB -= amountB;
    }

    function swapTokenBForTokenA(uint256 _amountB) public {
        require(_amountB > 0 && _amountB <= reserveB, "Invalid swap amount");

        uint256 amountA = getSwapAmount(_amountB, reserveB, reserveA);
        tokenB.transferFrom(msg.sender, address(this), _amountB);
        tokenA.transfer(msg.sender, amountA);

        reserveA -= amountA;
        reserveB += _amountB;
    }

    function getSwapAmount(uint256 _amountIn, uint256 _reserveIn, uint256 _reserveOut) public pure returns (uint256) {
        uint256 amountInWithFee = _amountIn * 997; // 0.3% fee
        return (amountInWithFee * _reserveOut) / (_reserveIn * 1000 + amountInWithFee);
    }
}


