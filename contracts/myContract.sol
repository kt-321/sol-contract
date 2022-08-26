pragma solidity >=0.7.0 <0.9.0;

import 'erc721a/contracts/ERC721A.sol';
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721A, Ownable {
    string baseURI;
    string public baseExtension = ".json";
    // TODO
    address public constant withdrawAddress =0x0000000000000000000000000000000000000000;

    uint256 public mintCost = 0;
    uint256 public burnMintCost = 0;
    uint256 public maxSupply = 1000;
    uint256 public maxBurnMint = 200;

    uint256 public maxMintAmount = 5;
    uint256 public maxMintAmountForWhitelist = 10;
    
    bool public paused = true;
    bool public burnMintPaused = true;
    bool public onlyWhitelisted = false;


    mapping(address => uint256) public whitelistCounts;

    constructor(
    ) ERC721A("My NFT", "MNT") {
        //TODO
        setBaseURI('ipfs://');
        _safeMint(withdrawAddress, 10);
    }

    function getMaxMintAmount() public view returns (uint256) {
        if (onlyWhitelisted == true) {
            return maxMintAmountForWhitelist;
        } else {
            return maxMintAmount;
        }
    }

    function getActualMaxMintAmount(address value) public view returns (uint256) {
        if (onlyWhitelisted == true) {
            uint256 whitelistCount = getWhitelistCount(value);
            if (whitelistCount > maxMintAmountForWhitelist) {
                return maxMintAmountForWhitelist;
            } else {
                return whitelistCount;
            }
        } else {
            return maxMintAmount;
        }
    }

    function getTotalBurned() public view returns (uint256) {
        return _totalBurned();
    }

    function getWhitelistCount(address value) public view returns (uint256) {
        return whitelistCounts[value];
    }

    function addWhitelists(address[] memory addresses, uint256[] memory counts) public onlyOwner {
        require(addresses.length == counts.length);
        for (uint256 i = 0; i < addresses.length; i++) {
            whitelistCounts[addresses[i]] = counts[i];
        }
    }

    modifier mintPausable() {
        require(!paused, "mint is paused");
        _;
    }

    modifier burnMintPausable() {
        require(!burnMintPaused, "burn mint is paused");
        _;
    }
    modifier verifyMaxSupply(uint256 quantity) {
        require(quantity + totalSupply() <= maxSupply, "burn mint is paused");
        _;
    }
    modifier verifyMaxAmountAtOnce(uint256 quantity) {
        require(quantity <= getMaxMintAmount(), "claim is over max quantity at once");
        _;
    }
    modifier enoughEth(uint256 quantity) {
        require(msg.value >= mintCost * quantity, "not enough eth");
        _;
    }
    
    modifier whitelist(uint256 quantity) {
        if (onlyWhitelisted) {
            require(whitelistCounts[msg.sender] != 0, "sender is not whitelisted");
            require(whitelistCounts[msg.sender] >= quantity, "over whitelisted count");
        }
        _;
    }

    modifier verifyTotalBurn(uint256 quantity) {
        require(quantity + _totalBurned() <= maxBurnMint, "over total burn cost");
        _;
    }

    function claimWhitelist(uint256 quantity) private {
        if (onlyWhitelisted) {
            whitelistCounts[msg.sender] = whitelistCounts[msg.sender] - quantity;
        }
    }

    function mint(uint256 quantity) external payable 
        mintPausable
        verifyMaxSupply(quantity)
        verifyMaxAmountAtOnce(quantity)
        enoughEth(quantity)
        whitelist(quantity)
        {
        claimWhitelist(quantity);
        _safeMint(msg.sender, quantity);
    }

    function burnMint(uint256[] memory burnTokenIds) external payable
        burnMintPausable
        verifyMaxAmountAtOnce(burnTokenIds.length)
        enoughEth(burnTokenIds.length)
        verifyTotalBurn(burnTokenIds.length)
        whitelist(burnTokenIds.length)
    {
        claimWhitelist(burnTokenIds.length);
        for (uint256 i = 0; i < burnTokenIds.length; i++) {
            uint256 tokenId = burnTokenIds[i];
            require(_msgSender() == ownerOf(tokenId));
            _burn(tokenId);
        }
        // mint new nft
        _safeMint(_msgSender(), burnTokenIds.length);
    }

    function setMaxSupply(uint256 _value) public onlyOwner {
        maxSupply = _value;
    }

    function setMaxBurnMint(uint256 _value) public onlyOwner {
        maxBurnMint = _value;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        return string(abi.encodePacked(ERC721A.tokenURI(tokenId), baseExtension));
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function setMintCost(uint256 _newCost) public onlyOwner {
        mintCost = _newCost;
    }

    function setBurnMintCost(uint256 _value) public onlyOwner {
        burnMintCost = _value;
    }


    function setOnlyWhitelisted(bool _state) public onlyOwner {
        onlyWhitelisted = _state;
    }
    
    function setMaxMintAmount(uint256 _newMaxMintAmount) public onlyOwner {
        maxMintAmount = _newMaxMintAmount;
    }
    
    function setMaxMintAmountForWhiteList(uint256 _value) public onlyOwner {
        maxMintAmountForWhitelist = _value;
    }

    function setBaseExtension(string memory _value) public onlyOwner {
        baseExtension = _value;
    }

    function pause(bool _state) public onlyOwner {
        paused = _state;
    }

    function burnMintPause(bool _value) public onlyOwner {
        burnMintPaused = _value;
    }

    function exists(uint256 tokenId) public view virtual returns (bool){
        return _exists(tokenId);
    }

    function withdraw() public payable onlyOwner {
        (bool os, ) = payable(withdrawAddress).call{value: address(this).balance}("");
        require(os);
    }

    function _startTokenId() internal view virtual override returns (uint256){
        return 1;
    }
}