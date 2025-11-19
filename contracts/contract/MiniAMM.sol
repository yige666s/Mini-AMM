// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./LPToken.sol";
import "./interfaces/IERC20.sol";

contract MiniAMM is LPToken {
    IERC20 public immutable tokenA;
    IERC20 public immutable tokenB;
    
    uint256 public reserveA;
    uint256 public reserveB;
    
    uint256 public feeA;
    uint256 public feeB;
    
    address public bot;
    bool private locked;
    
    uint256 public constant MINIMUM_LIQUIDITY = 1000;
    uint256 public constant FEE_DENOMINATOR = 1000;
    uint256 public constant FEE_NUMERATOR = 997;
    
    event Swap(
        address indexed user,
        uint256 amountIn,
        uint256 amountOut,
        bool AtoB,
        uint256 timestamp
    );
    
    event Mint(
        address indexed provider,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidity,
        uint256 timestamp
    );
    
    event Burn(
        address indexed provider,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidity,
        uint256 timestamp
    );
    
    event FeeCollected(
        uint256 feeA,
        uint256 feeB,
        uint256 timestamp
    );
    
    event Rebalance(
        uint256 amountIn,
        uint256 amountOut,
        bool AtoB,
        uint256 timestamp
    );
    
    event BotUpdated(address indexed oldBot, address indexed newBot);
    
    modifier noReentrant() {
        require(!locked, "No reentrant");
        locked = true;
        _;
        locked = false;
    }
    
    modifier onlyBot() {
        require(msg.sender == bot, "Only bot");
        _;
    }
    
    constructor(address _tokenA, address _tokenB) {
        require(_tokenA != address(0) && _tokenB != address(0), "Invalid token");
        require(_tokenA != _tokenB, "Same token");
        
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
        bot = msg.sender;
    }
    
    function setBot(address _bot) external {
        require(msg.sender == bot, "Only current bot");
        require(_bot != address(0), "Invalid bot address");
        emit BotUpdated(bot, _bot);
        bot = _bot;
    }
    
    function addLiquidity(
        uint256 amountA,
        uint256 amountB
    ) external noReentrant returns (uint256 liquidity) {
        require(amountA > 0 && amountB > 0, "Invalid amounts");
        
        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);
        
        uint256 _totalSupply = totalSupply;
        
        if (_totalSupply == 0) {
            liquidity = sqrt(amountA * amountB) - MINIMUM_LIQUIDITY;
            _mint(address(1), MINIMUM_LIQUIDITY);
        } else {
            liquidity = min(
                (amountA * _totalSupply) / reserveA,
                (amountB * _totalSupply) / reserveB
            );
        }
        
        require(liquidity > 0, "Insufficient liquidity minted");
        _mint(msg.sender, liquidity);
        
        _update(
            reserveA + amountA,
            reserveB + amountB
        );
        
        emit Mint(msg.sender, amountA, amountB, liquidity, block.timestamp);
    }
    
    function removeLiquidity(
        uint256 liquidity
    ) external noReentrant returns (uint256 amountA, uint256 amountB) {
        require(liquidity > 0, "Invalid liquidity");
        
        uint256 _totalSupply = totalSupply;
        
        amountA = (liquidity * reserveA) / _totalSupply;
        amountB = (liquidity * reserveB) / _totalSupply;
        
        require(amountA > 0 && amountB > 0, "Insufficient liquidity burned");
        
        _burn(msg.sender, liquidity);
        
        tokenA.transfer(msg.sender, amountA);
        tokenB.transfer(msg.sender, amountB);
        
        _update(
            reserveA - amountA,
            reserveB - amountB
        );
        
        emit Burn(msg.sender, amountA, amountB, liquidity, block.timestamp);
    }
    
    function swap(
        uint256 amountIn,
        bool AtoB
    ) external noReentrant returns (uint256 amountOut) {
        require(amountIn > 0, "Invalid amount");
        
        (uint256 reserveIn, uint256 reserveOut) = AtoB
            ? (reserveA, reserveB)
            : (reserveB, reserveA);
        
        uint256 amountInWithFee = amountIn * FEE_NUMERATOR;
        amountOut = (reserveOut * amountInWithFee) / 
                    (reserveIn * FEE_DENOMINATOR + amountInWithFee);
        
        require(amountOut > 0, "Insufficient output amount");
        require(amountOut < reserveOut, "Insufficient liquidity");
        
        if (AtoB) {
            tokenA.transferFrom(msg.sender, address(this), amountIn);
            tokenB.transfer(msg.sender, amountOut);
            
            uint256 fee = (amountIn * 3) / FEE_DENOMINATOR;
            feeA += fee;
            
            _update(
                reserveA + amountIn,
                reserveB - amountOut
            );
        } else {
            tokenB.transferFrom(msg.sender, address(this), amountIn);
            tokenA.transfer(msg.sender, amountOut);
            
            uint256 fee = (amountIn * 3) / FEE_DENOMINATOR;
            feeB += fee;
            
            _update(
                reserveA - amountOut,
                reserveB + amountIn
            );
        }
        
        emit Swap(msg.sender, amountIn, amountOut, AtoB, block.timestamp);
    }
    
    function compoundFees() external onlyBot noReentrant returns (uint256 liquidity) {
        require(feeA > 0 || feeB > 0, "No fees to compound");
        
        uint256 compoundA = feeA;
        uint256 compoundB = feeB;
        
        if (compoundA > 0 && compoundB > 0) {
            uint256 optimalA = (compoundA * reserveB) / reserveA;
            
            if (optimalA <= compoundB) {
                compoundB = optimalA;
            } else {
                compoundA = (compoundB * reserveA) / reserveB;
            }
        } else if (compoundA > 0) {
            // 只有A侧有手续费，保持A侧，B侧设为0
            compoundB = 0;
        } else if (compoundB > 0) {
            // 只有B侧有手续费，保持B侧，A侧设为0
            compoundA = 0;
        }
        
        require(compoundA > 0 || compoundB > 0, "Insufficient amounts");
        
        emit FeeCollected(compoundA, compoundB, block.timestamp);
        
        feeA -= compoundA;
        feeB -= compoundB;
        
        uint256 _totalSupply = totalSupply;
        if (compoundA > 0 && compoundB > 0) {
            // 两侧都有手续费，使用标准计算
            liquidity = min(
                (compoundA * _totalSupply) / reserveA,
                (compoundB * _totalSupply) / reserveB
            );
        } else if (compoundA > 0) {
            // 只有A侧手续费
            liquidity = (compoundA * _totalSupply) / reserveA;
        } else if (compoundB > 0) {
            // 只有B侧手续费
            liquidity = (compoundB * _totalSupply) / reserveB;
        }
        
        require(liquidity > 0, "Insufficient liquidity minted");
        _mint(bot, liquidity);
        
        _update(
            reserveA + compoundA,
            reserveB + compoundB
        );
        
        emit Mint(bot, compoundA, compoundB, liquidity, block.timestamp);
    }
    
    function rebalance(uint256 amountIn, bool AtoB) external onlyBot noReentrant returns (uint256 amountOut) {
        require(amountIn > 0, "Invalid amount");
        
        (uint256 reserveIn, uint256 reserveOut) = AtoB
            ? (reserveA, reserveB)
            : (reserveB, reserveA);
        
        uint256 amountInWithFee = amountIn * FEE_NUMERATOR;
        amountOut = (reserveOut * amountInWithFee) / 
                    (reserveIn * FEE_DENOMINATOR + amountInWithFee);
        
        require(amountOut > 0, "Insufficient output amount");
        require(amountOut < reserveOut, "Insufficient liquidity");
        
        if (AtoB) {
            uint256 fee = (amountIn * 3) / FEE_DENOMINATOR;
            feeA += fee;
            
            _update(
                reserveA + amountIn,
                reserveB - amountOut
            );
        } else {
            uint256 fee = (amountIn * 3) / FEE_DENOMINATOR;
            feeB += fee;
            
            _update(
                reserveA - amountOut,
                reserveB + amountIn
            );
        }
        
        emit Rebalance(amountIn, amountOut, AtoB, block.timestamp);
    }
    
    function getReserves() external view returns (uint256, uint256) {
        return (reserveA, reserveB);
    }
    
    function getFees() external view returns (uint256, uint256) {
        return (feeA, feeB);
    }
    
    function getPrice() external view returns (uint256) {
        require(reserveA > 0, "No liquidity");
        return (reserveB * 1e18) / reserveA;
    }
    
    function getAmountOut(uint256 amountIn, bool AtoB) external view returns (uint256) {
        require(amountIn > 0, "Invalid amount");
        
        (uint256 reserveIn, uint256 reserveOut) = AtoB
            ? (reserveA, reserveB)
            : (reserveB, reserveA);
        
        uint256 amountInWithFee = amountIn * FEE_NUMERATOR;
        return (reserveOut * amountInWithFee) / 
               (reserveIn * FEE_DENOMINATOR + amountInWithFee);
    }
    
    function _update(uint256 _reserveA, uint256 _reserveB) private {
        reserveA = _reserveA;
        reserveB = _reserveB;
    }
    
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
    
    function min(uint256 x, uint256 y) internal pure returns (uint256) {
        return x < y ? x : y;
    }
}
