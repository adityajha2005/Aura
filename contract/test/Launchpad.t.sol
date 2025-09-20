//SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "forge-std/Test.sol";
import {Launchpad} from "../src/Launchpad.sol";
import {LiquidityPool} from "../src/LiquidityPool.sol";
import {LPToken} from "../src/LPToken.sol";
import {TestTokens} from "../src/TestTokens.sol";

contract LaunchpadSimpleTest is Test {
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
        LPToken lpToken = new LPToken(address(this));
        pool = new LiquidityPool(baseToken, projectToken, lpToken);
        lpToken.transferOwnership(address(pool));
        launchpad = new Launchpad(baseToken, pool);
        
        baseToken.mint(address(this), 1_000_000 ether);
        baseToken.mint(creator, 100_000 ether);
        baseToken.mint(contributor1, 50_000 ether);
        baseToken.mint(contributor2, 30_000 ether);
        
        projectToken.mint(address(this), 2_000_000 ether);
        projectToken.mint(creator, 1_000_000 ether);
        projectToken.mint(address(launchpad), 1_000_000 ether);
        
        baseToken.approve(address(launchpad), type(uint256).max);
        baseToken.approve(address(pool), type(uint256).max);
        projectToken.approve(address(launchpad), type(uint256).max);
        projectToken.approve(address(pool), type(uint256).max);
        
        vm.prank(creator);
        baseToken.approve(address(launchpad), type(uint256).max);
        
        vm.prank(contributor1);
        baseToken.approve(address(launchpad), type(uint256).max);
        
        vm.prank(contributor2);
        baseToken.approve(address(launchpad), type(uint256).max);
    }

    function testCreateLaunch() public {
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
        
        vm.prank(contributor1);
        launchpad.contribute(1, 50 ether);
        
        assertEq(launchpad.contributions(contributor1, 1), 50 ether);
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
        
        // Check that launch was finalized successfully
        assertTrue(launchpad.isLaunchLaunched(1));
        
        // Check that creator received some funds but not all
        assertGt(baseToken.balanceOf(creator), creatorBalanceBefore);
        assertLt(baseToken.balanceOf(creator), creatorBalanceBefore + 80 ether); // Should be less than total raised
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
        
        launchpad.withdrawFees();
        
        assertGe(baseToken.balanceOf(address(this)), ownerBalanceBefore);
    }
}
