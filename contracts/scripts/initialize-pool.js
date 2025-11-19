const hre = require("hardhat");
require("@nomicfoundation/hardhat-ethers");
const ethers = hre.ethers;

async function main() {
  console.log("\n=================================");
  console.log("池子初始化脚本");
  console.log("=================================\n");

  const [deployer] = await ethers.getSigners();
  console.log("使用账户:", deployer.address);
  console.log("账户余额:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // 从部署文件读取合约地址
  const network = hre.network.name;
  const deploymentPath = `../deployments/${network}-latest.json`;
  let addresses;
  
  try {
    addresses = require(deploymentPath);
  } catch (error) {
    console.error("❌ 无法读取部署地址文件:", deploymentPath);
    console.error("请先运行部署脚本: npx hardhat run scripts/deploy.js");
    process.exit(1);
  }

  console.log("合约地址:");
  console.log("- TokenA:", addresses.contracts.tokenA);
  console.log("- TokenB:", addresses.contracts.tokenB);
  console.log("- AMM:", addresses.contracts.miniAMM);
  console.log("");

  // 连接到合约
  const TokenA = await ethers.getContractAt("MockERC20", addresses.contracts.tokenA);
  const TokenB = await ethers.getContractAt("MockERC20", addresses.contracts.tokenB);
  const AMM = await ethers.getContractAt("MiniAMM", addresses.contracts.miniAMM);

  // 步骤 1: 检查当前余额
  console.log("步骤 1: 检查当前代币余额");
  console.log("-".repeat(40));
  const balanceA = await TokenA.balanceOf(deployer.address);
  const balanceB = await TokenB.balanceOf(deployer.address);
  console.log("TKA 余额:", ethers.formatEther(balanceA));
  console.log("TKB 余额:", ethers.formatEther(balanceB));
  console.log("");

  // 步骤 2: 铸造代币（如果余额不足）
  const requiredAmount = ethers.parseEther("100000");
  
  if (balanceA < requiredAmount) {
    console.log("步骤 2a: 铸造 TKA 代币");
    console.log("-".repeat(40));
    const mintTx = await TokenA.mint(deployer.address, requiredAmount);
    await mintTx.wait();
    console.log("✓ 铸造 100,000 TKA");
    console.log("交易哈希:", mintTx.hash);
    console.log("");
  } else {
    console.log("✓ TKA 余额充足，跳过铸造\n");
  }

  if (balanceB < requiredAmount) {
    console.log("步骤 2b: 铸造 TKB 代币");
    console.log("-".repeat(40));
    const mintTx = await TokenB.mint(deployer.address, requiredAmount);
    await mintTx.wait();
    console.log("✓ 铸造 100,000 TKB");
    console.log("交易哈希:", mintTx.hash);
    console.log("");
  } else {
    console.log("✓ TKB 余额充足，跳过铸造\n");
  }

  // // 步骤 3: 批准 AMM 合约
  // console.log("步骤 3: 批准 AMM 合约使用代币");
  // console.log("-".repeat(40));
  
  // const approveAmount = ethers.parseEther("50000");
  
  // console.log("批准 TKA...");
  // const approveTxA = await TokenA.approve(addresses.contracts.miniAMM, approveAmount);
  // await approveTxA.wait();
  // console.log("✓ TKA 已批准");
  
  // console.log("批准 TKB...");
  // const approveTxB = await TokenB.approve(addresses.contracts.miniAMM, approveAmount);
  // await approveTxB.wait();
  // console.log("✓ TKB 已批准");
  // console.log("");

  // // 步骤 4: 检查当前池子状态
  // console.log("步骤 4: 检查当前池子状态");
  // console.log("-".repeat(40));
  // const reserves = await AMM.getReserves();
  // console.log("当前 TKA 储备:", ethers.formatEther(reserves[0]));
  // console.log("当前 TKB 储备:", ethers.formatEther(reserves[1]));
  // console.log("");

  // // 步骤 5: 添加初始流动性
  // const liquidityAmountA = ethers.parseEther("10000");
  // const liquidityAmountB = ethers.parseEther("10000");

  // console.log("步骤 5: 添加初始流动性");
  // console.log("-".repeat(40));
  // console.log("将添加:");
  // console.log("- TKA:", ethers.formatEther(liquidityAmountA));
  // console.log("- TKB:", ethers.formatEther(liquidityAmountB));
  // console.log("");

  // console.log("正在添加流动性...");
  // const addLiquidityTx = await AMM.addLiquidity(
  //   liquidityAmountA,
  //   liquidityAmountB
  // );
  
  // console.log("等待交易确认...");
  // const receipt = await addLiquidityTx.wait();
  // console.log("✓ 流动性添加成功！");
  // console.log("交易哈希:", addLiquidityTx.hash);
  // console.log("Gas 使用:", receipt.gasUsed.toString());
  // console.log("");

  // // 步骤 6: 验证结果
  // console.log("步骤 6: 验证初始化结果");
  // console.log("-".repeat(40));
  
  // const newReserves = await AMM.getReserves();
  // console.log("新的储备量:");
  // console.log("- TKA 储备:", ethers.formatEther(newReserves[0]));
  // console.log("- TKB 储备:", ethers.formatEther(newReserves[1]));
  
  // const lpBalance = await AMM.balanceOf(deployer.address);
  // console.log("- LP Token 余额:", ethers.formatEther(lpBalance));
  
  // const totalSupply = await AMM.totalSupply();
  // console.log("- 总 LP 供应:", ethers.formatEther(totalSupply));
  
  // // 计算价格
  // if (newReserves[0] > 0n && newReserves[1] > 0n) {
  //   const price = parseFloat(ethers.formatEther(newReserves[1])) / 
  //                 parseFloat(ethers.formatEther(newReserves[0]));
  //   console.log("- 当前价格: 1 TKA =", price.toFixed(3), "TKB");
  // }
  
  // console.log("");

  // // 完成
  // console.log("=================================");
  // console.log("✅ 池子初始化完成！");
  // console.log("=================================\n");
  
  // console.log("下一步:");
  // console.log("1. 访问前端应用查看池子状态");
  // console.log("2. 尝试进行小额交换测试");
  // console.log("3. 等待 Bot 自动复投（如果已启动）");
  // console.log("4. 在 Etherscan 查看合约: https://sepolia.etherscan.io/address/" + addresses.miniAMM);
  // console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 初始化失败:", error);
    process.exit(1);
  });
