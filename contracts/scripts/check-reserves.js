const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("\n=================================");
  console.log("池子状态检查");
  console.log("=================================\n");

  // 从部署文件读取合约地址
  const deploymentPath = "./deployments/deployed-contracts.json";
  let addresses;
  
  try {
    addresses = require(deploymentPath);
  } catch (error) {
    console.error("❌ 无法读取部署地址文件:", deploymentPath);
    process.exit(1);
  }

  // 连接到合约
  const TokenA = await ethers.getContractAt("contracts/contract/TestToken.sol:TestToken", addresses.tokenA);
  const TokenB = await ethers.getContractAt("contracts/contract/TestToken.sol:TestToken", addresses.tokenB);
  const AMM = await ethers.getContractAt("contracts/contract/MiniAMM.sol:MiniAMM", addresses.miniAMM);

  // 获取池子状态
  const reserves = await AMM.getReserves();
  const totalSupply = await AMM.totalSupply();
  const tokenASymbol = await TokenA.symbol();
  const tokenBSymbol = await TokenB.symbol();

  // 计算 TVL（假设两个代币价值相等）
  const reserveA = parseFloat(ethers.utils.formatEther(reserves[0]));
  const reserveB = parseFloat(ethers.utils.formatEther(reserves[1]));
  const tvl = (reserveA + reserveB).toFixed(2);

  // 计算价格
  const price = reserveA > 0 ? (reserveB / reserveA).toFixed(6) : "N/A";

  console.log("📊 池子信息");
  console.log("-".repeat(50));
  console.log(`合约地址: ${addresses.miniAMM}`);
  console.log(`网络: ${hre.network.name}`);
  console.log("");

  console.log("💰 储备量");
  console.log("-".repeat(50));
  console.log(`${tokenASymbol} 储备: ${reserveA.toLocaleString()}`);
  console.log(`${tokenBSymbol} 储备: ${reserveB.toLocaleString()}`);
  console.log(`总锁定价值 (TVL): $${tvl}`);
  console.log("");

  console.log("💎 LP Token");
  console.log("-".repeat(50));
  console.log(`总供应: ${ethers.utils.formatEther(totalSupply)}`);
  console.log("");

  console.log("💱 价格");
  console.log("-".repeat(50));
  console.log(`1 ${tokenASymbol} = ${price} ${tokenBSymbol}`);
  console.log("");

  // 检查池子状态
  if (reserves[0].eq(0) || reserves[1].eq(0)) {
    console.log("⚠️  警告: 池子尚未初始化！");
    console.log("请运行: npx hardhat run scripts/initialize-pool.js --network " + hre.network.name);
  } else {
    console.log("✅ 池子已初始化并准备就绪");
  }

  console.log("");
  console.log("=================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 检查失败:", error);
    process.exit(1);
  });
