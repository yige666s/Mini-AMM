import { BigInt, BigDecimal, Address, ethereum } from "@graphprotocol/graph-ts";
import {
  Swap as SwapEvent,
  Mint as MintEvent,
  Burn as BurnEvent,
  FeeCollected as FeeCollectedEvent,
  Rebalance as RebalanceEvent,
  MiniAMM
} from "../generated/MiniAMM/MiniAMM";
import {
  Pool,
  Swap,
  Mint,
  Burn,
  FeeCollection,
  RebalanceAction,
  BotAction,
  User,
  PoolDayData,
  PoolHourData
} from "../generated/schema";

const POOL_ID = "1";
const ZERO_BI = BigInt.fromI32(0);
const ONE_BI = BigInt.fromI32(1);

function loadOrCreatePool(event: ethereum.Event): Pool {
  let pool = Pool.load(POOL_ID);
  
  if (pool == null) {
    pool = new Pool(POOL_ID);
    let contract = MiniAMM.bind(event.address);
    
    pool.tokenA = contract.tokenA();
    pool.tokenB = contract.tokenB();
    pool.reserveA = ZERO_BI;
    pool.reserveB = ZERO_BI;
    pool.price = BigDecimal.fromString("0");
    pool.totalLiquidity = ZERO_BI;
    pool.feeA = ZERO_BI;
    pool.feeB = ZERO_BI;
    pool.swapCount = ZERO_BI;
    pool.updatedAt = event.block.timestamp;
  }
  
  return pool;
}

function updatePoolReserves(pool: Pool, event: ethereum.Event): void {
  let contract = MiniAMM.bind(event.address);
  let reserves = contract.getReserves();
  
  pool.reserveA = reserves.value0;
  pool.reserveB = reserves.value1;
  
  if (pool.reserveA.gt(ZERO_BI)) {
    pool.price = pool.reserveB.toBigDecimal().div(pool.reserveA.toBigDecimal());
  }
  
  pool.totalLiquidity = contract.totalSupply();
  
  let fees = contract.getFees();
  pool.feeA = fees.value0;
  pool.feeB = fees.value1;
  
  pool.updatedAt = event.block.timestamp;
  pool.save();
}

function loadOrCreateUser(address: Address): User {
  let user = User.load(address.toHexString());
  
  if (user == null) {
    user = new User(address.toHexString());
    user.address = address;
    user.liquidityBalance = ZERO_BI;
    user.swapCount = ZERO_BI;
    user.totalValueAdded = ZERO_BI;
    user.totalValueRemoved = ZERO_BI;
    user.save();
  }
  
  return user;
}

function updateDayData(pool: Pool, event: ethereum.Event, volumeA: BigInt, volumeB: BigInt): void {
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
  let dayDataID = POOL_ID + "-" + dayID.toString();
  
  let dayData = PoolDayData.load(dayDataID);
  
  if (dayData == null) {
    dayData = new PoolDayData(dayDataID);
    dayData.pool = pool.id;
    dayData.date = dayStartTimestamp;
    dayData.volumeA = ZERO_BI;
    dayData.volumeB = ZERO_BI;
    dayData.feesCollectedA = ZERO_BI;
    dayData.feesCollectedB = ZERO_BI;
    dayData.swapCount = ZERO_BI;
    dayData.reserveA = ZERO_BI;
    dayData.reserveB = ZERO_BI;
  }
  
  dayData.volumeA = dayData.volumeA.plus(volumeA);
  dayData.volumeB = dayData.volumeB.plus(volumeB);
  dayData.swapCount = dayData.swapCount.plus(ONE_BI);
  dayData.reserveA = pool.reserveA;
  dayData.reserveB = pool.reserveB;
  dayData.save();
}

function updateHourData(pool: Pool, event: ethereum.Event, volumeA: BigInt, volumeB: BigInt): void {
  let timestamp = event.block.timestamp.toI32();
  let hourIndex = timestamp / 3600;
  let hourStartTimestamp = hourIndex * 3600;
  let hourDataID = POOL_ID + "-" + hourIndex.toString();
  
  let hourData = PoolHourData.load(hourDataID);
  
  if (hourData == null) {
    hourData = new PoolHourData(hourDataID);
    hourData.pool = pool.id;
    hourData.hour = hourStartTimestamp;
    hourData.volumeA = ZERO_BI;
    hourData.volumeB = ZERO_BI;
    hourData.feesCollectedA = ZERO_BI;
    hourData.feesCollectedB = ZERO_BI;
    hourData.swapCount = ZERO_BI;
    hourData.reserveA = ZERO_BI;
    hourData.reserveB = ZERO_BI;
  }
  
  hourData.volumeA = hourData.volumeA.plus(volumeA);
  hourData.volumeB = hourData.volumeB.plus(volumeB);
  hourData.swapCount = hourData.swapCount.plus(ONE_BI);
  hourData.reserveA = pool.reserveA;
  hourData.reserveB = pool.reserveB;
  hourData.save();
}

