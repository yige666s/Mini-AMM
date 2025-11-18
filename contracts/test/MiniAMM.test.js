const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MiniAMM", function () {
  let miniAMM, tokenA, tokenB;
  let owner, user1, user2, bot;
  
  const INITIAL_SUPPLY = ethers.parseEther("1000000");
  const LIQUIDITY_A = ethers.parseEther("10000");
  const LIQUIDITY_B = ethers.parseEther("10000");
  
  beforeEach(async function () {
    [owner, user1, user2, bot] = await ethers.getSigners();
    
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    tokenA = await MockERC20.deploy("Token A", "TKA", INITIAL_SUPPLY);
    tokenB = await MockERC20.deploy("Token B", "TKB", INITIAL_SUPPLY);
    
    const MiniAMM = await ethers.getContractFactory("MiniAMM");
    miniAMM = await MiniAMM.deploy(await tokenA.getAddress(), await tokenB.getAddress());
    
    await tokenA.transfer(user1.address, ethers.parseEther("100000"));
    await tokenA.transfer(user2.address, ethers.parseEther("100000"));
    await tokenB.transfer(user1.address, ethers.parseEther("100000"));
    await tokenB.transfer(user2.address, ethers.parseEther("100000"));
  });
  
  describe("部署", function () {
    it("应该正确设置 token 地址", async function () {
      expect(await miniAMM.tokenA()).to.equal(await tokenA.getAddress());
      expect(await miniAMM.tokenB()).to.equal(await tokenB.getAddress());
    });
    
    it("应该设置部署者为 bot", async function () {
      expect(await miniAMM.bot()).to.equal(owner.address);
    });
  });
  
  describe("添加流动性", function () {
    it("应该能添加初始流动性", async function () {
      await tokenA.approve(await miniAMM.getAddress(), LIQUIDITY_A);
      await tokenB.approve(await miniAMM.getAddress(), LIQUIDITY_B);
      
      const tx = await miniAMM.addLiquidity(LIQUIDITY_A, LIQUIDITY_B);
      const receipt = await tx.wait();
      
      expect(receipt.status).to.equal(1);
      
      const reserves = await miniAMM.getReserves();
      expect(reserves[0]).to.equal(LIQUIDITY_A);
      expect(reserves[1]).to.equal(LIQUIDITY_B);
    });
    
    it("应该铸造正确数量的 LP token", async function () {
      await tokenA.approve(await miniAMM.getAddress(), LIQUIDITY_A);
      await tokenB.approve(await miniAMM.getAddress(), LIQUIDITY_B);
      
      await miniAMM.addLiquidity(LIQUIDITY_A, LIQUIDITY_B);
      
      const balance = await miniAMM.balanceOf(owner.address);
      expect(balance).to.be.gt(0);
    });
    
    it("应该触发 Mint 事件", async function () {
      await tokenA.approve(await miniAMM.getAddress(), LIQUIDITY_A);
      await tokenB.approve(await miniAMM.getAddress(), LIQUIDITY_B);
      
      await expect(miniAMM.addLiquidity(LIQUIDITY_A, LIQUIDITY_B))
        .to.emit(miniAMM, "Mint");
    });
  });
  
  describe("移除流动性", function () {
    beforeEach(async function () {
      await tokenA.approve(await miniAMM.getAddress(), LIQUIDITY_A);
      await tokenB.approve(await miniAMM.getAddress(), LIQUIDITY_B);
      await miniAMM.addLiquidity(LIQUIDITY_A, LIQUIDITY_B);
    });
    
    it("应该能移除流动性", async function () {
      const lpBalance = await miniAMM.balanceOf(owner.address);
      
      const tx = await miniAMM.removeLiquidity(lpBalance);
      const receipt = await tx.wait();
      
      expect(receipt.status).to.equal(1);
    });
    
    it("应该返回正确比例的 tokens", async function () {
      const lpBalance = await miniAMM.balanceOf(owner.address);
      
      const balanceABefore = await tokenA.balanceOf(owner.address);
      const balanceBBefore = await tokenB.balanceOf(owner.address);
      
      await miniAMM.removeLiquidity(lpBalance);
      
      const balanceAAfter = await tokenA.balanceOf(owner.address);
      const balanceBAfter = await tokenB.balanceOf(owner.address);
      
      expect(balanceAAfter).to.be.gt(balanceABefore);
      expect(balanceBAfter).to.be.gt(balanceBBefore);
    });
    
    it("应该触发 Burn 事件", async function () {
      const lpBalance = await miniAMM.balanceOf(owner.address);
      
      await expect(miniAMM.removeLiquidity(lpBalance))
        .to.emit(miniAMM, "Burn");
    });
  });
  
  describe("交换", function () {
    beforeEach(async function () {
      await tokenA.approve(await miniAMM.getAddress(), LIQUIDITY_A);
      await tokenB.approve(await miniAMM.getAddress(), LIQUIDITY_B);
      await miniAMM.addLiquidity(LIQUIDITY_A, LIQUIDITY_B);
    });
    
    it("应该能从 A 交换到 B", async function () {
      const swapAmount = ethers.parseEther("100");
      
      await tokenA.connect(user1).approve(await miniAMM.getAddress(), swapAmount);
      
      const balanceBBefore = await tokenB.balanceOf(user1.address);
      
      await miniAMM.connect(user1).swap(swapAmount, true);
      
      const balanceBAfter = await tokenB.balanceOf(user1.address);
      expect(balanceBAfter).to.be.gt(balanceBBefore);
    });
    
    it("应该能从 B 交换到 A", async function () {
      const swapAmount = ethers.parseEther("100");
      
      await tokenB.connect(user1).approve(await miniAMM.getAddress(), swapAmount);
      
      const balanceABefore = await tokenA.balanceOf(user1.address);
      
      await miniAMM.connect(user1).swap(swapAmount, false);
      
      const balanceAAfter = await tokenA.balanceOf(user1.address);
      expect(balanceAAfter).to.be.gt(balanceABefore);
    });
    
    it("应该收取 0.3% 手续费", async function () {
      const swapAmount = ethers.parseEther("1000");
      
      await tokenA.connect(user1).approve(await miniAMM.getAddress(), swapAmount);
      
      const feesBefore = await miniAMM.getFees();
      
      await miniAMM.connect(user1).swap(swapAmount, true);
      
      const feesAfter = await miniAMM.getFees();
      
      expect(feesAfter[0]).to.be.gt(feesBefore[0]);
    });
    
    it("应该触发 Swap 事件", async function () {
      const swapAmount = ethers.parseEther("100");
      
      await tokenA.connect(user1).approve(await miniAMM.getAddress(), swapAmount);
      
      await expect(miniAMM.connect(user1).swap(swapAmount, true))
        .to.emit(miniAMM, "Swap");
    });
    
    it("预估输出应该与实际输出匹配", async function () {
      const swapAmount = ethers.parseEther("100");
      
      const expectedOut = await miniAMM.getAmountOut(swapAmount, true);
      
      await tokenA.connect(user1).approve(await miniAMM.getAddress(), swapAmount);
      
      const balanceBBefore = await tokenB.balanceOf(user1.address);
      
      await miniAMM.connect(user1).swap(swapAmount, true);
      
      const balanceBAfter = await tokenB.balanceOf(user1.address);
      const actualOut = balanceBAfter - balanceBBefore;
      
      expect(actualOut).to.equal(expectedOut);
    });
  });
  
  describe("手续费复投", function () {
    beforeEach(async function () {
      await tokenA.approve(await miniAMM.getAddress(), LIQUIDITY_A);
      await tokenB.approve(await miniAMM.getAddress(), LIQUIDITY_B);
      await miniAMM.addLiquidity(LIQUIDITY_A, LIQUIDITY_B);
      
      const swapAmount = ethers.parseEther("1000");
      await tokenA.connect(user1).approve(await miniAMM.getAddress(), swapAmount);
      await miniAMM.connect(user1).swap(swapAmount, true);
    });
    
    it("只有 bot 能调用 compoundFees", async function () {
      await expect(
        miniAMM.connect(user1).compoundFees()
      ).to.be.revertedWith("Only bot");
    });
    
    it("应该能复投累积的手续费", async function () {
      const feesBefore = await miniAMM.getFees();
      expect(feesBefore[0]).to.be.gt(0);
      
      const tx = await miniAMM.compoundFees();
      const receipt = await tx.wait();
      
      expect(receipt.status).to.equal(1);
      
      const feesAfter = await miniAMM.getFees();
      expect(feesAfter[0]).to.be.lt(feesBefore[0]);
    });
    
    it("应该增加流动性", async function () {
      const reservesBefore = await miniAMM.getReserves();
      
      await miniAMM.compoundFees();
      
      const reservesAfter = await miniAMM.getReserves();
      
      expect(reservesAfter[0]).to.be.gt(reservesBefore[0]);
      expect(reservesAfter[1]).to.be.gt(reservesBefore[1]);
    });
    
    it("应该给 bot 铸造 LP token", async function () {
      const lpBalanceBefore = await miniAMM.balanceOf(owner.address);
      
      await miniAMM.compoundFees();
      
      const lpBalanceAfter = await miniAMM.balanceOf(owner.address);
      
      expect(lpBalanceAfter).to.be.gt(lpBalanceBefore);
    });
  });
  
  describe("再平衡", function () {
    beforeEach(async function () {
      await tokenA.approve(await miniAMM.getAddress(), LIQUIDITY_A);
      await tokenB.approve(await miniAMM.getAddress(), LIQUIDITY_B);
      await miniAMM.addLiquidity(LIQUIDITY_A, LIQUIDITY_B);
    });
    
    it("只有 bot 能调用 rebalance", async function () {
      const rebalanceAmount = ethers.parseEther("100");
      
      await expect(
        miniAMM.connect(user1).rebalance(rebalanceAmount, true)
      ).to.be.revertedWith("Only bot");
    });
    
    it("应该能执行再平衡", async function () {
      const rebalanceAmount = ethers.parseEther("100");
      
      await tokenA.transfer(await miniAMM.getAddress(), rebalanceAmount);
      
      const tx = await miniAMM.rebalance(rebalanceAmount, true);
      const receipt = await tx.wait();
      
      expect(receipt.status).to.equal(1);
    });
    
    it("应该触发 Rebalance 事件", async function () {
      const rebalanceAmount = ethers.parseEther("100");
      
      await tokenA.transfer(await miniAMM.getAddress(), rebalanceAmount);
      
      await expect(miniAMM.rebalance(rebalanceAmount, true))
        .to.emit(miniAMM, "Rebalance");
    });
  });
  
  describe("价格查询", function () {
    beforeEach(async function () {
      await tokenA.approve(await miniAMM.getAddress(), LIQUIDITY_A);
      await tokenB.approve(await miniAMM.getAddress(), LIQUIDITY_B);
      await miniAMM.addLiquidity(LIQUIDITY_A, LIQUIDITY_B);
    });
    
    it("应该返回正确的价格", async function () {
      const price = await miniAMM.getPrice();
      
      const expectedPrice = ethers.parseEther("1");
      expect(price).to.equal(expectedPrice);
    });
    
    it("价格应该随交换变化", async function () {
      const priceBefore = await miniAMM.getPrice();
      
      const swapAmount = ethers.parseEther("1000");
      await tokenA.connect(user1).approve(await miniAMM.getAddress(), swapAmount);
      await miniAMM.connect(user1).swap(swapAmount, true);
      
      const priceAfter = await miniAMM.getPrice();
      
      expect(priceAfter).to.not.equal(priceBefore);
    });
  });
  
  describe("Bot 管理", function () {
    it("应该能更新 bot 地址", async function () {
      await miniAMM.setBot(bot.address);
      expect(await miniAMM.bot()).to.equal(bot.address);
    });
    
    it("只有当前 bot 能更新 bot 地址", async function () {
      await expect(
        miniAMM.connect(user1).setBot(bot.address)
      ).to.be.revertedWith("Only current bot");
    });
    
    it("应该触发 BotUpdated 事件", async function () {
      await expect(miniAMM.setBot(bot.address))
        .to.emit(miniAMM, "BotUpdated")
        .withArgs(owner.address, bot.address);
    });
  });
});
