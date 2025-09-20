//SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "forge-std/Test.sol";
import {Launchpad} from "../src/Launchpad.sol";
import {LiquidityPool} from "../src/LiquidityPool.sol";
import {TestTokens} from "../src/TestTokens.sol";

contract LaunchpadTest is Test {
    Launchpad launchpad;
    LiquidityPool pool;
    TestTokens baseToken;
    TestTokens projectToken;
    address creator = address(0x1);
    address contributor1 = address(0x2);
    address contributor2 = address(0x3);

    function setUp() public {
        baseToken = new TestTokens("Base Token", "BASE");
        projectToken = new TestTokens("Project Token", "PROJ");
        pool = new LiquidityPool(baseToken, projectToken);
        launchpad = new Launchpad(baseToken, pool);
        
        baseToken.mint(address(this), 1_000_000 ether);
        baseToken.mint(creator, 100_000 ether);
        baseToken.mint(contributor1, 50_000 ether);
        baseToken.mint(contributor2, 30_000 ether);
        
        projectToken.mint(address(this), 2_000_000 ether);
        
        baseToken.approve(address(launchpad), type(uint256).max);
        vm.prank(creator);
        baseToken.approve(address(launchpad), type(uint256).max);
        vm.prank(contributor1);
        baseToken.approve(address(launchpad), type(uint256).max);
        vm.prank(contributor2);
        baseToken.approve(address(launchpad), type(uint256).max);
        
        projectToken.approve(address(launchpad), type(uint256).max);
        projectToken.transfer(address(launchpad), 2_000_000 ether); // More tokens for liquidity provision
        
        vm.prank(address(launchpad));
        projectToken.approve(address(pool), type(uint256).max);
    }

    function testCreateLaunch() public {
        uint256 launchFee = (1000 ether * 100 * 1000) / 10000;
        vm.deal(creator, launchFee);
        
        vm.deal(creator, launchFee);
        vm.prank(creator);
        launchpad.createLaunch{value: launchFee}(
            address(projectToken),
            1000 ether,
            100,
            10 ether,
            100 ether,
            7 days
        );
        
        assertEq(launchpad.launchCount(), 1);
        
        assertEq(launchpad.getLaunchToken(1), address(projectToken));
        assertEq(launchpad.getLaunchCreator(1), creator);
    }

    function testContributeToLaunch() public {
        uint256 launchFee = (1000 ether * 100 * 1000) / 10000;
        vm.deal(creator, launchFee);
        
        vm.prank(creator);
        launchpad.createLaunch{value: launchFee}(
            address(projectToken),
            1000 ether,
            100,
            10 ether,
            100 ether,
            7 days
        );
        
        uint256 contributionAmount = 50 ether;
        uint256 expectedTokens = contributionAmount / 100;
        
        uint256 contributorBalanceBefore = projectToken.balanceOf(contributor1);
        
        vm.prank(contributor1);
        launchpad.contribute(1, contributionAmount);
        
        assertEq(launchpad.contributions(contributor1, 1), contributionAmount);
        assertEq(projectToken.balanceOf(contributor1), contributorBalanceBefore + expectedTokens);
    }

    function testFinalizeLaunch() public {
        uint256 launchFee = (1000 ether * 100 * 1000) / 10000;
        vm.deal(creator, launchFee);
        
        vm.prank(creator);
        launchpad.createLaunch{value: launchFee}(
            address(projectToken),
            1000 ether,
            100,
            10 ether,
            100 ether,
            7 days
        );
        
        vm.prank(contributor1);
        launchpad.contribute(1, 50 ether);
        
        vm.prank(contributor2);
        launchpad.contribute(1, 30 ether);
        
        vm.warp(block.timestamp + 8 days);
        
        uint256 creatorBalanceBefore = baseToken.balanceOf(creator);
        
        vm.prank(creator);
        launchpad.finalizeLaunch(1);
        
        assertTrue(launchpad.isLaunchLaunched(1));
        assertGt(baseToken.balanceOf(creator), creatorBalanceBefore);
    }

    function testCancelLaunch() public {
        uint256 launchFee = (1000 ether * 100 * 1000) / 10000;
        vm.deal(creator, launchFee);
        
        vm.prank(creator);
        launchpad.createLaunch{value: launchFee}(
            address(projectToken),
            1000 ether,
            100,
            10 ether,
            100 ether,
            7 days
        );
        
        vm.prank(creator);
        launchpad.cancelLaunch(1);
        
        assertTrue(launchpad.isLaunchCancelled(1));
        assertFalse(launchpad.isLaunchLaunched(1));
    }

    function testContributionLimits() public {
        uint256 launchFee = (1000 ether * 100 * 1000) / 10000;
        vm.deal(creator, launchFee);
        
        vm.prank(creator);
        launchpad.createLaunch{value: launchFee}(
            address(projectToken),
            1000 ether,
            100,
            10 ether,
            100 ether,
            7 days
        );
        
        vm.prank(contributor1);
        vm.expectRevert(bytes("below minimum"));
        launchpad.contribute(1, 5 ether);
        
        vm.prank(contributor1);
        vm.expectRevert(bytes("above maximum"));
        launchpad.contribute(1, 200 ether);
    }

    function testLaunchTiming() public {
        uint256 launchFee = (1000 ether * 100 * 1000) / 10000;
        vm.deal(creator, launchFee);
        
        vm.prank(creator);
        launchpad.createLaunch{value: launchFee}(
            address(projectToken),
            1000 ether,
            100,
            10 ether,
            100 ether,
            7 days
        );
        
        vm.warp(block.timestamp - 1);
        vm.prank(contributor1);
        vm.expectRevert(bytes("not started"));
        launchpad.contribute(1, 50 ether);
        
        vm.warp(block.timestamp + 8 days);
        vm.prank(contributor1);
        vm.expectRevert(bytes("ended"));
        launchpad.contribute(1, 50 ether);
    }

    function testInsufficientLaunchFee() public {
        vm.deal(creator, 1000);
        vm.prank(creator);
        vm.expectRevert(bytes("insufficient fee"));
        launchpad.createLaunch{value: 1000}(
            address(projectToken),
            1000 ether,
            100,
            10 ether,
            100 ether,
            7 days
        );
    }

    function testDoubleFinalize() public {
        uint256 launchFee = (1000 ether * 100 * 1000) / 10000;
        vm.deal(creator, launchFee);
        
        vm.prank(creator);
        launchpad.createLaunch{value: launchFee}(
            address(projectToken),
            1000 ether,
            100,
            10 ether,
            100 ether,
            7 days
        );
        
        vm.prank(contributor1);
        launchpad.contribute(1, 50 ether);
        
        vm.warp(block.timestamp + 8 days);
        
        vm.prank(creator);
        launchpad.finalizeLaunch(1);
        
        vm.prank(creator);
        vm.expectRevert(bytes("already launched"));
        launchpad.finalizeLaunch(1);
    }

    function testWithdrawFees() public {
        uint256 launchFee = (1000 ether * 100 * 1000) / 10000;
        vm.deal(creator, launchFee);
        
        vm.prank(creator);
        launchpad.createLaunch{value: launchFee}(
            address(projectToken),
            1000 ether,
            100,
            10 ether,
            100 ether,
            7 days
        );
        
        uint256 ownerBalanceBefore = baseToken.balanceOf(address(this));
        uint256 launchpadBalanceBefore = baseToken.balanceOf(address(launchpad));
        
        launchpad.withdrawFees();
        
        assertEq(baseToken.balanceOf(address(launchpad)), 0);
        assertEq(baseToken.balanceOf(address(this)), ownerBalanceBefore + launchpadBalanceBefore);
    }

    function testMultipleLaunches() public {
        uint256 launchFee1 = (1000 ether * 100 * 1000) / 10000;
        uint256 launchFee2 = (2000 ether * 200 * 1000) / 10000;
        
        vm.deal(creator, launchFee1);
        vm.deal(contributor1, launchFee2);
        
        vm.prank(creator);
        launchpad.createLaunch{value: launchFee1}(
            address(projectToken),
            1000 ether,
            100,
            10 ether,
            100 ether,
            7 days
        );
        
        vm.prank(contributor1);
        launchpad.createLaunch{value: launchFee2}(
            address(baseToken),
            2000 ether,
            200,
            20 ether,
            200 ether,
            14 days
        );
        
        assertEq(launchpad.launchCount(), 2);
        
        assertEq(launchpad.getLaunchToken(1), address(projectToken));
        assertEq(launchpad.getLaunchToken(2), address(baseToken));
    }

    function testLiquidityLocking() public {
        uint256 launchFee = (1000 ether * 1 ether * 1000) / 10000;
        vm.deal(creator, launchFee);
        
        vm.prank(creator);
        launchpad.createLaunch{value: launchFee}(
            address(projectToken),
            1000 ether,
            1 ether, // 1 ether per token (more reasonable price)
            10 ether,
            100 ether,
            7 days
        );
        
        // Contribute to the launch
        vm.prank(contributor1);
        launchpad.contribute(1, 50 ether);
        
        vm.prank(contributor2);
        launchpad.contribute(1, 30 ether);
        
        
        // Finalize the launch
        vm.warp(block.timestamp + 8 days);
        
        uint256 creatorBalanceBefore = baseToken.balanceOf(creator);
        
        vm.prank(creator);
        launchpad.finalizeLaunch(1);
        
        // Check that liquidity is locked
        assertTrue(launchpad.isLiquidityLocked(1));
        
        // Check liquidity lock info
        (address poolAddress, uint256 lockTime, bool isLocked, bool canUnlock) = launchpad.getLiquidityLockInfo(1);
        assertTrue(poolAddress != address(0));
        assertTrue(lockTime > block.timestamp);
        assertTrue(isLocked);
        assertFalse(canUnlock);
        
        // Check that creator received some funds but not all
        assertGt(baseToken.balanceOf(creator), creatorBalanceBefore);
        assertLt(baseToken.balanceOf(creator), creatorBalanceBefore + 80 ether); // Should be less than total raised
    }

    function testLiquidityUnlockAfterPeriod() public {
        uint256 launchFee = (1000 ether * 100 * 1000) / 10000;
        vm.deal(creator, launchFee);
        
        vm.prank(creator);
        launchpad.createLaunch{value: launchFee}(
            address(projectToken),
            1000 ether,
            100,
            10 ether,
            100 ether,
            7 days
        );
        
        // Contribute and finalize
        vm.prank(contributor1);
        launchpad.contribute(1, 50 ether);
        
        vm.warp(block.timestamp + 8 days);
        vm.prank(creator);
        launchpad.finalizeLaunch(1);
        
        // Check that liquidity is locked
        assertTrue(launchpad.isLiquidityLocked(1));
        
        // Fast forward past lock period
        vm.warp(block.timestamp + 366 days);
        
        // Check that liquidity can now be unlocked
        (, , , bool canUnlock) = launchpad.getLiquidityLockInfo(1);
        assertTrue(canUnlock);
        
        // Unlock liquidity
        vm.prank(creator);
        launchpad.unlockLiquidity(1);
        
        // Check that liquidity is no longer locked
        assertFalse(launchpad.isLiquidityLocked(1));
    }

    function testLiquidityUnlockBeforePeriodReverts() public {
        uint256 launchFee = (1000 ether * 100 * 1000) / 10000;
        vm.deal(creator, launchFee);
        
        vm.prank(creator);
        launchpad.createLaunch{value: launchFee}(
            address(projectToken),
            1000 ether,
            100,
            10 ether,
            100 ether,
            7 days
        );
        
        // Contribute and finalize
        vm.prank(contributor1);
        launchpad.contribute(1, 50 ether);
        
        vm.warp(block.timestamp + 8 days);
        vm.prank(creator);
        launchpad.finalizeLaunch(1);
        
        // Try to unlock before lock period expires
        vm.prank(creator);
        vm.expectRevert(bytes("still locked"));
        launchpad.unlockLiquidity(1);
    }

    function testNonCreatorCannotUnlockLiquidity() public {
        uint256 launchFee = (1000 ether * 100 * 1000) / 10000;
        vm.deal(creator, launchFee);
        
        vm.prank(creator);
        launchpad.createLaunch{value: launchFee}(
            address(projectToken),
            1000 ether,
            100,
            10 ether,
            100 ether,
            7 days
        );
        
        // Contribute and finalize
        vm.prank(contributor1);
        launchpad.contribute(1, 50 ether);
        
        vm.warp(block.timestamp + 8 days);
        vm.prank(creator);
        launchpad.finalizeLaunch(1);
        
        // Fast forward past lock period
        vm.warp(block.timestamp + 366 days);
        
        // Try to unlock as non-creator
        vm.prank(contributor1);
        vm.expectRevert(bytes("not creator"));
        launchpad.unlockLiquidity(1);
    }

    function testEmergencyUnlockLiquidity() public {
        uint256 launchFee = (1000 ether * 100 * 1000) / 10000;
        vm.deal(creator, launchFee);
        
        vm.prank(creator);
        launchpad.createLaunch{value: launchFee}(
            address(projectToken),
            1000 ether,
            100,
            10 ether,
            100 ether,
            7 days
        );
        
        // Contribute and finalize
        vm.prank(contributor1);
        launchpad.contribute(1, 50 ether);
        
        vm.warp(block.timestamp + 8 days);
        vm.prank(creator);
        launchpad.finalizeLaunch(1);
        
        // Check that liquidity is locked
        assertTrue(launchpad.isLiquidityLocked(1));
        
        // Emergency unlock by owner
        launchpad.emergencyUnlockLiquidity(1);
        
        // Check that liquidity is no longer locked
        assertFalse(launchpad.isLiquidityLocked(1));
    }

    function testNonOwnerCannotEmergencyUnlock() public {
        uint256 launchFee = (1000 ether * 100 * 1000) / 10000;
        vm.deal(creator, launchFee);
        
        vm.prank(creator);
        launchpad.createLaunch{value: launchFee}(
            address(projectToken),
            1000 ether,
            100,
            10 ether,
            100 ether,
            7 days
        );
        
        // Contribute and finalize
        vm.prank(contributor1);
        launchpad.contribute(1, 50 ether);
        
        vm.warp(block.timestamp + 8 days);
        vm.prank(creator);
        launchpad.finalizeLaunch(1);
        
        // Try to emergency unlock as non-owner
        vm.prank(contributor1);
        vm.expectRevert();
        launchpad.emergencyUnlockLiquidity(1);
    }

    function testLiquidityPoolCreation() public {
        uint256 launchFee = (1000 ether * 100 * 1000) / 10000;
        vm.deal(creator, launchFee);
        
        vm.prank(creator);
        launchpad.createLaunch{value: launchFee}(
            address(projectToken),
            1000 ether,
            100,
            10 ether,
            100 ether,
            7 days
        );
        
        // Contribute and finalize
        vm.prank(contributor1);
        launchpad.contribute(1, 50 ether);
        
        vm.warp(block.timestamp + 8 days);
        vm.prank(creator);
        launchpad.finalizeLaunch(1);
        
        // Check that a liquidity pool was created
        (address poolAddress, , , ) = launchpad.getLiquidityLockInfo(1);
        assertTrue(poolAddress != address(0));
        
        // Check that the pool has liquidity
        LiquidityPool newPool = LiquidityPool(poolAddress);
        (uint256 reserveA, uint256 reserveB) = newPool.getReserves();
        assertGt(reserveA, 0);
        assertGt(reserveB, 0);
    }
}