export function handleSwap(event: SwapEvent): void {
  let pool = loadOrCreatePool(event);
  
  let swap = new Swap(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  swap.pool = pool.id;
  swap.user = event.params.user;
  swap.amountIn = event.params.amountIn;
  swap.amountOut = event.params.amountOut;
  swap.AtoB = event.params.AtoB;
  swap.timestamp = event.params.timestamp;
  swap.transactionHash = event.transaction.hash;
  swap.save();
  
  pool.swapCount = pool.swapCount.plus(ONE_BI);
  updatePoolReserves(pool, event);
  
  let user = loadOrCreateUser(event.params.user);
  user.swapCount = user.swapCount.plus(ONE_BI);
  user.save();
  
  let volumeA = event.params.AtoB ? event.params.amountIn : event.params.amountOut;
  let volumeB = event.params.AtoB ? event.params.amountOut : event.params.amountIn;
  updateDayData(pool, event, volumeA, volumeB);
  updateHourData(pool, event, volumeA, volumeB);
}

export function handleMint(event: MintEvent): void {
  let pool = loadOrCreatePool(event);
  
  let mint = new Mint(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  mint.pool = pool.id;
  mint.provider = event.params.provider;
  mint.amountA = event.params.amountA;
  mint.amountB = event.params.amountB;
  mint.liquidity = event.params.liquidity;
  mint.timestamp = event.params.timestamp;
  mint.transactionHash = event.transaction.hash;
  mint.save();
  
  updatePoolReserves(pool, event);
  
  let user = loadOrCreateUser(event.params.provider);
  user.liquidityBalance = user.liquidityBalance.plus(event.params.liquidity);
  user.totalValueAdded = user.totalValueAdded.plus(event.params.amountA).plus(event.params.amountB);
  user.save();
  
  let contract = MiniAMM.bind(event.address);
  let bot = contract.bot();
  
  if (event.params.provider.equals(bot)) {
    let botAction = new BotAction(
      event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
    );
    botAction.pool = pool.id;
    botAction.action = "COMPOUND";
    botAction.amountA = event.params.amountA;
    botAction.amountB = event.params.amountB;
    botAction.timestamp = event.params.timestamp;
    botAction.transactionHash = event.transaction.hash;
    botAction.save();
  }
}

export function handleBurn(event: BurnEvent): void {
  let pool = loadOrCreatePool(event);
  
  let burn = new Burn(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  burn.pool = pool.id;
  burn.provider = event.params.provider;
  burn.amountA = event.params.amountA;
  burn.amountB = event.params.amountB;
  burn.liquidity = event.params.liquidity;
  burn.timestamp = event.params.timestamp;
  burn.transactionHash = event.transaction.hash;
  burn.save();
  
  updatePoolReserves(pool, event);
  
  let user = loadOrCreateUser(event.params.provider);
  user.liquidityBalance = user.liquidityBalance.minus(event.params.liquidity);
  user.totalValueRemoved = user.totalValueRemoved.plus(event.params.amountA).plus(event.params.amountB);
  user.save();
}

export function handleFeeCollected(event: FeeCollectedEvent): void {
  let pool = loadOrCreatePool(event);
  
  let feeCollection = new FeeCollection(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  feeCollection.pool = pool.id;
  feeCollection.feeA = event.params.feeA;
  feeCollection.feeB = event.params.feeB;
  feeCollection.timestamp = event.params.timestamp;
  feeCollection.transactionHash = event.transaction.hash;
  feeCollection.save();
  
  updatePoolReserves(pool, event);
}

export function handleRebalance(event: RebalanceEvent): void {
  let pool = loadOrCreatePool(event);
  
  let rebalance = new RebalanceAction(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  rebalance.pool = pool.id;
  rebalance.amountIn = event.params.amountIn;
  rebalance.amountOut = event.params.amountOut;
  rebalance.AtoB = event.params.AtoB;
  rebalance.timestamp = event.params.timestamp;
  rebalance.transactionHash = event.transaction.hash;
  rebalance.save();
  
  updatePoolReserves(pool, event);
  
  let botAction = new BotAction(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  botAction.pool = pool.id;
  botAction.action = "REBALANCE";
  botAction.amountA = event.params.AtoB ? event.params.amountIn : event.params.amountOut;
  botAction.amountB = event.params.AtoB ? event.params.amountOut : event.params.amountIn;
  botAction.timestamp = event.params.timestamp;
  botAction.transactionHash = event.transaction.hash;
  botAction.save();
}
