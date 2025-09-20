//SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
contract LiquidityPool is Ownable, ReentrancyGuard {

    using SafeERC20 for ERC20;

    uint256 public reserveA;
    uint256 public reserveB;
    uint public fee = 30; //0.3%
    uint constant FEE_DENOMINATOR = 10000;  

    event LiquidityAdded(address provider, uint amountA, uint amountB);
    event Swap(address trader, address tokenIn, uint amountIn, address tokenOut, uint amountOut);
    event FeeUpdated(uint newFee);
    event LiquidityRemoved(address provider, uint amountA, uint amountB);

    ERC20 public tokenA;
    ERC20 public tokenB;

    constructor(ERC20 _tokenA, ERC20 _tokenB) Ownable(msg.sender) {
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    //main liquidity functions
    function addLiquidity(uint amountA, uint amountB) external nonReentrant{
        require(amountA > 0 && amountB > 0, "invalid");
        tokenA.safeTransferFrom(msg.sender, address(this), amountA);
        tokenB.safeTransferFrom(msg.sender, address(this), amountB);
        reserveA += amountA;
        reserveB += amountB;
        emit LiquidityAdded(msg.sender, amountA, amountB);
    }
    function removeLiquidity(uint amountA, uint amountB) external nonReentrant{
        require(amountA > 0 && amountB > 0, "invalid");
        require(amountA <= reserveA && amountB <= reserveB, "invalid");
        reserveA -= amountA;
        tokenA.safeTransfer(msg.sender, amountA);
        reserveB -= amountB;
        tokenB.safeTransfer(msg.sender, amountB);
        emit LiquidityRemoved(msg.sender, amountA, amountB);
    }

    //basic swap A->B and B->A functions
    function swapAtoB(uint amountA) external nonReentrant{
        require(amountA > 0, "invalid");
        tokenA.safeTransferFrom(msg.sender, address(this), amountA);
        uint amountInWithFee = amountA * (FEE_DENOMINATOR - fee) / FEE_DENOMINATOR;
        uint amountOut = (amountInWithFee * reserveB )/(reserveA + amountInWithFee);
        require(amountOut > 0, "invalid");
        tokenB.safeTransfer(msg.sender, amountOut);
        reserveA += amountA;
        reserveB -= amountOut;
        emit Swap(msg.sender, address(tokenA), amountA, address(tokenB), amountOut);
    }
    function swapBtoA(uint amountB) external nonReentrant{
        require(amountB > 0, "invalid");
        tokenB.safeTransferFrom(msg.sender, address(this), amountB);
        uint amountInWithFee = amountB * (FEE_DENOMINATOR - fee) / FEE_DENOMINATOR;
        uint amountOut = (amountInWithFee * reserveA )/(reserveB + amountInWithFee);
        require(amountOut > 0, "invalid");
        tokenA.safeTransfer(msg.sender, amountOut);
        reserveA -= amountOut;
        reserveB += amountB;
        emit Swap(msg.sender, address(tokenB), amountB, address(tokenA), amountOut);
    }


    function setNewFee(uint newFee) external onlyOwner {
        require(newFee <= 1000, "invalid"); //max fee 10%
        fee = newFee;
        emit FeeUpdated(newFee);
    }
    function getReserves() external view returns (uint, uint) {
        return (reserveA, reserveB);
    }
}