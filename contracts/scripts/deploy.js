const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("开始部署合约...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("部署账户:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("账户余额:", hre.ethers.formatEther(balance), "ETH");

  console.log("\n1. 部署 Mock Tokens...");
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  
  const initialSupply = hre.ethers.parseEther("1000000");
  
  const tokenA = await MockERC20.deploy("Token A", "TKA", initialSupply);
  await tokenA.waitForDeployment();
  const tokenAAddress = await tokenA.getAddress();
  console.log("Token A 部署到:", tokenAAddress);

  const tokenB = await MockERC20.deploy("Token B", "TKB", initialSupply);
  await tokenB.waitForDeployment();
  const tokenBAddress = await tokenB.getAddress();
  console.log("Token B 部署到:", tokenBAddress);

  console.log("\n2. 部署 MiniAMM...");
  const MiniAMM = await hre.ethers.getContractFactory("MiniAMM");
  const miniAMM = await MiniAMM.deploy(tokenAAddress, tokenBAddress);
  await miniAMM.waitForDeployment();
  const miniAMMAddress = await miniAMM.getAddress();
  console.log("MiniAMM 部署到:", miniAMMAddress);

  console.log("\n3. 初始化流动性...");
  const liquidityAmountA = hre.ethers.parseEther("10000");
  const liquidityAmountB = hre.ethers.parseEther("10000");

  console.log("授权 Token A...");
  let tx = await tokenA.approve(miniAMMAddress, liquidityAmountA);
  await tx.wait();

  console.log("授权 Token B...");
  tx = await tokenB.approve(miniAMMAddress, liquidityAmountB);
  await tx.wait();

  console.log("添加初始流动性...");
  tx = await miniAMM.addLiquidity(liquidityAmountA, liquidityAmountB);
  await tx.wait();

  const reserves = await miniAMM.getReserves();
  console.log("当前储备量:");
  console.log("  Reserve A:", hre.ethers.formatEther(reserves[0]));
  console.log("  Reserve B:", hre.ethers.formatEther(reserves[1]));

  const deployedContracts = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    contracts: {
      tokenA: tokenAAddress,
      tokenB: tokenBAddress,
      miniAMM: miniAMMAddress
    },
    timestamp: new Date().toISOString()
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `${hre.network.name}-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deployedContracts, null, 2));
  
  const latestFilepath = path.join(deploymentsDir, `${hre.network.name}-latest.json`);
  fs.writeFileSync(latestFilepath, JSON.stringify(deployedContracts, null, 2));

  console.log("\n部署信息已保存到:", filepath);
  console.log("\n✅ 部署完成!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
