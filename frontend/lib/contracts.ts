export const MINI_AMM_ABI = [
  'function getReserves() external view returns (uint256, uint256)',
  'function getFees() external view returns (uint256, uint256)',
  'function getPrice() external view returns (uint256)',
  'function getAmountOut(uint256 amountIn, bool AtoB) external view returns (uint256)',
  'function addLiquidity(uint256 amountA, uint256 amountB) external returns (uint256 liquidity)',
  'function removeLiquidity(uint256 liquidity) external returns (uint256 amountA, uint256 amountB)',
  'function swap(uint256 amountIn, bool AtoB) external returns (uint256 amountOut)',
  'function balanceOf(address account) external view returns (uint256)',
  'function totalSupply() external view returns (uint256)',
  'event Swap(address indexed user, uint256 amountIn, uint256 amountOut, bool AtoB, uint256 timestamp)',
  'event Mint(address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidity, uint256 timestamp)',
  'event Burn(address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidity, uint256 timestamp)',
] as const

export const ERC20_ABI = [
  'function balanceOf(address account) external view returns (uint256)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function transfer(address to, uint256 amount) external returns (bool)',
] as const

export const CONTRACTS = {
  miniAMM: process.env.NEXT_PUBLIC_MINI_AMM_ADDRESS || '',
  tokenA: process.env.NEXT_PUBLIC_TOKEN_A_ADDRESS || '',
  tokenB: process.env.NEXT_PUBLIC_TOKEN_B_ADDRESS || '',
}
